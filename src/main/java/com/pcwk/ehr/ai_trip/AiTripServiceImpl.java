package com.pcwk.ehr.ai_trip;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.user.UserEntity;

@Service
public class AiTripServiceImpl implements AiTripService {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private AiTripMapper aiTripMapper;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // ⭐ FastAPI 서버 베이스 URL (포트는 FastAPI 설정에 맞춤)
    private final String FASTAPI_BASE_URL = "http://127.0.0.1:5000/ai";

    /**
     * [공통] FastAPI 서버와 통신하여 AI 추천 장소 리스트를 받아오는 메서드
     * ⭐ 중요: FastAPI는 명시적인 JSON Content-Type 헤더가 필요합니다.
     */
    private List<String> getNamesFromAi(String endpoint, Map<String, String> requestData) {
        try {
            // 1. 헤더 설정 (FastAPI 필수 사항)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. 요청 엔티티 생성 (Body + Headers)
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestData, headers);

            // 3. 통신 실행
            ResponseEntity<List<String>> responseEntity = restTemplate.exchange(
                FASTAPI_BASE_URL + endpoint,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<List<String>>() {}
            );

            log.info("AI 서버 응답 상태: " + responseEntity.getStatusCode());
            return (responseEntity.getBody() != null) ? responseEntity.getBody() : new ArrayList<>();
        } catch (Exception e) {
            log.error("AI 서버(FastAPI) 통신 실패 (" + endpoint + "): " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * 1. 메인 AI 추천 (사용자 입력 + 태그 기반)
     */
    @Override
    public List<String> getRecommendedSpotNames(String userInput, String userTag) {
        Map<String, String> requestData = new HashMap<>();
        // ⭐ FastAPI Pydantic 모델의 필드명과 일치해야 함
        requestData.put("user_input", userInput);
        requestData.put("user_tag", userTag);

        return getNamesFromAi("/recommend", requestData);
    }

    /**
     * 2. 연령대별 추천 - AI 기반
     */
    @Override
    public List<TripVO> getSpotsByAge(DTO dto) {
        String ageGroup = "20대";
        
        UserEntity user = getSessionUser();
        if (user != null && user.getUserBrdt() != 0) {
            int birthYear = user.getUserBrdt() / 10000;
            int age = LocalDate.now().getYear() - birthYear + 1;
            int calculatedAge = (age / 10) * 10;
            ageGroup = (calculatedAge >= 60 ? 60 : calculatedAge) + "대";
        }

        log.info("FastAPI 연령대 추천 요청: " + ageGroup);
        
        Map<String, String> requestData = new HashMap<>();
        requestData.put("age_group", ageGroup); // ⭐ FastAPI 모델 필드명: age_group

        List<String> spotNames = getNamesFromAi("/recommend_age", requestData);
        return doRetrieveByAiNames(spotNames);
    }

    /**
     * 3. 지역 기반 추천
     */
    @Override
    public List<TripVO> getSpotsByAddr(DTO dto) {
        UserEntity user = getSessionUser();
        String searchArea = "서울";

        if (user != null && user.getUserAddr() != null && !user.getUserAddr().trim().isEmpty()) {
            String fullAddr = user.getUserAddr();
            String[] addrParts = fullAddr.split(" ");
            
            if (addrParts.length >= 2) {
                searchArea = addrParts[0] + " " + addrParts[1];
            } else {
                searchArea = addrParts[0];
            }
        }

        log.info("FastAPI 지역 추천 요청: " + searchArea);

        Map<String, String> requestData = new HashMap<>();
        requestData.put("local_addr", searchArea); // ⭐ FastAPI 모델 필드명: local_addr

        List<String> spotNames = getNamesFromAi("/recommend_local", requestData);
        return doRetrieveByAiNames(spotNames);
    }

    // --- 이하 로직은 동일 (Mapper 호출 및 세션 관리) ---

    @Override
    public List<TripVO> doRetrieveByAiNames(List<String> aiNames) {
        if (aiNames == null || aiNames.isEmpty()) {
            return new ArrayList<>();
        }
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("list", aiNames);
        
        List<TripVO> result = aiTripMapper.getSpotsByNames(paramMap);
        log.info("DB 상세 매칭 완료: " + result.size() + "건");
        return result;
    }

    @Override
    public List<TripVO> getSpotsByNames(List<String> names) {
        return doRetrieveByAiNames(names);
    }

    @Override
    public List<TripVO> getSpotsByNames(Map<String, Object> paramMap) {
        return aiTripMapper.getSpotsByNames(paramMap);
    }

    private UserEntity getSessionUser() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        if (attr != null && attr.getRequest().getSession() != null) {
            return (UserEntity) attr.getRequest().getSession().getAttribute("user");
        }
        return null;
    }

    @Override
    public List<TripVO> doRetrieve(DTO dto) {
        UserEntity user = getSessionUser();
        Map<String, Object> paramMap = new HashMap<>();
        if (user != null && user.getUserTag() != null) {
            paramMap.put("userTag", user.getUserTag());
        }
        return aiTripMapper.doRetrieve(paramMap); 
    }

    @Override public int doSave(TripVO vo) { return aiTripMapper.doSave(vo); }
    @Override public int doUpdate(TripVO vo) { return aiTripMapper.doUpdate(vo); }
    @Override public int doDelete(TripVO vo) { return aiTripMapper.doDelete(vo); }
    @Override public TripVO doSelectOne(TripVO vo) { return aiTripMapper.doSelectOne(vo); }

    @Override
    public int doSaveWish(java.util.Map<String, Object> params) {
        return aiTripMapper.doSaveWish(params);
    }

    @Override
    public int doDeleteWish(java.util.Map<String, Object> params) {
        return aiTripMapper.doDeleteWish(params);
    }
}