package com.pcwk.ehr.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 여행코스 상세 STEP UI 전용 VO
 * - course_trip + trip 사용
 * - STEP 카드 이미지용 tripPathNm 포함
 */
@Getter
@Setter
@ToString
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
}
