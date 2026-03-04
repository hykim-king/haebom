package com.pcwk.ehr.main;

import com.pcwk.ehr.domain.TripVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainController {

    private final Logger log = LogManager.getLogger(getClass());
    private final MainService mainService;

    //인기관광지&지역별 랜덤추천
    @GetMapping("")
    public String mainView(Model model) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ mainView() 호출                  │");

        // 1. 실시간 인기 관광지 Top 3 조회
        List<TripVO> popularList = mainService.popularTop3();
        log.debug("│ 인기 관광지 수: {}               │", popularList != null ? popularList.size() : 0);

        // 2. 지역별 관광지 랜덤 추천 조회
        List<TripVO> randomRegionList = mainService.randomRegion();
        log.debug("│ 지역별 추천 수: {}               │", randomRegionList != null ? randomRegionList.size() : 0);

        log.debug("└──────────────────────────────────┘");

        // 3. 뷰(main.html)로 데이터 전달
        model.addAttribute("popularList", popularList);
        model.addAttribute("randomRegionList", randomRegionList);

        // templates/main/main.html 호출
        return "main/main";
    }

    //나만의 맞춤 여행지 -> 여행AI 페이지 이동
    @GetMapping("/ai/recommend.do")
    public String aiRecommendView() {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ aiRecommendView() 호출            │");
        log.debug("└──────────────────────────────────┘");

        // templates/ai/recommend.html (혹은 설정하신 경로)로 이동
        return "ai/recommend";

    }

    //인기관광지 상세페이지 이동
    @GetMapping("/trip/doSelectOne.do")
    public String doSelectOne(TripVO vo, Model model) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ doSelectOne() 상세조회 호출      │");
        log.debug("│ 파라미터 ID: {}                  │", vo.getTripContsId());

        // 1. 상세 데이터 조회
        TripVO detailData = mainService.doSelectOne(vo);

        // 2. 모델에 데이터 담기
        model.addAttribute("detail", detailData);

        log.debug("│ 조회된 관광지명: {}             │", detailData != null ? detailData.getTripNm() : "데이터 없음");
        log.debug("└──────────────────────────────────┘");

        // 3. trip_detail.html로 이동 (파일 위치에 맞게 경로 조정)
        return "trip/trip_detail";
    }

    // 날씨 API
    @GetMapping(value = "/weather/api", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public String getWeather() {

        return mainService.getBestWeatherRegions();
    }
}

