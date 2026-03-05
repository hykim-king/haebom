package com.pcwk.ehr.util.map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MapLocationDTO {

    private Long id;          // 고유번호
    private String name;      // 이름 (여행지명 / 병원명 / 약국명)
    private Double lat;       // 위도
    private Double lot;       // 경도
    private String type;      // "trip" / "hospital" / "drug"
    private String address;   // 주소 (선택)
    private String tel;       // 전화번호 (선택)
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapDTO {

    private List<MapLocationDTO> trips;       // 여행지 목록
    private List<MapLocationDTO> hospitals;   // 병원 목록
    private List<MapLocationDTO> drugs;       // 약국 목록
}