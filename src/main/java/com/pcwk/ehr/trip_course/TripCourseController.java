package com.pcwk.ehr.trip_course;

import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.RelationVO;
import com.pcwk.ehr.domain.TripCourseVO;
import com.pcwk.ehr.relation.RelationService;
import com.pcwk.ehr.user.UserEntity;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/trip_course")
@RequiredArgsConstructor
public class TripCourseController {

    final Logger log = LogManager.getLogger(getClass());

    private final TripCourseService tripCourseService;
    private final RelationService relationService;

    private Integer getUserNo(HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        return (user == null) ? null : user.getUserNo();
    }

    /** 여행코스 목록 화면 */
    @GetMapping("")
    public String tripCourseView(TripCourseVO inVO, Model model) {
        if (inVO.getPageNo() == 0)   inVO.setPageNo(1);
        if (inVO.getPageSize() == 0) inVO.setPageSize(7);
        if (inVO.getOrderType() == null || inVO.getOrderType().isEmpty()) inVO.setOrderType("new");
        model.addAttribute("vo", inVO);
        return "trip/trip_course";
    }

    /** 여행코스 목록 JSON */
    @GetMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripCourseVO> doRetrieve(TripCourseVO inVO) {
        if (inVO.getPageNo() == 0)   inVO.setPageNo(1);
        if (inVO.getPageSize() == 0) inVO.setPageSize(7);
        if (inVO.getOrderType() == null || inVO.getOrderType().isEmpty()) inVO.setOrderType("new");
        return tripCourseService.doRetrieve(inVO);
    }

    /** 여행코스 단건 조회 JSON */
    @GetMapping(value = "/doSelectOne.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public TripCourseVO doSelectOne(TripCourseVO inVO) {
        return tripCourseService.doSelectOne(inVO);
    }

    /** 조회수 증가 */
    @GetMapping(value = "/doUpdateInqCnt.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public int doUpdateInqCnt(TripCourseVO inVO) {
        return tripCourseService.increaseInqCnt(inVO);
    }

    /** 여행코스 상세 페이지 (지도 포함) */
    @GetMapping("/detail")
    public String tripCourseDetailView(TripCourseVO inVO, Model model) {
        model.addAttribute("course", tripCourseService.doSelectOne(inVO));
        return "trip/trip_course_detail";
    }

    /** 코스 경로 좌표 API (지도 폴리라인용) */
    @GetMapping(value = "/getCourseRoute.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Object getCourseRoute(@RequestParam int courseNo, HttpSession session) {
        if (getUserNo(session) == null) return "로그인이 필요합니다.";
        return tripCourseService.getCourseRoute(courseNo);
    }

    /** 찜 여부 확인 */
    @GetMapping("/favoriteStatus.do")
    @ResponseBody
    public int favoriteStatus(int courseNo, HttpSession session) {
        Integer userNo = getUserNo(session);
        if (userNo == null) return 0;
        RelationVO vo = new RelationVO();
        vo.setUserNo(userNo);
        vo.setCourseNo(courseNo);
        vo.setRelClsf(10);
        return relationService.existsCourseFavorite(vo);
    }

    /** 총 찜 수 조회 */
    @GetMapping("/getFavoriteCount.do")
    @ResponseBody
    public int getFavoriteCount(int courseNo) {
        return relationService.getCourseCount(courseNo);
    }

    /** 찜 토글 */
    @GetMapping("/toggleFavorite.do")
    @ResponseBody
    public List<Integer> toggleFavorite(int courseNo, HttpSession session) {
        List<Integer> result = new ArrayList<>();
        Integer userNo = getUserNo(session);
        if (userNo == null) {
            result.add(-1);
            return result;
        }
        RelationVO vo = new RelationVO();
        vo.setUserNo(userNo);
        vo.setCourseNo(courseNo);
        vo.setRelClsf(10);
        try {
            relationService.toggleCourseFavorite(vo);
            result.add(1);
            result.add(relationService.getCountByUser(vo));
            result.add(relationService.getCourseCount(courseNo));
        } catch (Exception e) {
            log.error("toggleFavorite error: {}", e.getMessage());
            result.add(0);
        }
        return result;
    }
}