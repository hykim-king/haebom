package com.pcwk.ehr.area;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AreaVO extends DTO {
    private int areaId;           // AREA_ID (PK)
    private int areaSido;         // AREA_SIDO (시도 코드, 2자리)
    private String areaSidoName;  // AREA_SIDO_NAME (시도명)
    private int areaGungu;        // AREA_GUNGU (군구 코드, 3자리)
    private String areaGunguName; // AREA_GUNGU_NAME (군구명)
}
