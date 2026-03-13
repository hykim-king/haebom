package com.pcwk.ehr.trip;

import java.util.ArrayList;
import java.util.List;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;

import lombok.RequiredArgsConstructor;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserEntity; // 💡 세션 관리를 위해 반드시 추가

import jakarta.servlet.http.HttpSession;

import com.pcwk.ehr.area.AreaService;
import com.pcwk.ehr.domain.AreaVO;
import com.pcwk.ehr.domain.RelationVO;
import com.pcwk.ehr.domain.TripDetailVO;
import com.pcwk.ehr.relation.RelationService;

import com.pcwk.ehr.domain.DisasterResponseVO;
import com.pcwk.ehr.util.disaster.DisasterService;

@Controller
@RequestMapping("/trip")
@RequiredArgsConstructor
public class TripController {
    final Logger log = LogManager.getLogger(getClass());

    private final TripService tripService;
    private final AreaService areaService;
    private final TripDetailService tripDetailService;
    private final RelationService relationService;
    private final DisasterService disasterService;

    /**
     * 1. 여행지 목록 화면 (초기 로딩용)
     */
    @GetMapping("")
    public String tripList(TripVO tripVO, Model model) {
        if (tripVO.getPageNo() == 0)
            tripVO.setPageNo(1);
        if (tripVO.getPageSize() == 0)
            tripVO.setPageSize(10);

        List<TripVO> list = tripService.doRetrieve(tripVO);
        int totalCnt = (list != null && !list.isEmpty()) ? list.get(0).getTotalCnt() : 0;

        model.addAttribute("list", list);
        model.addAttribute("totalCnt", totalCnt);
        model.addAttribute("vo", tripVO);

        return "trip/trip";
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

    /**
     * 상세 데이터 JSON 반환 API
     */
    @GetMapping("/getTripDetail.do")
    @ResponseBody
    public TripDetailVO getTripDetailJson(TripDetailVO tripDetailVO) {
        return tripDetailService.doSelectOne(tripDetailVO);
    }

    /**
     * 3. 여행지 목록 API (JS fetch 연동용)
     */
    @GetMapping("/doRetrieveJson.do")
    @ResponseBody
    public List<TripVO> doRetrieveJson(TripVO tripVO) {
        if (tripVO.getPageNo() == 0)
            tripVO.setPageNo(1);
        if (tripVO.getPageSize() == 0)
            tripVO.setPageSize(10);
        return tripService.doRetrieve(tripVO);
    }

    /**
     * 4. 시도 목록 API
     */
    @GetMapping("/getCtpvList.do")
    @ResponseBody
    public List<AreaVO> getCtpvList() {
        return areaService.getCtpvList();
    }

    /**
     * 5. 특정 시도의 시군구 목록 API
     */
    @GetMapping("/getGnguList.do")
    @ResponseBody
    public List<AreaVO> getGnguList(AreaVO areaVO) {
        return areaService.getGnguList(areaVO);
    }

    /**
     * 6. 실제 사용 중인 테마 태그 목록 조회
     */
    @GetMapping("/getTripTags.do")
    @ResponseBody
    public List<String> getTripTags() {
        return tripService.getDistinctTags();
    }

    /**
     * 7. 찜 여부 확인 API
     */
    @GetMapping("/favoriteStatus.do")
    @ResponseBody
    public int favoriteStatus(@RequestParam("tripContsId") int tripContsId, HttpSession session) {
        // 💡 UserEntity로 세션 정보 획득
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null)
            return 0;

        RelationVO vo = new RelationVO();
        vo.setUserNo(user.getUserNo());
        vo.setTripContsId(tripContsId);

        return relationService.existsFavorite(vo);
    }

    /**
     * 해당 여행지의 총 찜수 조회 API
     */
    @GetMapping("/getCount.do")
    @ResponseBody
    public int getCount(@RequestParam int tripContsId) {
        return relationService.getCount(tripContsId);
    }

    /**
     * 8. 찜하기 / 취소 실행 (토글)
     */
    @GetMapping("/toggleFavorite.do")
    @ResponseBody
    public List<Integer> toggleFavorite(
            @RequestParam(value = "tripContsId", required = true) int tripContsId,
            HttpSession session) {

        List<Integer> resultList = new ArrayList<>();
        // 💡 UserEntity로 세션 정보 획득
        UserEntity user = (UserEntity) session.getAttribute("user");

        if (user == null) {
            resultList.add(-1); // 로그인 필요
            return resultList;
        }

        RelationVO vo = new RelationVO();
        vo.setUserNo(user.getUserNo());
        vo.setTripContsId(tripContsId);
        vo.setRelClsf(10); // 찜 분류 코드

        try {
            // 1. 토글 실행 (Insert 또는 Delete)
            relationService.toggleFavorite(vo);

            // 2. 결과 데이터 수집
            int userTotalCount = relationService.getCountByUser(vo);
            int tripTotalCount = relationService.getCount(tripContsId);

            resultList.add(1); // 성공 여부
            resultList.add(userTotalCount); // 사용자의 총 찜 개수
            resultList.add(tripTotalCount); // 이 여행지의 총 찜 개수
        } catch (Exception e) {
            log.error("toggleFavorite error: {}", e.getMessage());
            resultList.add(0); // 실패
        }

        return resultList;
    }

    @GetMapping("/disaster/current.do")
    @ResponseBody
    public DisasterResponseVO getCurrentDisaster(
            @RequestParam("ctpvNm") String ctpvNm,
            @RequestParam("sggNm") String sggNm) {

        return disasterService.getDisasterByRegion(ctpvNm, sggNm);
    }

}