package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.domain.TripVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MapMapper {

    // 여행지 위도/경도 조회
    List<TripVO> findTripLocations();

    // 병원 위도/경도 조회
    List<HospitalVO> findHospitalLocations();

    // 약국 위도/경도 조회
    List<DrugVO> findDrugLocations();
}