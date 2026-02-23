package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final Logger log = LogManager.getLogger(getClass());

    // 생성자 주입 (Lombok의 @RequiredArgsConstructor 사용)
    private final NoticeMapper noticeMapper;

    @Override
    public int doSave(NoticeVO inVO) {
        log.info("ServiceImpl doSave: {}", inVO);
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
    public List<NoticeVO> doRetrieve(DTO inVO) {
        log.info("ServiceImpl doRetrieve: {}", inVO);
        return noticeMapper.doRetrieve(inVO);
    }
}