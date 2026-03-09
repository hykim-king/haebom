package com.pcwk.ehr.thema;

import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/thema")
public class ThemaController {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private ThemaService themaService;

    @GetMapping({ "", "/" })
    public String themaRoot() {
        log.info("┌──────────────────────────┐");
        log.info("│ themaRoot() - 이동       │");
        log.info("└──────────────────────────┘");

        return "thema/thema";
    }

    private TripVO defaultSetting(TripVO searchVO) {
        if (searchVO == null) {
            searchVO = new TripVO();
        }
        // tripTag가 null이거나 비어있으면 "0"으로 세팅
        if (searchVO.getTripTag() == null || searchVO.getTripTag().trim().isEmpty()) {
            searchVO.setTripTag("0");
        }
        // ⭐ 페이징 및 검색어 기본값 강제 세팅
        if (searchVO.getPageNo() <= 0) {
            searchVO.setPageNo(1);
        }
        if (searchVO.getPageSize() <= 0) {
            searchVO.setPageSize(8); // 로그 분석 결과에 맞춰 8로 조정
        }
        if (searchVO.getSearchWord() == null || searchVO.getSearchWord().trim().isEmpty()) {
            searchVO.setSearchWord("default");
        }

        return searchVO;
    }

    @PostMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripVO> doRetrievePost(@RequestBody(required = false) TripVO searchVO, HttpSession session) {
        log.info("doRetrievePost() (JSON)");
        searchVO = defaultSetting(searchVO);

        // ⭐ 로그인 사용자의 경우 하트(isWish) 표시를 위해 유저 번호 세팅
        UserVO user = (UserVO) session.getAttribute("user");
        if (user != null) {
            searchVO.setTripInqCnt(user.getUserNo());
        } else {
            searchVO.setTripInqCnt(0);
        }

        List<TripVO> list = themaService.doRetrieve(searchVO);
        return (list == null) ? Collections.emptyList() : list;
    }

    @GetMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripVO> doRetrieveGet(TripVO searchVO, HttpSession session) {
        log.info("doRetrieveGet() (Query)");
        searchVO = defaultSetting(searchVO);

        UserVO user = (UserVO) session.getAttribute("user");
        if (user != null) {
            searchVO.setTripInqCnt(user.getUserNo());
        } else {
            searchVO.setTripInqCnt(0);
        }

        List<TripVO> list = null;
        try {
            list = themaService.doRetrieve(searchVO);
        } catch (Exception e) {
            log.error("Service 호출 중 에러 발생: {}", e.getMessage());
        }

        return (list == null) ? Collections.emptyList() : list;
    }

    // ---------------------------------------------------------
    // ⭐ 찜하기 추가 (AJAX) - 예외 처리 및 타입 변환 통합
    // ---------------------------------------------------------
    @PostMapping(value = "/wish/add.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String addWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        UserVO user = (UserVO) session.getAttribute("user");

        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            log.warn("찜하기 실패: 로그인 필요");
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }

        log.info("찜 추가 실행 - 유저: {}, ID: {}", user.getUserNo(), tripContsId);

        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        // ⭐ DB NUMBER 타입에 맞춰 Long과 Integer로 변환
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10); 

        try {
            int result = themaService.doSaveWish(params);
            return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
        } catch (DuplicateKeyException e) {
    // 1. 상세 에러 메시지 추출 (ORA-00001: unique constraint (계정명.제약조건명) violated)
    String rootMsg = (e.getRootCause() != null) ? e.getRootCause().getMessage() : e.getMessage();
    
    log.error("==== 찜하기 중복 발생 상세 분석 ====");
    log.error("유저번호: {}, 여행지ID: {}", user.getUserNo(), tripContsId);
    log.error("DB 에러 원인: {}", rootMsg);
    
    // 2. 제약 조건 이름에 따른 분기 처리 (선택 사항)
    if (rootMsg.contains("PK_RELATION")) {
        log.error("검토 결과: PK_RELATION 제약 조건 충돌! (REL_NO가 중복되었거나 PK 설정이 잘못됨)"); 
    } else if (rootMsg.contains("UK_") || rootMsg.contains("SYS_C")) {
        log.error("검토 결과: 유니크 제약 조건 충돌! (이미 동일한 유저가 이 여행지를 찜함)");
    }
    log.error("==================================");

    return "{\"status\":\"success\", \"msg\":\"already_added\"}";
} catch (Exception e) {
            log.error("찜하기 저장 중 에러: {}", e.getMessage());
            return "{\"status\":\"fail\"}";
        }
    }

    // ---------------------------------------------------------
    // ⭐ 찜하기 삭제 (AJAX) - 타입 변환 및 로그 강화 통합
    // ---------------------------------------------------------
    @PostMapping(value = "/wish/delete.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String deleteWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        UserVO user = (UserVO) session.getAttribute("user");

        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }

        log.info("찜 삭제 실행 - 유저: {}, ID: {}", user.getUserNo(), tripContsId);

        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        // ⭐ DB 검색 정확도를 위해 타입을 숫자로 일치시킴
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10); 

        int result = themaService.doDeleteWish(params);
        
        if (result == 0) {
            log.warn("찜 삭제 대상이 DB에 없습니다. 조건 확인: {}", params);
        }

        return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
    }
}