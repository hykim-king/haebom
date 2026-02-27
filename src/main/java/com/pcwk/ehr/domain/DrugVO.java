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
public class DrugVO extends DTO {

    private int dsNo; // 약국 고유번호
    private String dsNm; // 약국명
    private String dsAddr; // 약국 주소
    private String dsTelno; // 약국 전화번호
    private double dsLat; // 약국 위도
    private double dsLot; // 약국 경도
    private String dsOpTm; // 평일 오픈 시간
    private String dsEndTm; // 평일 닫는 시간
    private String dsWkndOpenYn; // 주말 운영 여부
}
