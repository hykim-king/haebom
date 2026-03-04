package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // 💡 추가

import java.io.File; // 💡 추가
import java.io.IOException; // 💡 추가
import java.util.List;
import java.util.UUID; // 💡 파일명 중복 방지용

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final Logger log = LogManager.getLogger(getClass());
    private final NoticeMapper noticeMapper;

    @Override
    public int getUserIdByEmail(String email) {
        return noticeMapper.getUserIdByEmail(email);
    }

    @Override
    public String checkAdminAuth(String email) {
        return noticeMapper.checkAdminAuth(email);
    }

    @Override
    public UserVO getLoginUserInfo(String email) {
        return noticeMapper.getLoginUserInfo(email);
    }

    // 💡 [수정] 파일 리스트를 파라미터로 받도록 변경
    public int doSave(NoticeVO inVO, List<MultipartFile> files) {
        String title = inVO.getNtcTtl();

        // 1. 이모지 로직 (기존 유지)
        if (title.endsWith("!!") && !title.endsWith("!!!")) {
            String cleanTitle = title.substring(0, title.length() - 2).trim();
            inVO.setNtcTtl("⭐ [중요] " + cleanTitle);
        }
        else if (title.endsWith("!") && !title.endsWith("!!")) {
            String cleanTitle = title.substring(0, title.length() - 1).trim();
            inVO.setNtcTtl("🚨 [긴급] " + cleanTitle);
        }

        // 2. 파일 물리적 저장 로직
        if (files != null && !files.isEmpty()) {
            // 💡 맥북 저장 경로 (하니님 계정 폴더로 설정)
            String uploadPath = "/Users/hani/upload/notice/";
            File uploadDir = new File(uploadPath);

            if (!uploadDir.exists()) uploadDir.mkdirs(); // 폴더 없으면 생성

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // 원본 파일명 유지 혹은 UUID 추가 (파일명 중복 방지)
                    String saveName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                    File saveFile = new File(uploadPath, saveName);

                    try {
                        file.transferTo(saveFile); // 💡 실제 파일 저장
                        log.info("파일 저장 성공: {}", savePath);
                    } catch (IOException e) {
                        log.error("파일 저장 실패: {}", e.getMessage());
                    }
                }
            }
        }

        return noticeMapper.doSave(inVO);
    }

    // 인터페이스 정의에 맞추기 위해 기존 doSave도 유지하거나 인터페이스를 수정해야 합니다.
    @Override
    public int doSave(NoticeVO inVO) {
        return doSave(inVO, null);
    }

    @Override
    public int doUpdate(NoticeVO inVO) {
        log.info("ServiceImpl doUpdate: {}", inVO);
        return noticeMapper.doUpdate(inVO);
    }

    @Override
    public int doDelete(NoticeVO inVO) {
        log.info("ServiceImpl doDelete: {}", inVO);
        return noticeMapper.doDelete(inVO);
    }

    @Override
    public NoticeVO doSelectOne(NoticeVO inVO) {
        log.info("ServiceImpl doSelectOne: {}", inVO);
        return noticeMapper.doSelectOne(inVO);
    }

    @Override
    public List<NoticeVO> doRetrieve(DTO dto) {
        return noticeMapper.doRetrieve(dto);
    }
}