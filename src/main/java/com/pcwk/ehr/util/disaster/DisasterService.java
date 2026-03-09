package com.pcwk.ehr.util.disaster;

import com.pcwk.ehr.domain.DisasterResponseVO;

public interface DisasterService {
    DisasterResponseVO getDisasterByRegion(String ctpvNm, String sggNm);
}
