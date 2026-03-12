package com.pcwk.ehr.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * COURSE_TRIP 테이블 VO
 * ERD 컬럼명 기준: CT_NO, CT_ORDER
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseTripVO {

    private Integer ctNo;           // PK (SEQ_CT_NO)
    private Integer courseNo;       // FK → COURSE.COURSE_NO
    private Integer tripContsId;    // FK → TRIP.TRIP_CONTS_ID
    private Integer ctOrder;        // 코스 내 순서 (1, 2, 3 ...)

    // JOIN 시 여행지 정보 (읽기 전용 - TripVO 필드와 동일)
    private String  tripNm;
    private String  tripAddr;
    private String  tripPathNm;
    private Double  tripLat;
    private Double  tripLot;
}