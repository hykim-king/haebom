package com.pcwk.ehr.main;

import com.pcwk.ehr.domain.TripVO;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.HttpURLConnection;
import java.util.List;

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
    @GetMapping("/weather/api")
    @ResponseBody
    public String getWeatherData() {
        try {
            // tmfc=0:최근 예보시간 자동 선택  / disp=1:구역정보와 날씨 수치를 포함해 출력
            String apiUrl = "https://apihub.kma.go.kr/api/typ01/url/fct_shrt_reg.php?tmfc=0&disp=1&help=0&authKey=r9rKC29-R_uaygtvfnf7AQ";
            java.net.URL url = new java.net.URL(apiUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();

            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            // 2. 응답 코드 확인
            int respCode = conn.getResponseCode();
            java.io.InputStream is = (respCode >= 200 && respCode <= 300)
                    ? conn.getInputStream() : conn.getErrorStream();

            // 3. 인코딩 수정: 기상청 APIHub는 UTF-8을 지원하기도 하므로
            // 만약 EUC-KR에서 깨진다면 UTF-8로 변경해 보세요.
            java.io.BufferedReader rd = new java.io.BufferedReader(
                    new java.io.InputStreamReader(is, "EUC-KR")
            );

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line).append("\n");
            }
            rd.close();

            // [중요] 서버 콘솔에서 데이터가 실제로 숫자를 포함하는지 꼭 확인하세요!
            System.out.println("DEBUG API DATA: " + (sb.length() > 200 ? sb.substring(0, 200) : sb.toString()));

            return sb.toString();

        } catch (Exception e) {
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
    }
}

