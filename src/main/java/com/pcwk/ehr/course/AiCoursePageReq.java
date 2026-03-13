/**
 * 
 */
package com.pcwk.ehr.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCoursePageReq {

    private String regionName;
    private String gunguName;
    private int days;
    private List<String> themes;
}