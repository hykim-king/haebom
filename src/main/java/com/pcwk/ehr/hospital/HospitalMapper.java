package com.pcwk.ehr.hospital;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.HospitalVO;

@Mapper
public interface HospitalMapper extends WorkDiv<HospitalVO> {

    int deleteAll();

    int getCount();
}
