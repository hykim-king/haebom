package com.pcwk.ehr.cmn;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationDTO {

    private Long id;          // 고유번호
    private String name;      // 이름 (여행지명 / 병원명 / 약국명)
    private Double lat;       // 위도
    private Double lot;       // 경도
    private String type;      // "trip" / "hospital" / "drug"
    private String address;   // 주소 (선택)
    private String tel;       // 전화번호 (선택)

}