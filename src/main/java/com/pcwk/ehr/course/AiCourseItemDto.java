/**
 * 
 */
package com.pcwk.ehr.course;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCourseItemDto {

    private int day;
    private String time;

    @JsonProperty("trip_conts_id")
    private int tripContsId;

    @JsonProperty("trip_nm")
    private String tripNm;

    @JsonProperty("trip_addr")
    private String tripAddr;

    @JsonProperty("trip_tag")
    private String tripTag;

    @JsonProperty("trip_lat")
    private Double tripLat;

    @JsonProperty("trip_lot")
    private Double tripLot;

    private String reason;
    
 // FastAPI에서 넘어오는 음식점 후보
    private List<FoodCandidateDTO> food_candidates;

    // Spring에서 선택한 음식점
    private FoodCandidateDTO selected_food;
}