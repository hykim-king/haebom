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
    private String ctpvNm;
    private String sggNm;
    private String requestRegionName;
    private String summary;
    private List<DisasterItemVO> items;
}