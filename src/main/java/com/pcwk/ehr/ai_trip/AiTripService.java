package com.pcwk.ehr.ai_trip;

import java.util.List;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

public interface AiTripService extends WorkDiv<TripVO> {

    List<TripVO> getSpotsByNames(List<String> names);
    
}
