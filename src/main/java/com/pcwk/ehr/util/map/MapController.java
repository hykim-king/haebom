package com.pcwk.ehr.util.map;

import com.pcwk.ehr.cmn.AllLocationsResponseDTO;
import com.pcwk.ehr.cmn.MapLocationDTO;
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

    /**
     * 지도 HTML 페이지 열기
     * GET /map/mark
     */
    @GetMapping("/mark")
    public String mapPage() {
        return "map/map"; // templates/map/map.html
    }

    /**
     * 전체 위치 한 번에 조회
     * GET /map/api/all
     */
    @GetMapping("/api/all")
    @ResponseBody
    public ResponseEntity<AllLocationsResponseDTO> getAllLocations() {
        return ResponseEntity.ok(mapService.getAllLocations());
    }

    /**
     * 여행지만 조회
     * GET /map/api/trips
     */
    @GetMapping("/api/trips")
    @ResponseBody
    public ResponseEntity<List<MapLocationDTO>> getTripLocations() {
        return ResponseEntity.ok(mapService.getTripLocations());
    }

    /**
     * 병원만 조회
     * GET /map/api/hospitals
     */
    @GetMapping("/api/hospitals")
    @ResponseBody
    public ResponseEntity<List<MapLocationDTO>> getHospitalLocations() {
        return ResponseEntity.ok(mapService.getHospitalLocations());
    }

    /**
     * 약국만 조회
     * GET /map/api/drugs
     */
    @GetMapping("/api/drugs")
    @ResponseBody
    public ResponseEntity<List<MapLocationDTO>> getDrugLocations() {
        return ResponseEntity.ok(mapService.getDrugLocations());
    }
}