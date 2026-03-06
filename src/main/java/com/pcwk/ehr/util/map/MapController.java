package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.domain.TripVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/mark")
    public String mapPage() {
        return "map/map";
    }

    @GetMapping("/api/trips")
    @ResponseBody
    public ResponseEntity<List<TripVO>> getTripLocations() {
        return ResponseEntity.ok(mapService.getTripLocations());
    }

    @GetMapping("/api/hospitals")
    @ResponseBody
    public ResponseEntity<List<HospitalVO>> getHospitalLocations() {
        return ResponseEntity.ok(mapService.getHospitalLocations());
    }

    @GetMapping("/api/drugs")
    @ResponseBody
    public ResponseEntity<List<DrugVO>> getDrugLocations() {
        return ResponseEntity.ok(mapService.getDrugLocations());
    }
}
