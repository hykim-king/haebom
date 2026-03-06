package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.domain.TripVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MapMapper mapMapper;

    // 여행지 목록
    public List<TripVO> getTripLocations() {
        return mapMapper.findTripLocations();
    }

    // 병원 목록
    public List<HospitalVO> getHospitalLocations() {
        return mapMapper.findHospitalLocations();
    }

    // 약국 목록
    public List<DrugVO> getDrugLocations() {
        return mapMapper.findDrugLocations();
    }

}