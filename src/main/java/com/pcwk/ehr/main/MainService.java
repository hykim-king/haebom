package com.pcwk.ehr.main;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

import java.util.List;

public interface MainService extends WorkDiv<TripVO> {

    List<TripVO> popularTop3();

    List<TripVO> randomRegion();
}
