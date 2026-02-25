package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TripMapper extends WorkDiv<TripVO> {
    int getCount();
}
