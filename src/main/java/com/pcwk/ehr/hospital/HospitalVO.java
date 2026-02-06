package com.pcwk.ehr.hospital;

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
public class HospitalVO extends DTO {

    private Long   hpId;      // 병원 ID
    private String hpName;    // 병원명
    private String hpAdd;     // 주소
    private String hpEms;     // 응급실 여부
    private String hpTel1;    // 전화번호1
    private String hpTel2;    // 전화번호2
    private Double hpMapx;    // 경도
    private Double hpMapy;    // 위도
    private String hpOpen;    // 영업 시작
    private String hpClose;   // 영업 종료
    private String hpHoliday; // 휴일 여부
}
