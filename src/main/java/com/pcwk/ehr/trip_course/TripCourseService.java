package com.pcwk.ehr.trip_course;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CourseTripVO;
import com.pcwk.ehr.domain.TripCourseVO;
import java.util.List;
public interface TripCourseService extends WorkDiv<TripCourseVO> {

    /**
     * 전체 건수 조회
     */
    int getCount();
    int increaseInqCnt(TripCourseVO inVO);

    
    /** 코스 경로 좌표 조회 */
    List<CourseTripVO> getCourseRoute(int courseNo);
}
