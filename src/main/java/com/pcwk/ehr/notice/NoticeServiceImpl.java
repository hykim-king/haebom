package com.pcwk.ehr.notice;

import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final Logger log = LogManager.getLogger(getClass());
    private final NoticeMapper noticeMapper;
    private final AttachFileMapper attachFileMapper;  // XML의 namespace와 일치하는 Mapper
    private static final String BOARD_CLSF  = "notice";  // BOARD_CLSF 값

    private static final String UPLOAD_PATH = System.getProperty("user.home") + "/upload/notice/";


    @Override public int    getUserIdByEmail(String email) { return noticeMapper.getUserIdByEmail(email); }
    @Override public String checkAdminAuth(String email)   { return noticeMapper.checkAdminAuth(email); }
    @Override public UserVO getLoginUserInfo(String email) { return noticeMapper.getLoginUserInfo(email); }

    // ──────────────────────────────────────────────
    // 파일 물리 저장 + attach_file 테이블 INSERT
    // XML의 doSave 사용
    // ──────────────────────────────────────────────
    private void saveAttachFiles(List<MultipartFile> files, int boardId) {
        if (files == null || files.isEmpty()) return;

        File uploadDir = new File(UPLOAD_PATH);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String originalName = file.getOriginalFilename();
            String savedName    = UUID.randomUUID() + "_" + originalName;
            File   saveFile     = new File(UPLOAD_PATH, savedName);

            try {
                file.transferTo(saveFile);
                log.info("파일 저장 성공: {}", savedName);

                // 확장자로 FILE_CLSF 판별
                String ext = (originalName != null && originalName.contains("."))
                        ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                        : "file";
                String fileClsf = switch (ext) {
                    case "jpg", "jpeg", "png", "gif", "webp" -> "img";
                    case "xls", "xlsx"                        -> "exel";
                    case "hwp"                                -> "hwp";
                    default                                   -> "file";
                };

                // AttachFileVO 세팅 후 XML doSave 호출
                AttachFileVO fileVO = new AttachFileVO();
                fileVO.setFileClsf(fileClsf);
                fileVO.setFilePathNm(UPLOAD_PATH + savedName);
                fileVO.setFileNm(originalName);
                fileVO.setBoardClsf(BOARD_CLSF);
                fileVO.setBoardId(boardId);

                attachFileMapper.doSave(fileVO);  // XML의 doSave

            } catch (IOException e) {
                log.error("파일 저장 실패: {}", e.getMessage());
            }
        }
    }

    // ──────────────────────────────────────────────
    // 파일 목록 조회
    // XML의 getFileList 사용
    // ──────────────────────────────────────────────
    private List<AttachFileVO> getFileList(int boardId) {
        AttachFileVO param = new AttachFileVO();
        param.setBoardClsf(BOARD_CLSF);
        param.setBoardId(boardId);
        return attachFileMapper.getFileList(param);  // XML의 getFileList
    }

    // ──────────────────────────────────────────────
    // 제목 이모지 + 📎 처리
    // ──────────────────────────────────────────────
    private void processTitle(NoticeVO inVO, boolean hasFile) {
        String title = inVO.getNtcTtl();

        if (title.endsWith("!!") && !title.endsWith("!!!")) {
            title = "⭐ [중요] " + title.substring(0, title.length() - 2).trim();
        } else if (title.endsWith("!") && !title.endsWith("!!")) {
            title = "🚨 [긴급] " + title.substring(0, title.length() - 1).trim();
        }

        // 파일 있으면 📎 추가, 없으면 기존 📎 제거
        if (hasFile && !title.endsWith(" 📎")) {
            title = title + " 📎";
        } else if (!hasFile && title.endsWith(" 📎")) {
            title = title.substring(0, title.length() - 2).trim();
        }

        inVO.setNtcTtl(title);
    }

    @Override
    public int doSave(NoticeVO inVO) {
        return doSave(inVO, null);
    }

    public int doSave(NoticeVO inVO, List<MultipartFile> files) {
        boolean hasFile = files != null && files.stream().anyMatch(f -> !f.isEmpty());
        processTitle(inVO, hasFile);

        // [수정] modNo가 0이면 regNo와 동일하게 세팅
        if (inVO.getModNo() == 0) {
            inVO.setModNo(inVO.getRegNo());
        }

        int result = noticeMapper.doSave(inVO);

        if (result == 1 && hasFile) {
            int savedNtcNo = noticeMapper.getLastNtcNo();
            saveAttachFiles(files, savedNtcNo);
        }

        return result;
    }

    // ──────────────────────────────────────────────
    // 수정
    // ──────────────────────────────────────────────
    @Override
    public int doUpdate(NoticeVO inVO) {
        return doUpdate(inVO, null);
    }

    public int doUpdate(NoticeVO inVO, List<MultipartFile> files) {
        boolean hasFile = files != null && files.stream().anyMatch(f -> !f.isEmpty());

        // 파일이 없을 때: 기존 attach_file 존재 여부로 📎 결정
        if (!hasFile) {
            List<AttachFileVO> existingFiles = getFileList(inVO.getNtcNo());
            hasFile = !existingFiles.isEmpty();
        }

        processTitle(inVO, hasFile);
        int result = noticeMapper.doUpdate(inVO);

        // 새 파일이 있으면 추가 저장 (기존 파일은 유지)
        if (result == 1 && files != null && files.stream().anyMatch(f -> !f.isEmpty())) {
            saveAttachFiles(files, inVO.getNtcNo());
        }

        return result;
    }

    // ──────────────────────────────────────────────
    // 삭제 (게시글 삭제 시 attach_file도 같이 삭제)
    // XML의 doDelete 사용
    // ──────────────────────────────────────────────
    @Override
    public int doDelete(NoticeVO inVO) {
        log.info("ServiceImpl doDelete: {}", inVO);

        // 연결된 파일 목록 조회 후 개별 삭제 (XML doDelete: FILE_NO 기준)
        List<AttachFileVO> fileList = getFileList(inVO.getNtcNo());
        for (AttachFileVO f : fileList) {
            // 물리 파일 삭제
            new File(f.getFilePathNm()).delete();
            // DB 삭제
            attachFileMapper.doDelete(f);  // XML의 doDelete
        }

        return noticeMapper.doDelete(inVO);
    }

    // ──────────────────────────────────────────────
    // 상세 조회 (파일 목록 포함)
    // XML의 getFileList 사용
    // ──────────────────────────────────────────────
    @Override
    public NoticeVO doSelectOne(NoticeVO inVO) {
        log.info("ServiceImpl doSelectOne: {}", inVO);
        NoticeVO outVO = noticeMapper.doSelectOne(inVO);

        if (outVO != null) {
            outVO.setFileList(getFileList(outVO.getNtcNo()));
        }

        return outVO;
    }

    @Override
    public List<NoticeVO> doRetrieve(DTO dto) {
        return noticeMapper.doRetrieve(dto);
    }

    @Override
    public int doRetrieveCount(NoticeVO inVO) {
        return noticeMapper.doRetrieveCount(inVO);
    }
}