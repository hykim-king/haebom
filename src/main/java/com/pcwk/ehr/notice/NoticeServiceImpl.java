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

    // 생성자
    private final NoticeMapper noticeMapper;

    @Override
    public int doSave(NoticeVO inVO) {
        log.info("ServiceImpl doSave: {}", inVO);

        UserVO user = inVO.getUserVO();

        if(user == null || !"Y".equals(user.getUserMngrYn())){
            log.warn("권한이 없습니다");
            return noticeMapper.doSave(inVO);
        }

        String title = inVO.getNtcTtl();

        // 제목 끝에 !! 을 붙이면 긴급, ! 이면 중요
        if(title.endsWith("!!")){
            inVO.setNtcTtl("[긴급]" + title.replace("!!","").trim());
        } else if(title.endsWith("!")){
            inVO.setNtcTtl("[중요]" + title.replace("!","").trim());
        }

        return noticeMapper.doSave(inVO);
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
        log.info("ServiceImpl doRetrieve: {}", dto);
        return noticeMapper.doRetrieve(dto);
    }
}