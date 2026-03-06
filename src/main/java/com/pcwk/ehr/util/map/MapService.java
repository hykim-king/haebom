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

    public List<TripVO> getTripLocations() {
        return mapMapper.findTripLocations();
    }

    public List<HospitalVO> getHospitalLocations() {
        return mapMapper.findHospitalLocations();
    }

    public List<DrugVO> getDrugLocations() {
        return mapMapper.findDrugLocations();
    }
}
