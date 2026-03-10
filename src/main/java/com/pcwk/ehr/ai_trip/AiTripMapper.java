package com.pcwk.ehr.ai_trip;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

@Mapper
public interface AiTripMapper extends WorkDiv<TripVO> { 

    List<TripVO> getSpotsByNames(List<String> names);

}
