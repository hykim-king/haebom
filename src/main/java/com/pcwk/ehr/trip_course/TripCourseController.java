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

@Controller
@RequestMapping("/trip_course")
@RequiredArgsConstructor
public class TripCourseController {

    final Logger log = LogManager.getLogger(getClass());

    private final TripCourseService tripCourseService;

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
            inVO.setPageSize(10);
        }

        if (inVO.getOrderType() == null || inVO.getOrderType().isEmpty()) {
            inVO.setOrderType("new");
        }

        List<TripCourseVO> list = tripCourseService.doRetrieve(inVO);

        int totalCnt = 0;
        if (list != null && !list.isEmpty()) {
            totalCnt = list.get(0).getTotalCnt();
        }

        model.addAttribute("list", list);
        model.addAttribute("totalCnt", totalCnt);
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
            inVO.setPageSize(10);
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
}