/**
 * 
 */
package com.pcwk.ehr.course;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCourseRes {

    @JsonProperty("region_name")
    private String regionName;

    @JsonProperty("region_code")
    private String regionCode;

    @JsonProperty("gungu_name")
    private String gunguName;

    @JsonProperty("gungu_code")
    private String gunguCode;

    private int days;

    private List<String> themes;

    @JsonProperty("selected_cluster")
    private int selectedCluster;

    private List<AiCourseItemDto> course;

    @JsonProperty("trip_ids")
    private List<Integer> tripIds;

    @JsonProperty("raw_places")
    private List<String> rawPlaces;

    @JsonProperty("filtered_candidate_count")
    private int filteredCandidateCount;

    @JsonProperty("cluster_count")
    private int clusterCount;

    @JsonProperty("llm_raw")
    private Map<String, Object> llmRaw;
}