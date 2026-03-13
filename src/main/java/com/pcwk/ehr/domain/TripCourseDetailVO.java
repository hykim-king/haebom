package com.pcwk.ehr.domain;

import com.pcwk.ehr.course.FoodCandidateDTO;
import lombok.*;

/**
 * 여행코스 상세 STEP UI 전용 VO
 * - course_trip + trip 사용
 * - STEP 카드 이미지용 tripPathNm 포함
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCourseDetailVO {

    /*
     * =========================
     * COURSE_TRIP
     * =========================
     */
    private Integer ctNo;
    private Integer courseNo;
    private Integer tripContsId;
    private Integer ctOrder;

    /*
     * =========================
     * TRIP
     * =========================
     */
    private String tripNm;
    private String tripAddr;

    /* STEP 카드 대표 이미지 */
    private String tripPathNm;

    /*
     * =========================
     * AI 코스 추천 결과 매핑용 (AiCourseFacadeService에서 사용)
     * =========================
     */
    private Integer courseOrder;        // 코스 순서 (1부터 시작)
    private Integer day;                // 여행 일차 (Day 1, Day 2 ...)
    private String time;                // 방문 시간 (예: "09:00")
    private String reason;              // AI 추천 이유
    private FoodCandidateDTO selectedFood; // Spring에서 선택한 음식점
}