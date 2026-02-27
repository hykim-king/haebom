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
public class TripDetailVO extends DTO {

    private int tripContsId; // 여행지 콘텐츠 ID
    private String tripdtlInfo; // 여행지 상세 정보
    private String tripdtlDyoffYmd; // 휴무일
    private String tripdtlPrkPsblty; // 주차 가능 여부
    private String tripdtlOperHr; // 운영 시간
    private String tripdtlTel; // 전화번호
    private String tripdtlStroller; // 유모차 대여 여부
    private String tripdtlPet; // 반려동물 동반 여부
    private String tripdtlCrg; // 이용 요금
    private String tripdtlHmpg; // 홈페이지 주소
    private String tripdtlReg; // 등록일
    private String tripdtlMod; // 수정일
}
