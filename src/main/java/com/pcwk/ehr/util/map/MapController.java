package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.CourseTripVO;
import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.domain.TripVO;
import jakarta.servlet.http.HttpSession;
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

    /** 지도 페이지 */
    @GetMapping("/mark")
    public String mapPage() {
        return "map/map";
    }

    /** 여행지 마커 목록 */
    @GetMapping("/api/trips")
    @ResponseBody
    public ResponseEntity<List<TripVO>> getTripLocations() {
        return ResponseEntity.ok(mapService.getTripLocations());
    }

    /** 병원 마커 목록 */
    @GetMapping("/api/hospitals")
    @ResponseBody
    public ResponseEntity<List<HospitalVO>> getHospitalLocations() {
        return ResponseEntity.ok(mapService.getHospitalLocations());
    }

    /** 약국 마커 목록 */
    @GetMapping("/api/drugs")
    @ResponseBody
    public ResponseEntity<List<DrugVO>> getDrugLocations() {
        return ResponseEntity.ok(mapService.getDrugLocations());
    }

    /**
     * ★ 내 코스 경로 좌표 조회 (지도에 폴리라인 그리기용)
     * GET /map/api/courseRoute?courseNo=1
     * → 로그인 세션 + courseNo 소유자 검증 후 경로 반환
     */
    @GetMapping("/api/courseRoute")
    @ResponseBody
    public ResponseEntity<?> getCourseRoute(
            @RequestParam int courseNo,
            HttpSession session) {

        Integer userNo = (Integer) session.getAttribute("userNo");
        if (userNo == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        List<CourseTripVO> route = mapService.getCourseRoute(courseNo, userNo);
        return ResponseEntity.ok(route);
    }

    /**
     * ★ 내 코스 목록 조회 (지도 사이드바 코스 선택 드롭다운용)
     * GET /map/api/myCourses
     */
    @GetMapping("/api/myCourses")
    @ResponseBody
    public ResponseEntity<?> getMyCourses(HttpSession session) {
        Integer userNo = (Integer) session.getAttribute("userNo");
        if (userNo == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        return ResponseEntity.ok(mapService.getMyCourses(userNo));
    }
}