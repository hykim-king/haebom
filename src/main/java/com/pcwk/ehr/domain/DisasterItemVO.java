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
    private String sggNm; // 시군구명 (강남구)

    private String title; // 화면용 제목
    private String message; // MSG_CN
    private String regionName; // RCPTN_RGN_NM,ex)서울특별시 동작구
    private String emergencyStep; // EMRG_STEP_NM
    private String disasterType; // DST_SE_NM

    private String createdAt; // CRT_DT
    private String regYmd; // REG_YMD
    private String modifiedYmd; // MDFCN_YMD
}
