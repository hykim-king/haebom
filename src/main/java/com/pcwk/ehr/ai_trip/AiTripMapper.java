package com.pcwk.ehr.ai_trip;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

@Mapper
public interface AiTripMapper extends WorkDiv<TripVO> {

    List<TripVO> doRetrieve(Map<String, Object> paramMap);
    // 1. 상단: 태그/이름 기반 추천
    List<TripVO> getSpotsByNames(Map<String, Object> paramMap);

    // 2. 중단: 연령대별 추천
    List<TripVO> getSpotsByAge(Map<String, Object> paramMap);

    // 3. 하단: 주소(지역) 기반 추천
    List<TripVO> getSpotsByAddr(Map<String, Object> paramMap);

    // 기존에 쓰던 메서드가 있다면 유지
    List<TripVO> doRetrieveByAiNames(Map<String, Object> paramMap);

    int doSaveWish(Map<String, Object> paramMap);
    int doDeleteWish(Map<String, Object> paramMap);
}
