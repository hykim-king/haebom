package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;

import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.List;

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

    @Override
    public int doSave(NoticeVO inVO) {
        log.info("ServiceImpl doSave: {}", inVO);

        UserVO user = inVO.getUserVO();

        // 권한 체크
        if(user == null || !"Y".equals(user.getUserMngrYn())){
            log.warn("권한이 없습니다 (Service Check)");
            // return 0;
        }

        String title = inVO.getNtcTtl();

        // 💡 [수정] 이모지 변환 로직 (요청하신 🚨 적용!)

        // 1. !! (두 개)로 끝나면 -> ⭐ [중요]
        if(title.endsWith("!!")){
            String cleanTitle = title.substring(0, title.length() - 2).trim();
            inVO.setNtcTtl("⭐ [중요] " + cleanTitle);

            // 2. ! (한 개)로 끝나면 -> 🚨 [긴급]
        } else if(title.endsWith("!")){
            String cleanTitle = title.substring(0, title.length() - 1).trim();
            // 🚑🔥 대신 깔끔한 경광등으로 변경!
            inVO.setNtcTtl("🚨 [긴급] " + cleanTitle);
        }

        return noticeMapper.doSave(inVO);
    }
    @Override
    public int doUpdate(NoticeVO inVO) {
        log.info("ServiceImpl doUpdate: {}", inVO);

        // (선택사항) 수정할 때도 제목 로직을 적용하고 싶다면 여기에 똑같은 코드를 넣으면 됩니다.

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