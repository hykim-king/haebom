package com.pcwk.ehr.util.map;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MapMapper {

    // 여행지 위도/경도 조회
    List<MapDTO> findTripLocations();

    // 병원 위도/경도 조회
    List<MapDTO> findHospitalLocations();

    // 약국 위도/경도 조회
    List<MapDTO> findDrugLocations();
}