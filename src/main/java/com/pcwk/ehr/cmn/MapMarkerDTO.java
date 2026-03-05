package com.pcwk.ehr.cmn;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapMarkerDTO {

    private List<MapLocationDTO> trips;       // 여행지 목록
    private List<MapLocationDTO> hospitals;   // 병원 목록
    private List<MapLocationDTO> drugs;       // 약국 목록

}