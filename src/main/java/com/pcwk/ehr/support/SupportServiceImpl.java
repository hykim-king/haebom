package com.pcwk.ehr.support;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.SupportVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final Logger log = LogManager.getLogger(getClass());

    // 생성자 주입을 위해 final 키워드 사용
    private final SupportMapper supportMapper;

    @Override
    public int doSave(SupportVO inVO) {
        log.info("SupportServiceImpl doSave: {}", inVO);
        return supportMapper.doSave(inVO);
    }

    @Override
    public int doUpdate(SupportVO inVO) {
        log.info("SupportServiceImpl doUpdate: {}", inVO);
        // 문의사항 수정 시 답변 상태(supYn) 변경 로직이 mapper에 포함되어 있습니다.
        return supportMapper.doUpdate(inVO);
    }

    @Override
    public int doDelete(SupportVO inVO) {
        log.info("SupportServiceImpl doDelete: {}", inVO);
        return supportMapper.doDelete(inVO);
    }

    @Override
    public SupportVO doSelectOne(SupportVO inVO) {
        log.info("SupportServiceImpl doSelectOne: {}", inVO);
        return supportMapper.doSelectOne(inVO);
    }

    @Override
    public List<SupportVO> doRetrieve(DTO inVO) {
        log.info("SupportServiceImpl doRetrieve: {}", inVO);
        // DTO 타입을 넘겨 페이징 및 검색 조건을 처리합니다.
        return supportMapper.doRetrieve(inVO);
    }
}