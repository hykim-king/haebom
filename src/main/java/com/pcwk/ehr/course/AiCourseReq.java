/**
 * 
 */
package com.pcwk.ehr.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCourseReq {
	
	
    @JsonProperty("region_name")
    private String regionName;   // 예: 서울
    @JsonProperty("gungu_name")
    private String gunguName;    // 예: 강남구, 없으면 null
    private int days;            // 1~3
    private List<String> themes; // 예: ["역사", "문화시설"]
}