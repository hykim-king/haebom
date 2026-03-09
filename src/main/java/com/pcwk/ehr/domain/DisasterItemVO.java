package com.pcwk.ehr.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisasterItemVO {

    private String sn; // 일련번호
    private String ctpvNm; // 시도명 (서울)
    private String sggNm; // 구 단위 필터

    private String title; // 화면용 제목
    private String message; // 문자내용
    private String regionName; // RCPTN_RGN_NM,ex)서울특별시 동작구, 수신지역
    private String emergencyStep; // EMRG_STEP_NM, 긴근단계
    private String disasterType; // DST_SE_NM,재난 유형

    private String createdAt; // CRT_DT, 발송시간
    private String regYmd; // REG_YMD, 날짜처리
    private String modifiedYmd; // MDFCN_YMD,수정시간
}
