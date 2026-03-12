package com.pcwk.ehr.util.map;

import com.pcwk.ehr.domain.*;
import com.pcwk.ehr.trip_course.TripCourseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MapService {

    private final MapMapper    mapMapper;
    private final TripCourseMapper tripCourseMapper;   // ★ 코스 경로 조회용 추가

    /** 여행지 위치 전체 조회 */
    public List<TripVO> getTripLocations() {
        return mapMapper.findTripLocations();
    }

    /** 병원 위치 전체 조회 */
    public List<HospitalVO> getHospitalLocations() {
        return mapMapper.findHospitalLocations();
    }

    /** 약국 위치 전체 조회 */
    public List<DrugVO> getDrugLocations() {
        return mapMapper.findDrugLocations();
    }

    /**
     * ★ 특정 코스의 경로 좌표 조회
     * - courseNo 소유자(userNo) 검증 포함
     * - 지도에 폴리라인 그릴 때 사용
     */
    public List<CourseTripVO> getCourseRoute(int courseNo, int userNo) {
        // 소유자 검증: 해당 코스가 요청자 것인지 확인
        List<TripCourseVO> myCourses = tripCourseMapper.selectMyCourses(userNo);
        boolean isOwner = myCourses.stream()
                .anyMatch(c -> c.getCourseNo() == courseNo);

        if (!isOwner) {
            return Collections.emptyList();
        }

        return tripCourseMapper.selectCourseRoute(courseNo);
    }

    /**
     * ★ 내 코스 목록 조회 (지도 드롭다운 선택용)
     */
    public List<TripCourseVO> getMyCourses(int userNo) {
        return tripCourseMapper.selectMyCourses(userNo);
    }
}