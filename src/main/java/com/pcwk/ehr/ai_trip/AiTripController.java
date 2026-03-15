package com.pcwk.ehr.ai_trip;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.user.UserEntity;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/ai_trip")
@RequiredArgsConstructor
public class AiTripController {

    private final Logger log = LogManager.getLogger(getClass());
    private final AiTripService aiTripService;

    /**
     * [페이지 로딩 & AJAX 통합] AI 추천 메인 페이지
     * ResponseEntity<?>를 사용하여 상황에 따라 String(View) 또는 List(JSON)를 반환합니다.
     */
    @RequestMapping(value = "/recommend")
    public Object aiRecommend(@RequestParam(value = "userInput", required = false) String userInput,
            Model model,
            HttpSession session,
            HttpServletRequest request) {

        // 1. 세션 유저 정보 확인
        UserEntity user = (UserEntity) session.getAttribute("user");

        // 2. 유저 나이대 계산 로직
        String userAgeGroup = "all"; 
        if (user != null && user.getUserBrdt() != 0) {
            try {
                int birthYear = user.getUserBrdt() / 10000;
                int currentYear = LocalDate.now().getYear();
                int age = currentYear - birthYear + 1;
                userAgeGroup = String.valueOf((age / 10) * 10);
                log.info("나이 계산 완료 - 현재나이: {}, 그룹: {}대", age, userAgeGroup);
            } catch (Exception e) {
                log.error("나이 계산 오류: {}", e.getMessage());
            }
        }

        // 3. 유저 태그 추출
        String userTag = (user != null && user.getUserTag() != null) ? user.getUserTag() : "일반";

        // 4. 서비스 호출용 기본 DTO 준비
        TripVO searchVO = new TripVO();
        List<TripVO> aiResultList = new ArrayList<>();

        // 5. [상단 영역] AI 실시간 추천 실행
        String aiQuery = (userInput != null && !userInput.trim().isEmpty()) ? userInput : "추천 여행지";
        
        try {
            List<String> spotNames = aiTripService.getRecommendedSpotNames(aiQuery, userTag);
            if (spotNames != null && !spotNames.isEmpty()) {
                aiResultList = aiTripService.doRetrieveByAiNames(spotNames);
            }
        } catch (Exception e) {
            log.error("AI 추천 통신 중 오류: {}", e.getMessage());
        }

        // AI 결과 실패 시 백업 로직
        if (aiResultList.isEmpty()) {
            aiResultList = aiTripService.doRetrieve(searchVO);
        }

        // --- 핵심: AJAX 요청 여부 판단 ---
        String requestedWith = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equals(requestedWith)) {
            // AJAX 요청이면 JSON 데이터만 담아서 반환 (ResponseBody 역할을 수행)
            return ResponseEntity.ok(aiResultList);
        }

        // 6. [중단/하단 영역] 일반 페이지 로딩 시에만 추가 데이터 로드
        List<TripVO> ageList = aiTripService.getSpotsByAge(searchVO);
        List<TripVO> localList = aiTripService.getSpotsByAddr(searchVO);

        // 7. 데이터 바인딩
        model.addAttribute("list", aiResultList);
        model.addAttribute("ageList", ageList);
        model.addAttribute("localList", localList);
        model.addAttribute("userInput", userInput);
        model.addAttribute("userAgeGroup", userAgeGroup);

        return "ai/ai_trip"; // 일반 요청은 JSP 뷰 경로 반환
    }

    /**
     * [AJAX] 연령대 탭 클릭 시 AI 추천 데이터 갱신
     */
    @RequestMapping(value = "/recommend_age", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripVO> aiRecommendAge(@RequestParam(value = "ageGroup", required = false) String ageGroup) {
        log.info("AJAX 연령대 추천 요청 수신: {}대", ageGroup);
        TripVO ageVO = new TripVO();
        ageVO.setSearchWord(ageGroup + "대"); 
        return aiTripService.getSpotsByAge(ageVO);
    }

    /**
     * [AJAX] 찜하기 추가
     */
    @PostMapping(value = "/wish/add.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String addWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10);
        try {
            int result = aiTripService.doSaveWish(params);
            return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
        } catch (DuplicateKeyException e) {
            return "{\"status\":\"success\", \"msg\":\"already_added\"}";
        } catch (Exception e) {
            return "{\"status\":\"fail\"}";
        }
    }

    /**
     * [AJAX] 찜하기 삭제
     */
    @PostMapping(value = "/wish/delete.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String deleteWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10);
        int result = aiTripService.doDeleteWish(params);
        return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
    }
}