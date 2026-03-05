package com.pcwk.ehr.map;

import com.pcwk.ehr.cmn.MapLocationDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MapRepository {

    private final JdbcTemplate jdbcTemplate;

    // ✅ 여행지 위도/경도 조회 (trip 테이블)
    public List<MapLocationDTO> findTripLocations() {
        String sql = """
            SELECT TRIP_CONTS_ID  AS id,
                   TRIP_NM        AS name,
                   TRIP_LAT       AS lat,
                   TRIP_LOT       AS lot,
                   TRIP_ADDR      AS address,
                   'trip'         AS type
            FROM trip
            WHERE TRIP_LAT IS NOT NULL
              AND TRIP_LOT IS NOT NULL
              AND TRIP_LAT != 0
              AND TRIP_LOT != 0
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> MapLocationDTO.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .lat(rs.getDouble("lat"))
                .lot(rs.getDouble("lot"))
                .address(rs.getString("address"))
                .type("trip")
                .build()
        );
    }

    // ✅ 병원 위도/경도 조회 (hospital 테이블)
    public List<MapLocationDTO> findHospitalLocations() {
        String sql = """
            SELECT HP_NO        AS id,
                   HP_NM        AS name,
                   HP_LAT       AS lat,
                   HP_LOT       AS lot,
                   HP_ADDR      AS address,
                   HP_TELNO1    AS tel,
                   'hospital'   AS type
            FROM hospital
            WHERE HP_LAT IS NOT NULL
              AND HP_LOT IS NOT NULL
              AND HP_LAT != 0
              AND HP_LOT != 0
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> MapLocationDTO.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .lat(rs.getDouble("lat"))
                .lot(rs.getDouble("lot"))
                .address(rs.getString("address"))
                .tel(rs.getString("tel"))
                .type("hospital")
                .build()
        );
    }

    // ✅ 약국 위도/경도 조회 (drug 테이블)
    public List<MapLocationDTO> findDrugLocations() {
        String sql = """
            SELECT DS_NO    AS id,
                   DS_NM    AS name,
                   DS_LAT   AS lat,
                   DS_LOT   AS lot,
                   DS_ADDR  AS address,
                   DS_TELNO AS tel,
                   'drug'   AS type
            FROM drug
            WHERE DS_LAT IS NOT NULL
              AND DS_LOT IS NOT NULL
              AND DS_LAT != 0
              AND DS_LOT != 0
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> MapLocationDTO.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .lat(rs.getDouble("lat"))
                .lot(rs.getDouble("lot"))
                .address(rs.getString("address"))
                .tel(rs.getString("tel"))
                .type("drug")
                .build()
        );
    }
}