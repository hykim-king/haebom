package com.pcwk.ehr.trip_course;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripCourseVO;

public interface TripCourseService extends WorkDiv<TripCourseVO> {

    /**
     * 전체 건수 조회
     */
    int getCount();
}
