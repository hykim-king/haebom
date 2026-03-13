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

    private Integer courseNo;       // 여행코스 PK (SEQ_COURSE_NO)
    private String  courseNm;       // 여행코스 이름
    private String  courseInfo;     // 여행코스 정보
    private String  coursePathNm;   // 여행코스 이미지 경로명 (ERD: VARCHAR2(300))
    private String  courseDstnc;    // 여행코스 거리
    private String  courseReqTm;    // 여행코스 소요시간

    // ★ RELATION 테이블을 통해 사용자와 연결 (INSERT 시 사용, DB 컬럼 아님)
    private Integer userNo;

    // ★ 코스에 포함된 여행지 목록 (INSERT 시 전달 / SELECT 시 JOIN)
    private List<CourseTripVO> courseItems;
}