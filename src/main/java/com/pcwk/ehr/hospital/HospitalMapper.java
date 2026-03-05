package com.pcwk.ehr.hospital;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.HospitalVO;

@Mapper
public interface HospitalMapper extends WorkDiv<HospitalVO> {

    int deleteAll();

    int getCount();

    List<HospitalVO> getAll();
}
