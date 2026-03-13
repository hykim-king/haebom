package com.pcwk.ehr.trip_course;

import com.pcwk.ehr.domain.CourseTripVO;
import com.pcwk.ehr.domain.RelationVO;
import com.pcwk.ehr.domain.TripCourseDetailVO;
import com.pcwk.ehr.domain.TripCourseVO;
import com.pcwk.ehr.cmn.WorkDiv;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TripCourseMapper extends WorkDiv<TripCourseVO> {

    /** 전체 건수 조회 */
    int getCount();

    /** 조회수 증가 */
    int increaseInqCnt(TripCourseVO inVO);

    /** 코스 전체 삭제 */
    int deleteAll();

    /** 코스 소속 여행지 목록 조회 (지도 핀용) */
    List<CourseTripVO> selectCourseItems(int courseNo);

    /** 코스 경로 좌표 조회 (폴리라인용) */
    List<CourseTripVO> selectCourseRoute(int courseNo);

    /** 내 코스 목록 조회 */
    List<TripCourseVO> selectMyCourses(int userNo);

    /** 코스-여행지 연결 삽입 */
    int insertCourseTrip(CourseTripVO courseTripVO);

    /** 관계(찜 등) 삽입 */
    int insertRelation(RelationVO relationVO);

    List<TripCourseDetailVO> findTripsByContsIds(List<Integer> tripIds);
}