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
public class AreaVO extends DTO {

    private int areaNo; // 지역 고유번호
    private int tripCtpv; // 지역 이름
    private String tripCtpvNm; // 지역 설명
    private int tripGungu; // 지역 이름
    private String tripGunguNm; // 지역 설명
}
