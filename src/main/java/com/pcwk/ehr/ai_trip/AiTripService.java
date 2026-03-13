package com.pcwk.ehr.ai_trip;

import java.util.List;
import java.util.Map;
import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

public interface AiTripService extends WorkDiv<TripVO> {

    List<String> getRecommendedSpotNames(String userInput, String userTag);

    // 컨트롤러 호출 이름과 일치하도록 수정
    List<TripVO> getSpotsByAge(DTO dto);   // 연령대별 추천
    List<TripVO> getSpotsByAddr(DTO dto);  // 지역별 추천
    
    // AI 관련 및 오버로딩 메서드
    List<TripVO> doRetrieveByAiNames(List<String> aiNames);
    List<TripVO> getSpotsByNames(List<String> names);
    List<TripVO> getSpotsByNames(Map<String, Object> paramMap);

    int doSaveWish(Map<String, Object> params);
    int doDeleteWish(Map<String, Object> params);
}
