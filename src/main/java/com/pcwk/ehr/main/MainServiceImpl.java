package com.pcwk.ehr.main;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.trip.TripMapper;
import com.pcwk.ehr.utill.weather.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MainServiceImpl implements MainService {


    private final TripMapper tripMapper;
    private final WeatherService weatherService;

    // private final RestTemplateBuilder restTemplateBuilder;

    //인기 관광지
    @Override
    public List<TripVO> popularTop3() {
        return tripMapper.popularTop3();
    }

    //지역별 랜덤 추천
    @Override
    public List<TripVO> randomRegion() {
        return tripMapper.randomRegion();
    }

    //날씨 API
    @Override
    public String getBestWeatherRegions() {
        return weatherService.getBestWeatherRegions();
    }

        @Override
    public List<TripVO> doRetrieve(DTO param) {
        return List.of();
    }

    @Override
    public int doUpdate(TripVO param) {
        return 0;
    }

    @Override
    public int doDelete(TripVO param) {
        return 0;
    }

    @Override
    public int doSave(TripVO param) {
        return 0;
    }

    @Override
    public TripVO doSelectOne(TripVO param) {
        return tripMapper.doSelectOne(param);
    }

}
