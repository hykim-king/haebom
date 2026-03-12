package com.pcwk.ehr.hospital;

import java.util.List;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.HospitalVO;

public interface HospitalService extends WorkDiv<HospitalVO> {

    List<HospitalVO> getAll();
}
