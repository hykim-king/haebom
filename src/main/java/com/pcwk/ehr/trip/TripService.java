package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;
import java.util.List;


public interface TripService extends WorkDiv<TripVO> {

    //단건 조회 + 조회수 증가
    TripVO upDoSelectOne(TripVO param);
    // DB 내 중복 없는 태그 목록 조회 (동적 테마용)
    List<String> getDistinctTags();
    
}
