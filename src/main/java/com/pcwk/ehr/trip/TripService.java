package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;



public interface TripService extends WorkDiv<TripVO> {

    //단건 조회 + 조회수 증가
    TripVO upDoSelectOne(TripVO param);
}
