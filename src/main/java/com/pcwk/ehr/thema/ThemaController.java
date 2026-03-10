package com.pcwk.ehr.thema;

import com.pcwk.ehr.domain.TripDetailVO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.relation.RelationService;
import com.pcwk.ehr.trip.TripService;
import com.pcwk.ehr.trip.TripDetailService;

import com.pcwk.ehr.user.UserEntity;

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
import org.springframework.ui.Model;

@Controller
@RequestMapping("/thema")
public class ThemaController {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private RelationService relationService;

    @Autowired
    private ThemaService themaService;

    @Autowired
    private TripService tripService;

    @Autowired
    private TripDetailService tripDetailService;

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
        if (searchVO.getTripTag() == null || searchVO.getTripTag().trim().isEmpty()) {
            searchVO.setTripTag("0");
        }
        if (searchVO.getPageNo() <= 0) {
            searchVO.setPageNo(1);
        }
        if (searchVO.getPageSize() <= 0) {
            searchVO.setPageSize(8);
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

        // UserVO -> UserEntity로 변경
        UserEntity user = (UserEntity) session.getAttribute("user");
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

        // UserVO -> UserEntity로 변경
        UserEntity user = (UserEntity) session.getAttribute("user");
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

    @PostMapping(value = "/wish/add.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String addWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        // UserVO -> UserEntity로 변경
        UserEntity user = (UserEntity) session.getAttribute("user");

        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            log.warn("찜하기 실패: 로그인 필요");
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }

        log.info("찜 추가 실행 - 유저: {}, ID: {}", user.getUserNo(), tripContsId);

        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10);

        try {
            int result = themaService.doSaveWish(params);
            return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
        } catch (DuplicateKeyException e) {
            String rootMsg = (e.getRootCause() != null) ? e.getRootCause().getMessage() : e.getMessage();

            log.error("==== 찜하기 중복 발생 상세 분석 ====");
            log.error("유저번호: {}, 여행지ID: {}", user.getUserNo(), tripContsId);
            log.error("DB 에러 원인: {}", rootMsg);

            if (rootMsg.contains("PK_RELATION")) {
                log.error("검토 결과: PK_RELATION 제약 조건 충돌!");
            } else if (rootMsg.contains("UK_") || rootMsg.contains("SYS_C")) {
                log.error("검토 결과: 유니크 제약 조건 충돌!");
            }
            log.error("==================================");

            return "{\"status\":\"success\", \"msg\":\"already_added\"}";
        } catch (Exception e) {
            log.error("찜하기 저장 중 에러: {}", e.getMessage());
            return "{\"status\":\"fail\"}";
        }
    }

    @PostMapping(value = "/wish/delete.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String deleteWish(@RequestParam("tripContsId") String tripContsId, HttpSession session) {
        // UserVO -> UserEntity로 변경
        UserEntity user = (UserEntity) session.getAttribute("user");

        if (user == null || user.getUserNo() == null || user.getUserNo() == 0) {
            return "{\"status\":\"fail\", \"msg\":\"login_required\"}";
        }

        log.info("찜 삭제 실행 - 유저: {}, ID: {}", user.getUserNo(), tripContsId);

        Map<String, Object> params = new HashMap<>();
        params.put("userNo", user.getUserNo());
        params.put("tripContsId", Long.parseLong(tripContsId));
        params.put("relClsf", 10);

        int result = themaService.doDeleteWish(params);

        if (result == 0) {
            log.warn("찜 삭제 대상이 DB에 없습니다. 조건 확인: {}", params);
        }

        return (result > 0) ? "{\"status\":\"success\"}" : "{\"status\":\"fail\"}";
    }

    /**
     * 2. 여행지 상세 화면
     */
    @GetMapping("/trip_view")
    public String tripView(TripVO tripVO, Model model, HttpSession session) {
        // 💡 UserEntity로 세션 정보 획득
        UserEntity user = (UserEntity) session.getAttribute("user");
        Integer userNo = (user != null) ? user.getUserNo() : null;

        // 1. 기본 정보 조회
        TripVO outVO = tripService.upDoSelectOne(tripVO);

        // 2. 상세 정보 조회
        TripDetailVO detailSearch = new TripDetailVO();
        detailSearch.setTripContsId(tripVO.getTripContsId());
        TripDetailVO detailVO = tripDetailService.doSelectOne(detailSearch);

        if (outVO != null) {
            model.addAttribute("vo", outVO);
        }

        if (detailVO != null) {
            model.addAttribute("detailVo", detailVO);
        }
        model.addAttribute("userNo", userNo);

        // 찜수 카운트
        int favoriteCount = relationService.getCount(tripVO.getTripContsId());
        model.addAttribute("favoriteCount", favoriteCount);

        log.info("tripView sessionId={}, userNo={}", session.getId(), userNo);
        return "trip/trip_view";
    }
}
