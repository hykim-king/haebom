package com.pcwk.ehr.trip_course;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.TripCourseDetailVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripCourseDetailServiceImpl implements TripCourseDetailService {

    private final TripCourseDetailMapper tripCourseDetailMapper;

    @Override
    public List<TripCourseDetailVO> doRetrieveCourseSteps(int courseNo) {
        return tripCourseDetailMapper.doRetrieveCourseSteps(courseNo);
    }

    @Override
    public TripCourseDetailVO doSelectTripDetail(int tripContsId) {
        return tripCourseDetailMapper.doSelectTripDetail(tripContsId);
    }

    @Override
    public List<AttachFileVO> doRetrieveTripImages(String boardClsf, int boardId) {
        return tripCourseDetailMapper.doRetrieveTripImages(boardClsf, boardId);
    }
}