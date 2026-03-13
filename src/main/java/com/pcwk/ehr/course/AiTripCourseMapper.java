package com.pcwk.ehr.course;

import com.pcwk.ehr.domain.TripCourseDetailVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AiTripCourseMapper {

    List<TripCourseDetailVO> findTripsByContsIds(@Param("tripIds") List<Integer> tripIds);

}
