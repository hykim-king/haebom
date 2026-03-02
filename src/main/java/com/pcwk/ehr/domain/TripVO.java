package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class TripVO extends DTO {

    private int tripContsId; // 여행지 콘텐츠 ID
    private String tripNm; // 여행지명
    private String tripPathNm; // 여행지 이미지 경로
    private String tripAddr; // 여행지 주소
    private double tripLat; // 여행지 위도
    private double tripLot; // 여행지 경도
    private String tripTag; // 여행지 태그
    private int tripClsf; // 여행지 분류
    private int tripCtpv; // 여행지 시도
    private int tripGungu; // 여행지 군구
    private int tripInqCnt; // 여행지 조회수

    private String orderType;   // 정렬 타입 (new/pop)
}
