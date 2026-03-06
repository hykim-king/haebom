package com.pcwk.ehr.utill.weather;


import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WeatherServiceImpl implements WeatherService {

    private final Logger log = LogManager.getLogger(getClass());
    private final RestTemplate restTemplate;

    private static final String AUTH_KEY = "r9rKC29-R_uaygtvfnf7AQ";
    private static final String BASE_URL = "https://apihub.kma.go.kr/api/typ01/url/";

    @Override
    public String getBestWeatherRegions() {
        // test.java의 날짜 계산 로직 적용
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHH");
        String now = LocalDateTime.now().format(fmt);
        String sixHoursAgo = LocalDateTime.now().minusHours(6).format(fmt);

        // 1.3 단기예보 육상 (구조화 데이터) 사용
        // test.java에서 성공한 fct_afs_dl.php 경로와 파라미터를 그대로 사용합니다.
        // 서울(11B10101)을 기준으로 가져오거나 구역을 조정할 수 있습니다.
        String apiFile = "fct_afs_dl.php";
        String params = String.format("?reg=108&tmfc1=%s&tmfc2=%s&disp=1&authKey=%s",
                sixHoursAgo, now, AUTH_KEY);

        String apiUrl = BASE_URL + apiFile + params;

        try {
            log.debug("[WEATHER] 호출 URL: {}", apiUrl);

            // 기상청 API는 EUC-KR로 데이터를 주지만, RestTemplate이 String으로 받을 때
            // 프로젝트 설정에 따라 한글이 깨질 수 있으므로 확인이 필요합니다.
            String rawData = restTemplate.getForObject(apiUrl, String.class);

            log.debug("[WEATHER] Raw Data 수신 성공: \n{}", rawData);

            if (rawData != null && rawData.contains("#")) {
                log.debug("[WEATHER] 데이터 호출 성공!");
                return rawData;
            }
            return "";
        } catch (Exception e) {
            log.error("[WEATHER] API 호출 에러: {}", e.getMessage());
            return "";
        }
    }
}


