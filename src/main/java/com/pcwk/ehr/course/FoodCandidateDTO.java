/**
 * 
 */
package com.pcwk.ehr.course;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class FoodCandidateDTO {

    @JsonProperty("trip_conts_id")
    private Integer tripContsId;

    @JsonProperty("trip_nm")
    private String tripNm;

    @JsonProperty("trip_addr")
    private String tripAddr;

    private Double distance;
}