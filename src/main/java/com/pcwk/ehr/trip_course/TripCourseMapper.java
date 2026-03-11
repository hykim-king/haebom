package com.pcwk.ehr.trip_course;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripCourseVO;

@Mapper
public interface TripCourseMapper extends WorkDiv<TripCourseVO> {

    /**
     * 전체 건수 조회
     */
    int getCount();
    int increaseInqCnt(TripCourseVO inVO);
}
