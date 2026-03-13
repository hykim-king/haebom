package com.pcwk.ehr.util.disaster;

import com.pcwk.ehr.domain.DisasterResponseVO;

public interface DisasterService {
    // 재난 조회 서비스 인터페이스 인자로 받은걸 DisasterResponseVO로 반환 해준다.
    DisasterResponseVO getDisasterByRegion(String ctpvNm, String sggNm);

}
