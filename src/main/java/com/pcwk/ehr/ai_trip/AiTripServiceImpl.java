package com.pcwk.ehr.ai_trip;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;

@Service
public class AiTripServiceImpl implements AiTripService {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private AiTripMapper aiTripMapper; // Mapper 주입

    // 1. 실제로 사용할 메인 메서드: AI 추천 이름들로 DB 조회
    @Override
    public List<TripVO> getSpotsByNames(List<String> names) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ Service getSpotsByNames          │");
        log.debug("│ names: " + names);
        log.debug("└──────────────────────────────────┘");
        
        // 매퍼 호출 (names가 null이어도 XML에서 랜덤 3개 처리됨)
        return aiTripMapper.getSpotsByNames(names); 
    }

    // 2. WorkDiv 인터페이스 구현 (doRetrieve는 검색 시 필요할 수 있으므로 연결)
    @Override
    public List<TripVO> doRetrieve(DTO dto) {
        log.debug("Service doRetrieve");
        return aiTripMapper.doRetrieve(dto);
    }

    @Override
    public int doSave(TripVO vo) { 
        return aiTripMapper.doSave(vo); 
    }

    @Override
    public int doUpdate(TripVO vo) { 
        return aiTripMapper.doUpdate(vo); 
    }

    @Override
    public int doDelete(TripVO vo) { 
        return aiTripMapper.doDelete(vo); 
    }

    @Override
    public TripVO doSelectOne(TripVO vo) { 
        return aiTripMapper.doSelectOne(vo); 
    }
}