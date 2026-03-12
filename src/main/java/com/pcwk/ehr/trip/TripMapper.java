package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TripMapper extends WorkDiv<TripVO> {
    int getCount();
    int updateReadCnt(TripVO param);

<<<<<<< HEAD
            //인기 관광지 top3
    List<TripVO> selectTop3Popular();

    //지역별 관광지 랜덤 추천
    List<TripVO> selectRandomPerRegion();
=======

    // 중복 없는 태그 리스트 가져오기 (SELECT DISTINCT TRIP_TAG ...)
    List<String> getDistinctTags();

            //인기 관광지 top3
    List<TripVO> popularTop3();

    //지역별 관광지 랜덤 추천
    List<TripVO> randomRegion();
>>>>>>> 6b42e8f5a0cab4098e44b88272c2983c679bf0ff
}
