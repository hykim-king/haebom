package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TripMapper extends WorkDiv<TripVO> {
    int getCount();
    int updateReadCnt(TripVO param);

            //인기 관광지 top3
    List<TripVO> selectTop3Popular();

    //지역별 관광지 랜덤 추천
    List<TripVO> selectRandomPerRegion();
}
