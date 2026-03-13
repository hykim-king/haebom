package com.pcwk.ehr.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CourseTripVO {

    private int    courseNo;     // 코스 번호 (FK)
    private int    tripContsId;  // 여행지 콘텐츠 ID (FK)
    private int    stepOrder;    // 코스 내 순서

    // 여행지 기본 정보 (JOIN 결과)
    private String tripNm;       // 여행지명
    private String tripAddr;     // 주소
    private String tripImgUrl;   // 대표 이미지 URL

    // 지도 좌표
    private String tripLat;      // 위도 (latitude)
    private String tripLot;      // 경도 (longitude)
}