package com.pcwk.ehr.trip_course;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.TripCourseDetailVO;

@Mapper
public interface TripCourseDetailMapper {

    /**
     * STEP UI 목록 조회
     * - course_trip + trip
     */
    List<TripCourseDetailVO> doRetrieveCourseSteps(int courseNo);

    /**
     * 선택된 여행지 상세 1건 조회
     * - 여행지명, 주소, 대표이미지, 설명
     */
    TripCourseDetailVO doSelectTripDetail(int tripContsId);

    /**
     * 선택된 여행지 이미지 목록 조회
     * - attach_file
     */
    List<AttachFileVO> doRetrieveTripImages(@Param("boardClsf") String boardClsf,
            @Param("boardId") int boardId);
}