package com.pcwk.ehr.support;

import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.SupportVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final Logger log = LogManager.getLogger(getClass());
    private final SupportMapper supportMapper;
    private final AttachFileMapper attachFileMapper;

    // ✅ Notice와 동일한 방식 - user.home으로 자동 설정
    private static final String UPLOAD_PATH = System.getProperty("user.home") + "/upload/support/";
    private static final String BOARD_CLSF  = "support";

    // ──────────────────────────────────────────────
    // ✅ Notice와 동일한 파일 저장 메서드 (fileClsf 포함)
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

                // ✅ 확장자로 FILE_CLSF 판별 (NOT NULL 컬럼이라 반드시 세팅 필요)
                String ext = (originalName != null && originalName.contains("."))
                        ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                        : "file";
                String fileClsf = switch (ext) {
                    case "jpg", "jpeg", "png", "gif", "webp" -> "img";
                    case "xls", "xlsx"                        -> "exel";
                    case "hwp"                                -> "hwp";
                    default                                   -> "file";
                };

                AttachFileVO fileVO = new AttachFileVO();
                fileVO.setFileClsf(fileClsf);           // ✅ NOT NULL 컬럼 세팅
                fileVO.setFileNm(originalName);
                fileVO.setFilePathNm(UPLOAD_PATH + savedName);
                fileVO.setBoardClsf(BOARD_CLSF);
                fileVO.setBoardId(boardId);
                attachFileMapper.doSave(fileVO);

            } catch (IOException e) {
                log.error("파일 저장 실패: {}", e.getMessage());
            }
        }
    }

    // ✅ 파일 포함 저장
    public int doSave(SupportVO inVO, List<MultipartFile> files) {
        int result = supportMapper.doSave(inVO); // selectKey로 supNo 세팅됨

        if (result > 0 && files != null) {
            saveAttachFiles(files, inVO.getSupNo()); // ✅ 저장된 supNo 사용
        }
        return result;
    }

    @Override
    public int doSave(SupportVO inVO) {
        return doSave(inVO, null);
    }

    @Override
    public int doUpdate(SupportVO inVO) {
        log.info("SupportServiceImpl doUpdate: {}", inVO);
        if (inVO.getSupAnsCn() != null && !inVO.getSupAnsCn().trim().isEmpty()) {
            inVO.setSupYn("Y");
        } else {
            inVO.setSupYn("N");
        }
        return supportMapper.doUpdate(inVO);
    }

    @Override
    public int doDelete(SupportVO inVO) {
        log.info("SupportServiceImpl doDelete: {}", inVO);
        return supportMapper.doDelete(inVO);
    }

    @Override
    public SupportVO doSelectOne(SupportVO inVO) {
        return supportMapper.doSelectOne(inVO);
    }

    @Override
    public List<SupportVO> doRetrieve(DTO dto) {
        return supportMapper.doRetrieve(dto);
    }

    @Override
    public int getUserIdByEmail(String email) {
        return supportMapper.getUserIdByEmail(email);
    }
}