package com.pcwk.ehr.trip_course;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
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

    @Override
    public TripCourseVO doSelectOne(TripCourseVO param) {
        return tripCourseMapper.doSelectOne(param);
    }

    @Override
    public int doSave(TripCourseVO param) {
        throw new UnsupportedOperationException("trip_course는 현재 저장 기능을 사용하지 않습니다.");
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
}