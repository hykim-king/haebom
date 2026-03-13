package com.pcwk.ehr.main;

import com.pcwk.ehr.domain.TripVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainController {

    private final Logger log = LogManager.getLogger(getClass());
    private final MainService mainService;

    @GetMapping("/main.do")
    public String mainView(Model model) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ mainView() 호출                  │");

        // 1. 실시간 인기 관광지 Top 3 조회
        List<TripVO> popularList = mainService.getTop3Popular();
        log.debug("│ 인기 관광지 수: {}               │", popularList != null ? popularList.size() : 0);

        // 2. 지역별 관광지 랜덤 추천 조회
        List<TripVO> randomRegionList = mainService.getRandomPerRegion();
        log.debug("│ 지역별 추천 수: {}               │", randomRegionList != null ? randomRegionList.size() : 0);

        log.debug("└──────────────────────────────────┘");

        // 3. 뷰(main.html)로 데이터 전달
        model.addAttribute("popularList", popularList);
        model.addAttribute("randomRegionList", randomRegionList);

        // templates/main/main.html 호출
        return "main/main";
    }

    @GetMapping("/ai/recommend.do")
    public String aiRecommendView() {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ aiRecommendView() 호출           │");
        log.debug("└──────────────────────────────────┘");

        // templates/ai/recommend.html (혹은 설정하신 경로)로 이동
        return "ai/recommend";

    }
}
