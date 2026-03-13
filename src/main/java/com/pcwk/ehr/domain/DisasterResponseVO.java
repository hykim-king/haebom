package com.pcwk.ehr.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisasterResponseVO {

    private boolean success;
    private String ctpvNm; // 도시 명
    private String sggNm; // 군구명
    private String requestRegionName; // ex)서울특별시 동작구
    private String summary; // 재난 문자 내용
    private List<DisasterItemVO> items;
}