package com.pcwk.ehr.domain;

import com.pcwk.ehr.course.FoodCandidateDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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



    private int courseOrder;         // AI 추천 순서
    private int day;                 // 1,2,3
    private String time;             // morning, afternoon, evening
    private String reason;           // AI 추천 이유

    // private int tripContsId;
    // private String tripNm;
    // private String tripAddr;
    private String tripTag;
    private String tripTagNm;
    // private String tripPathNm;
    private Integer tripInqCnt;
    private Double tripLat;
    private Double tripLot;

    private String tripdtlInfo;      // 소개글
    private String tripdtlParking;
    private String tripdtlUseTm;
    private String tripdtlRestdate;
    
    private FoodCandidateDTO selectedFood;
    /*
     * =====
    ====================
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
