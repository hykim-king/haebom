package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class CourseVO extends DTO {

    private Integer courseNo;     // 여행코스
    private String  courseNm;     // 여행코스이름
    private String  courseInfo;   // 여행코스 정보
    private Integer coursePathNm;   // 여행코스 이미지 경로명
    private String  courseDstnc;     // 여행코스 거리
    private String  courseReqTm;     // 여행코스 소요시간

    private List<CourseTripVO> courseItems;


}
