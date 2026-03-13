package com.pcwk.ehr.trip_course;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.CourseTripVO;
import com.pcwk.ehr.domain.TripCourseVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripCourseServiceImpl implements TripCourseService {

    private final TripCourseMapper tripCourseMapper;

    @Override
    public List<TripCourseVO> doRetrieve(DTO param) {
        return tripCourseMapper.doRetrieve(param);
    }

    /** 단건 조회 + 지도용 courseItems 자동 포함 */
    @Override
    public TripCourseVO doSelectOne(TripCourseVO param) {
        TripCourseVO vo = tripCourseMapper.doSelectOne(param);
        if (vo != null) {
            vo.setCourseItems(tripCourseMapper.selectCourseItems(vo.getCourseNo()));
        }
        return vo;
    }

    @Override
    public int doSave(TripCourseVO param) {
        return tripCourseMapper.doSave(param);
    }

    @Override
    public int doUpdate(TripCourseVO param) {
        return tripCourseMapper.doUpdate(param);
    }

    @Override
    public int doDelete(TripCourseVO param) {
        return tripCourseMapper.doDelete(param);
    }

    @Override
    public int getCount() {
        return tripCourseMapper.getCount();
    }

    @Override
    public int increaseInqCnt(TripCourseVO inVO) {
        return tripCourseMapper.increaseInqCnt(inVO);
    }

    @Override
    public List<CourseTripVO> getCourseRoute(int courseNo) {
        return tripCourseMapper.selectCourseRoute(courseNo);
    }
}