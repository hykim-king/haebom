package com.pcwk.ehr.main;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.trip.TripMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MainServiceImpl implements MainService{


    private final TripMapper tripMapper;

    @Override
    public List<TripVO> popularTop3() {
        return tripMapper.popularTop3();
    }

    @Override
    public List<TripVO> randomRegion() {
        return tripMapper.randomRegion();
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
    public TripVO doSelectOne(TripVO param) {
        return tripMapper.doSelectOne(param);
    }

    @Override
    public int doSave(TripVO param) {
        return 0;
    }

//    @Override
//    public List<Map<String, Object>> getBestWeatherRegions() {
//        // TODO: 기상청 APIHub 호출 로직 (RestTemplate 또는 WebClient 사용)
//        // 1. APIHub 접속 및 데이터 파싱
//        // 2. 기온/강수 조건에 따라 상위 3개 지역 선정
//        // 3. List<Map> 형태로 반환하여 main.js에서 사용 가능하게 가공
//        return new ArrayList<>();
//    }
}
