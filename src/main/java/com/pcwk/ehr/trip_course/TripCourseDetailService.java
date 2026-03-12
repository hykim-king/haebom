package com.pcwk.ehr.trip_course;

import java.util.List;

import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.TripCourseDetailVO;

public interface TripCourseDetailService {

    /**
     * STEP UI 목록 조회
     */
    List<TripCourseDetailVO> doRetrieveCourseSteps(int courseNo);

    /**
     * 선택된 여행지 상세 1건 조회
     */
    TripCourseDetailVO doSelectTripDetail(int tripContsId);

    /**
     * 선택된 여행지 이미지 목록 조회
     */
    List<AttachFileVO> doRetrieveTripImages(String boardClsf, int boardId);
}