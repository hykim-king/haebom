package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
public class TripCourseVO extends DTO {

    /** DB 컬럼 */
    private int    courseNo;
    private String courseNm;
    private String courseInfo;
    private String coursePathNm;
    private String courseDstnc;
    private String courseReqTm;

    /** 조회 결과 / 화면 제어용 */
    private int    totalCnt;    // COUNT(*) OVER / CROSS JOIN COUNT 결과 수신용
    private String hashTag;     // 추후 해시태그 필터용
    private String orderType;   // 정렬 기준 (new / pop)
    private int    courseInqCnt;

    /** 코스 소속 여행지 목록 (지도 핀 / th:each 사용) */
    private List<CourseTripVO> courseItems;
}