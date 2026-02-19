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

    private int    hpNo;         // 병원 고유번호
    private String hpNm;         // 병원명
    private String hpAddr;       // 병원 주소
    private String hpEmrmYn;     // 응급실여부
    private String hpTelno1;     // 병원 전화번호
    private String hpTelno2;     // 응급실 전화번호
    private double hpLat;        // 병원 위도
    private double hpLot;        // 병원 경도
    private String hpOpTm;       // 평일 오픈 시간
    private String hpEndTm;      // 평일 닫는 시간
    private String hpWkndOpenYn; // 주말 운영 여부
}
