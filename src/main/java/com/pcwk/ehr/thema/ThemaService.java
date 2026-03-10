package com.pcwk.ehr.thema;

import java.util.Map;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

public interface ThemaService extends WorkDiv<TripVO> { 

    int doSaveWish(Map<String, Object> params);
    int doDeleteWish(Map<String, Object> params);
}