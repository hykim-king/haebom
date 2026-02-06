package com.pcwk.ehr.course;

import org.apache.ibatis.annotations.Mapper;
import com.pcwk.ehr.cmn.WorkDiv;

@Mapper
public interface CourseMapper extends WorkDiv<CourseVO> {
    
    /** 전체 삭제 */
    int deleteAll();
    
    /** 전체 건수 조회 */
    int getCount(CourseVO param);
}
