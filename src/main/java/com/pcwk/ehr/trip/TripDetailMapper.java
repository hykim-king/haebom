package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripDetailVO;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TripDetailMapper extends WorkDiv<TripDetailVO> {
}