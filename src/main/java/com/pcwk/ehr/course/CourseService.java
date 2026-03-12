package com.pcwk.ehr.course;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CourseVO;
import com.pcwk.ehr.domain.CourseTripVO;
import java.util.List;

public interface CourseService extends WorkDiv<CourseVO> {

    // ★ 코스 상세 조회 (지도 핀용)
    CourseVO getCourseDetail(int courseNo);

    // 경로 좌표
    List<CourseTripVO> getCourseRoute(int courseNo, int userNo);
}