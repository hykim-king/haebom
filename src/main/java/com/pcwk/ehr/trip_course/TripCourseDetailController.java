package com.pcwk.ehr.trip_course;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.TripCourseDetailVO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/trip_course/detail")
@RequiredArgsConstructor
public class TripCourseDetailController {

    final Logger log = LogManager.getLogger(getClass());

    private final TripCourseDetailService tripCourseDetailService;

    /**
     * STEP UI 목록 조회
     * 예: /trip_course/detail/steps?courseNo=5
     */
    @GetMapping(value = "/steps", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripCourseDetailVO> doRetrieveCourseSteps(int courseNo) {
        log.debug("===== doRetrieveCourseSteps() =====");
        log.debug("courseNo={}", courseNo);

        return tripCourseDetailService.doRetrieveCourseSteps(courseNo);
    }

    /**
     * 선택된 여행지 상세 1건 조회
     * 예: /trip_course/detail/trip?tripContsId=101
     */
    @GetMapping(value = "/trip", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public TripCourseDetailVO doSelectTripDetail(int tripContsId) {
        log.debug("===== doSelectTripDetail() =====");
        log.debug("tripContsId={}", tripContsId);

        return tripCourseDetailService.doSelectTripDetail(tripContsId);
    }

    /**
     * 선택된 여행지 이미지 목록 조회
     * 예: /trip_course/detail/images?tripContsId=101
     */
    @GetMapping(value = "/images", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<AttachFileVO> doRetrieveTripImages(int tripContsId) {
        log.debug("===== doRetrieveTripImages() =====");
        log.debug("tripContsId={}", tripContsId);

        String boardClsf = "trip"; // DB 실제값이 다르면 여기만 수정
        return tripCourseDetailService.doRetrieveTripImages(boardClsf, tripContsId);
    }
}