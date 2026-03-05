package com.pcwk.ehr.util.map;

import com.pcwk.ehr.cmn.AllLocationsResponseDTO;
import com.pcwk.ehr.cmn.MapLocationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MapRepository mapRepository;

    // 여행지 목록
    public List<MapLocationDTO> getTripLocations() {
        return mapRepository.findTripLocations();
    }

    // 병원 목록
    public List<MapLocationDTO> getHospitalLocations() {
        return mapRepository.findHospitalLocations();
    }

    // 약국 목록
    public List<MapLocationDTO> getDrugLocations() {
        return mapRepository.findDrugLocations();
    }

    // 전체 한 번에 → Map 없이 DTO로 묶어서 반환
    public AllLocationsResponseDTO getAllLocations() {
        List<MapLocationDTO> trips     = mapRepository.findTripLocations();
        List<MapLocationDTO> hospitals = mapRepository.findHospitalLocations();
        List<MapLocationDTO> drugs     = mapRepository.findDrugLocations();

        return AllLocationsResponseDTO.builder()
                .trips(trips)
                .hospitals(hospitals)
                .drugs(drugs)
                .build();
    }
}