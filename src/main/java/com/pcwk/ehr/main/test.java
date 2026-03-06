package com.pcwk.ehr.main;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class test {

    static final String AUTH_KEY = "r9rKC29-R_uaygtvfnf7AQ";
    static final String BASE_URL = "https://apihub.kma.go.kr/api/typ01/url/";

    public static void main(String[] args) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHH");
        String now = LocalDateTime.now().format(fmt);
        String sixHoursAgo = LocalDateTime.now().minusHours(6).format(fmt);

        // 1. 단기예보 구역 조회
        System.out.println("=== 1. 단기예보 구역 조회 (fct_shrt_reg) ===");
        callApi("fct_shrt_reg.php?tmfc=0&authKey=" + AUTH_KEY);

        // 2. 단기예보 개황 - 텍스트 예보
        System.out.println("\n=== 2. 단기예보 개황 (fct_afs_ds) ===");
        callApi("fct_afs_ds.php?stn=108&tmfc1=" + sixHoursAgo + "&tmfc2=" + now
                + "&disp=0&authKey=" + AUTH_KEY);

        // 3. 단기예보 육상 - 구조화 데이터 (서울: 11B10101)
        System.out.println("\n=== 3. 단기예보 육상 (fct_afs_dl) - 서울 ===");
        String response = callApi("fct_afs_dl.php?reg=11B10101&tmfc1=" + sixHoursAgo
                + "&tmfc2=" + now + "&disp=1&authKey=" + AUTH_KEY);
        parseForecast(response);
    }

    static String callApi(String endpoint) {
        StringBuilder sb = new StringBuilder();
        try {
            URL url = new URL(BASE_URL + endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int responseCode = conn.getResponseCode();
            System.out.println("HTTP 응답 코드: " + responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), "EUC-KR"));

                String line;
                while ((line = br.readLine()) != null) {
                    System.out.println(line);
                    sb.append(line).append("\n");
                }
                br.close();
            } else {
                System.out.println("API 호출 실패: " + responseCode);
            }

            conn.disconnect();
        } catch (Exception e) {
            System.out.println("오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
        return sb.toString();
    }

    static void parseForecast(String data) {
        System.out.println("\n--- 파싱 결과 ---");
        String[] skyMap = {"", "맑음", "구름조금", "구름많음", "흐림"};
        String[] prepMap = {"없음", "비", "비/눈", "눈", "눈/비"};

        for (String line : data.split("\n")) {
            if (line.startsWith("#") || line.trim().isEmpty()) continue;
            String[] f = line.split(",");
            if (f.length < 18) continue;

            String regId = f[0].trim();
            String tmEf = f[2].trim();    // 발효시각
            String ta = f[12].trim();     // 기온
            String st = f[13].trim();     // 강수확률
            String sky = f[14].trim();    // 하늘상태코드
            String prep = f[15].trim();   // 강수유무코드
            String wf = f[16].trim();     // 예보

            // 하늘상태 변환
            String skyText = sky;
            if (sky.startsWith("DB")) {
                int idx = Integer.parseInt(sky.substring(2));
                if (idx >= 1 && idx <= 4) skyText = skyMap[idx];
            }

            // 강수유무 변환
            String prepText = prep;
            try {
                int idx = Integer.parseInt(prep);
                if (idx >= 0 && idx <= 4) prepText = prepMap[idx];
            } catch (NumberFormatException ignored) {}

            // 발효시각 포맷
            String efTime = tmEf.length() >= 12
                    ? tmEf.substring(4, 6) + "/" + tmEf.substring(6, 8) + " " + tmEf.substring(8, 10) + "시"
                    : tmEf;

            System.out.printf("[%s] %s | 기온:%s℃ | 강수확률:%s%% | 하늘:%s | 강수:%s | %s%n",
                    regId, efTime, ta, st, skyText, prepText, wf);
        }
    }
}
