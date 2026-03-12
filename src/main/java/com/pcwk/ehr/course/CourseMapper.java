package com.pcwk.ehr.course;

import org.apache.ibatis.annotations.Mapper;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CourseVO;
import com.pcwk.ehr.domain.CourseTripVO;
import com.pcwk.ehr.domain.RelationVO;
import java.util.List;

@Mapper
public interface CourseMapper extends WorkDiv<CourseVO> {

    int deleteAll();
    int getCount();

    // 기존 상세 조회 (유지)
    CourseVO selectCourseDetail(int courseNo);

    CourseVO selectCourseBasic(int courseNo);        // 코스 기본 정보 조회
    List<CourseTripVO> selectCourseItems(int courseNo); // 코스 소속 여행지 목록 조회

    int insertCourseTrip(CourseTripVO courseTripVO);
    int insertRelation(RelationVO relationVO);
    List<CourseTripVO> selectCourseRoute(int courseNo);
    List<CourseVO> selectMyCourses(int userNo);
}