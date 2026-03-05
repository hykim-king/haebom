package com.pcwk.ehr.util.map;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MapRepository mapRepository;

    // 여행지 목록
    public List<MapDTO> getTripLocations() {
        return mapRepository.findTripLocations();
    }

    // 병원 목록
    public List<MapDTO> getHospitalLocations() {
        return mapRepository.findHospitalLocations();
    }

    // 약국 목록
    public List<MapDTO> getDrugLocations() {
        return mapRepository.findDrugLocations();
    }

    // 전체 한 번에 → DTO로 묶어서 반환
    public MapDTO getAllLocations() {
        List<MapDTO> trips     = mapRepository.findTripLocations();
        List<MapDTO> hospitals = mapRepository.findHospitalLocations();
        List<MapDTO> drugs     = mapRepository.findDrugLocations();

        return MapDTO.builder()
                .trips(trips)
                .hospitals(hospitals)
                .drugs(drugs)
                .build();
    }
}