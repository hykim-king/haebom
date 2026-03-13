package com.pcwk.ehr.course;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.CourseVO;
import com.pcwk.ehr.domain.CourseTripVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseMapper courseMapper;

    @Override
    public List<CourseVO> doRetrieve(DTO param) {
        return courseMapper.doRetrieve(param);
    }

    @Override
    public CourseVO doSelectOne(CourseVO param) {
        return courseMapper.doSelectOne(param);
    }

    @Override
    public int doSave(CourseVO param) {
        return courseMapper.doSave(param);
    }

    @Override
    public int doUpdate(CourseVO param) {
        return courseMapper.doUpdate(param);
    }

    @Override
    public int doDelete(CourseVO param) {
        return courseMapper.doDelete(param);
    }

    @Override
    public CourseVO getCourseDetail(int courseNo) {
        // 1. 코스 기본 정보 조회
        CourseVO courseVO = courseMapper.selectCourseBasic(courseNo);

        // 2. 리스트 합치기
        if (courseVO != null) {
            List<CourseTripVO> items = courseMapper.selectCourseItems(courseNo);
            courseVO.setCourseItems(items); // HTML th:each 사용을 위해 필수!
        }
        return courseVO;
    }

    @Override
    public List<CourseTripVO> getCourseRoute(int courseNo, int userNo) {
        return courseMapper.selectCourseRoute(courseNo);
    }


}