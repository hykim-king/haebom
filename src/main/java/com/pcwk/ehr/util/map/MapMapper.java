package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.domain.TripVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MapMapper {

    List<TripVO> findTripLocations();

    List<HospitalVO> findHospitalLocations();

    List<DrugVO> findDrugLocations();
}
