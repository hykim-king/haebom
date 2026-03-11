package com.pcwk.ehr.course;

import com.pcwk.ehr.domain.CourseVO;
import com.pcwk.ehr.user.UserEntity;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/course")
@RequiredArgsConstructor
public class CourseController {

    final Logger log = LogManager.getLogger(getClass());
    private final CourseService courseService;

    private Integer getUserNo(HttpSession session) {
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) return null;
        return user.getUserNo();
    }

    /**
     * ★ 기본 경로 매핑
     */
    @GetMapping("")
    public String coursePage() {
        return "course/trip_course_ex";
    }


    /**
     * ★ 코스 상세 페이지
     * GET /course/course_view?courseNo=14
     */
    @GetMapping("/course_view")
    public String courseView(@RequestParam int courseNo, Model model) {
        CourseVO courseVO = courseService.getCourseDetail(courseNo);

        model.addAttribute("vo", courseVO);
        return "course/trip_course_view";
    }

    /**
     * ★ 코스 상세 API (JS fetch용)
     */
    @GetMapping("/getCourseDetail.do")
    @ResponseBody
    public ResponseEntity<?> getCourseDetail(@RequestParam int courseNo) {
        CourseVO courseVO = courseService.getCourseDetail(courseNo);
        if (courseVO == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(courseVO);
    }

    /**
     * 코스 목록 JSON API
     */
    @GetMapping("/doRetrieveJson.do")
    @ResponseBody
    public ResponseEntity<?> doRetrieveJson(CourseVO courseVO) {
        if (courseVO.getPageNo() == 0) courseVO.setPageNo(1);
        if (courseVO.getPageSize() == 0) courseVO.setPageSize(9);
        return ResponseEntity.ok(courseService.doRetrieve(courseVO));
    }

    /**
     * 코스 경로 좌표 API
     */
    @GetMapping("/getCourseRoute.do")
    @ResponseBody
    public ResponseEntity<?> getCourseRoute(@RequestParam int courseNo, HttpSession session) {
        Integer userNo = getUserNo(session);
        if (userNo == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        return ResponseEntity.ok(courseService.getCourseRoute(courseNo, userNo));
    }
}