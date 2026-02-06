package com.pcwk.ehr.area;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 한국관광공사 API로부터 시/도, 군/구 데이터를 받아 AREA 테이블에 저장하는 서비스
 */
@Service
public class AreaService {
    
    final Logger log = LogManager.getLogger(getClass());
    
    @Autowired
    AreaMapper areaMapper;
    
    @Autowired
    RestTemplate restTemplate;
    
    @Value("${api.service-key}")  // application.properties에서 주입받기
    private String serviceKey;
    // 시도 코드 -> 시도명 맵 (시도 저장 시 채워두고, 군/구 저장에서 재사용)
    private Map<Integer, String> sidoNameMap = new HashMap<>();
    
    // 공공데이터포털 API 엔드포인트
    private static final String API_URL = "http://apis.data.go.kr/B551011/KorService2/areaCode2";
    
    /**
     * 시/도 데이터 조회 및 저장
     * areaCode 파라미터 없이 호출하면 시/도 목록을 반환
     */
    public void fetchAndSaveSido() {
        log.info("┌──────────────────────────────────────┐");
        log.info("│  시/도 데이터 조회 및 저장 시작       │");
        log.info("└──────────────────────────────────────┘");
        
        try {
            // 1. API 호출
            String url = UriComponentsBuilder.fromUriString(API_URL)
                .queryParam("serviceKey", serviceKey)
                .queryParam("numOfRows", 17)  // 시도는 최대 17개
                .queryParam("pageNo", 1)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "AppTest")
                .queryParam("_type", "json")
                .toUriString();
            
            log.info("API 요청 URL: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            
            // 2. JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            
            // 디버깅: 전체 응답 구조 확인
            log.debug("API 전체 응답: {}", response.substring(0, Math.min(500, response.length())));
            
            // items 경로 확인
            JsonNode responseNode = root.path("response");
            JsonNode bodyNode = responseNode.path("body");
            JsonNode itemsNode = bodyNode.path("items");
            JsonNode itemNode = itemsNode.path("item");
            
            log.info("response 존재: {}", responseNode.isMissingNode() ? "없음" : "있음");
            log.info("body 존재: {}", bodyNode.isMissingNode() ? "없음" : "있음");
            log.info("items 존재: {}", itemsNode.isMissingNode() ? "없음" : "있음");
            log.info("item 존재: {}", itemNode.isMissingNode() ? "없음" : "있음");
            log.info("item isArray: {}", itemNode.isArray());
            log.info("item 타입: {}", itemNode.getNodeType());
            
            JsonNode items = itemNode;
            log.info("시/도 데이터 개수: {}", items.size());
            
            // 3. 기존 데이터 삭제 (선택사항)
            // areaMapper.deleteAll();
            
            // 4. 데이터 저장
            int saveCount = 0;
            for (JsonNode item : items) {
                AreaVO areaVO = new AreaVO();
                areaVO.setAreaSido(item.path("code").asInt());
                areaVO.setAreaSidoName(item.path("name").asText());
                // 시도는 areaGungu가 NULL
                areaVO.setAreaGungu(0);
                // Oracle은 빈 문자열을 NULL로 처리하므로 빈 문자열을 넣으면 NOT NULL 제약에 걸림
                // 시도 레코드의 경우 AREA_GUNGU_NAME에 시도명을 복사해서 NULL 삽입을 피함
                areaVO.setAreaGunguName(areaVO.getAreaSidoName());
                // 시도명 맵에 저장
                sidoNameMap.put(areaVO.getAreaSido(), areaVO.getAreaSidoName());
                
                int flag = areaMapper.doSave(areaVO);
                if (flag == 1) {
                    saveCount++;
                    log.info("  ✓ 저장 완료: {} (코드: {})", areaVO.getAreaSidoName(), areaVO.getAreaSido());
                }
            }
            
            log.info("┌──────────────────────────────────────┐");
            log.info("│  시/도 데이터 저장 완료: {}건          │", saveCount);
            log.info("└──────────────────────────────────────┘");
            
        } catch (Exception e) {
            log.error("시/도 데이터 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("시/도 데이터 조회 실패", e);
        }
    }
    
    /**
     * 특정 시/도의 군/구 데이터 조회 및 저장
     * @param areaSido 시도 코드 (예: 1=서울, 2=인천 등)
     */
    public void fetchAndSaveGunguBySido(int areaSido) {
        log.info("┌──────────────────────────────────────┐");
        log.info("│  군/구 데이터 조회 시작 (시도: {})    │", areaSido);
        log.info("└──────────────────────────────────────┘");
        
        try {
            // 1. API 호출 (areaCode 파라미터 포함)
            String url = UriComponentsBuilder.fromUriString(API_URL)
                .queryParam("serviceKey", serviceKey)
                .queryParam("numOfRows", 100)
                .queryParam("pageNo", 1)
                .queryParam("areaCode", areaSido)  // 시도 코드로 군/구 조회
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "AppTest")
                .queryParam("_type", "json")
                .toUriString();
            
            log.info("API 요청 URL: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            
            // 2. JSON 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            
            // 디버깅: 전체 응답 구조 확인
            log.debug("API 전체 응답: {}", response.substring(0, Math.min(500, response.length())));
            
            // items 경로 확인
            JsonNode responseNode = root.path("response");
            JsonNode bodyNode = responseNode.path("body");
            JsonNode itemsNode = bodyNode.path("items");
            JsonNode itemNode = itemsNode.path("item");
            
            log.info("response 존재: {}", responseNode.isMissingNode() ? "없음" : "있음");
            log.info("body 존재: {}", bodyNode.isMissingNode() ? "없음" : "있음");
            log.info("items 존재: {}", itemsNode.isMissingNode() ? "없음" : "있음");
            log.info("item 존재: {}", itemNode.isMissingNode() ? "없음" : "있음");
            log.info("item isArray: {}", itemNode.isArray());
            log.info("item 타입: {}", itemNode.getNodeType());
            
            JsonNode items = itemNode;
            log.info("군/구 데이터 개수: {}", items.size());
            
            // 3. 데이터 저장
            int saveCount = 0;
            for (JsonNode item : items) {
                AreaVO areaVO = new AreaVO();
                areaVO.setAreaSido(areaSido);
                areaVO.setAreaGungu(item.path("code").asInt());
                areaVO.setAreaGunguName(item.path("name").asText());
                // 군/구 레코드에는 areaSidoName이 필요(매퍼의 NOT NULL 제약을 만족시키기 위함)
                String sidoName = sidoNameMap.get(areaSido);
                if (sidoName == null) {
                    // 만약 맵에 없다면 DB에서 조회해서 채워본다
                    List<AreaVO> sidos = areaMapper.getSidoList();
                    for (AreaVO s : sidos) {
                        if (s.getAreaSido() == areaSido) {
                            sidoName = s.getAreaSidoName();
                            // 캐시에 저장
                            sidoNameMap.put(areaSido, sidoName);
                            break;
                        }
                    }
                }
                // 안전장치: 그래도 없으면 숫자 코드 문자열로 대체(빈 문자열은 Oracle에서 NULL로 처리되므로 피함)
                if (sidoName == null) {
                    sidoName = "sido-" + areaSido;
                }
                areaVO.setAreaSidoName(sidoName);
                
                int flag = areaMapper.doSave(areaVO);
                if (flag == 1) {
                    saveCount++;
                    log.info("  ✓ 저장 완료: {} (코드: {})", areaVO.getAreaGunguName(), areaVO.getAreaGungu());
                }
            }
            
            log.info("┌──────────────────────────────────────┐");
            log.info("│  군/구 데이터 저장 완료: {}건         │", saveCount);
            log.info("└──────────────────────────────────────┘");
            
        } catch (Exception e) {
            log.error("군/구 데이터 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("군/구 데이터 조회 실패", e);
        }
    }
    
    /**
     * 전체 시/도 및 군/구 데이터 일괄 조회 및 저장
     */
    public void fetchAndSaveAll() {
        log.info("\n전체 지역 데이터 일괄 조회 시작...\n");
        
        // 1. 시/도 저장
        fetchAndSaveSido();
        
        // 2. 각 시도별 군/구 저장 (1~17: 서울~세종)
        for (int sido = 1; sido <= 17; sido++) {
            try {
                fetchAndSaveGunguBySido(sido);
                // API 호출 제한 고려: 적절한 딜레이 추가
                Thread.sleep(500);
            } catch (Exception e) {
                log.warn("시도 {}의 군/구 조회 실패: {}", sido, e.getMessage());
            }
        }
        
        log.info("\n전체 지역 데이터 조회 및 저장 완료!\n");
    }
}
