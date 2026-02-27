package com.pcwk.ehr.course;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CourseVO;

@Mapper
public interface CourseMapper extends WorkDiv<CourseVO> {

    int deleteAll();

    int getCount();
    
}
