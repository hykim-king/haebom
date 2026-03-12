package com.pcwk.ehr.trip_course;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.TripCourseVO;

import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import jakarta.servlet.http.HttpSession;

import com.pcwk.ehr.domain.RelationVO;
import com.pcwk.ehr.relation.RelationService;
import com.pcwk.ehr.user.UserEntity;

@Controller
@RequestMapping("/trip_course")
@RequiredArgsConstructor
public class TripCourseController {

    final Logger log = LogManager.getLogger(getClass());

    private final TripCourseService tripCourseService;
    private final RelationService relationService;

    /**
     * 여행코스 화면 진입
     */
    @GetMapping("/trip_course")
    public String tripCourseView(TripCourseVO inVO, Model model) {
        log.debug("┌───────────────────────────────────┐");
        log.debug("│ tripCourseView()                  │");
        log.debug("└───────────────────────────────────┘");
        log.debug("inVO={}", inVO);

        if (inVO.getPageNo() == 0) {
            inVO.setPageNo(1);
        }

        if (inVO.getPageSize() == 0) {
            inVO.setPageSize(7);
        }

        if (inVO.getOrderType() == null || inVO.getOrderType().isEmpty()) {
            inVO.setOrderType("new");
        }

        model.addAttribute("vo", inVO);

        return "trip/trip_course";
    }

    /**
     * 여행코스 목록 JSON 조회
     */
    @GetMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripCourseVO> doRetrieve(TripCourseVO inVO) {
        log.debug("┌───────────────────────────────────┐");
        log.debug("│ doRetrieve()                      │");
        log.debug("└───────────────────────────────────┘");
        log.debug("inVO={}", inVO);

        if (inVO.getPageNo() == 0) {
            inVO.setPageNo(1);
        }

        if (inVO.getPageSize() == 0) {
            inVO.setPageSize(7);
        }

        if (inVO.getOrderType() == null || inVO.getOrderType().isEmpty()) {
            inVO.setOrderType("new");
        }

        return tripCourseService.doRetrieve(inVO);
    }

    /**
     * 여행코스 단건 조회
     */
    @GetMapping(value = "/doSelectOne.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public TripCourseVO doSelectOne(TripCourseVO inVO) {
        log.debug("┌───────────────────────────────────┐");
        log.debug("│ doSelectOne()                     │");
        log.debug("└───────────────────────────────────┘");
        log.debug("inVO={}", inVO);

        return tripCourseService.doSelectOne(inVO);
    }

    /**
     * 조회수 증가 API추가
     */
    @GetMapping(value = "/doUpdateInqCnt.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public int doUpdateInqCnt(TripCourseVO inVO) {
        log.debug("┌───────────────────────────────────┐");
        log.debug("│ doUpdateInqCnt()                 │");
        log.debug("└───────────────────────────────────┘");
        log.debug("inVO={}", inVO);

        return tripCourseService.increaseInqCnt(inVO);
    }

    @GetMapping("/detail")
    public String tripCourseDetailView(TripCourseVO inVO, Model model) {
        log.debug("┌───────────────────────────────────┐");
        log.debug("│ tripCourseDetailView()            │");
        log.debug("└───────────────────────────────────┘");
        log.debug("inVO={}", inVO);

        TripCourseVO outVO = tripCourseService.doSelectOne(inVO);
        model.addAttribute("course", outVO);

        return "trip/trip_course_detail";
    }

    /**
     * 여행코스 찜 여부 확인 API
     */
    @GetMapping("/favoriteStatus.do")
    @ResponseBody
    public int favoriteStatus(int courseNo, HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            return 0;
        }

        RelationVO vo = new RelationVO();
        vo.setUserNo(user.getUserNo());
        vo.setCourseNo(courseNo);
        vo.setRelClsf(10);

        return relationService.existsCourseFavorite(vo);
    }

    /**
     * 해당 여행코스의 총 찜 수 조회 API
     */
    @GetMapping("/getFavoriteCount.do")
    @ResponseBody
    public int getFavoriteCount(int courseNo) {
        return relationService.getCourseCount(courseNo);
    }

    /**
     * 여행코스 찜 토글 API
     */
    @GetMapping("/toggleFavorite.do")
    @ResponseBody
    public List<Integer> toggleFavorite(int courseNo, HttpSession session) {
        List<Integer> resultList = new ArrayList<>();

        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            resultList.add(-1); // 로그인 필요
            return resultList;
        }

        RelationVO vo = new RelationVO();
        vo.setUserNo(user.getUserNo());
        vo.setCourseNo(courseNo);
        vo.setRelClsf(10);

        try {
            relationService.toggleCourseFavorite(vo);

            int userTotalCount = relationService.getCountByUser(vo);
            int courseTotalCount = relationService.getCourseCount(courseNo);

            resultList.add(1); // 성공
            resultList.add(userTotalCount); // 사용자의 총 찜 수
            resultList.add(courseTotalCount);// 이 코스의 총 찜 수
        } catch (Exception e) {
            log.error("toggleFavorite error: {}", e.getMessage());
            resultList.add(0); // 실패
        }

        return resultList;
    }
}