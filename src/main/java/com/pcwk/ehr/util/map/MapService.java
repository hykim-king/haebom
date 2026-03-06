package com.pcwk.ehr.util.map;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MapMapper mapMapper;

    // 여행지 목록
    public List<MapDTO> getTripLocations() {
        return mapMapper.findTripLocations();
    }

    // 병원 목록
    public List<MapDTO> getHospitalLocations() {
        return mapMapper.findHospitalLocations();
    }

    // 약국 목록
    public List<MapDTO> getDrugLocations() {
        return mapMapper.findDrugLocations();
    }

    // 전체 한 번에 → DTO로 묶어서 반환
    public MapDTO getAllLocations() {
        List<MapDTO> trips     = mapMapper.findTripLocations();
        List<MapDTO> hospitals = mapMapper.findHospitalLocations();
        List<MapDTO> drugs     = mapMapper.findDrugLocations();

        return MapDTO.builder()
                .trips(trips)
                .hospitals(hospitals)
                .drugs(drugs)
                .build();
    }
}