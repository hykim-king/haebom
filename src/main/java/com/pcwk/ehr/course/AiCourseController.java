/**
 *
 */
package com.pcwk.ehr.course;

import com.pcwk.ehr.course.AiCourseReq;
import com.pcwk.ehr.domain.AreaVO;

import jakarta.servlet.http.HttpSession;

import com.pcwk.ehr.area.AreaService;
import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.course.AiCourseFacadeService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/course")
public class AiCourseController {


	@Autowired
    AiCourseFacadeService aiCourseFacadeService;

    @Autowired
    AreaService areaService;

    @Autowired
    AttachFileMapper attachFileMapper;

    //여행지 디테일 사진
    @GetMapping("/trip/images")
    @ResponseBody
    public List<String> getTripImages(@RequestParam Long boardId){

        return attachFileMapper.findImagesByBoardId(boardId);

    }




    /**
     * 여행 기간 선택 페이지
     */
    @GetMapping("/ai/date")
    public String datePage(){

        return "course/ai_trip_course_date";
    }

    /**
     * 여행 테마 선택 페이지
     */
    @GetMapping("/ai/theme")
    public String themePage(HttpSession session){
    	session.removeAttribute("AI_COURSE_RESULT");

        return "course/ai_trip_course_theme";
    }


    /**
     * AI 여행 시작 페이지
     */
    @GetMapping("/ai")
    public String aiCourseMain(HttpSession session){
    	session.removeAttribute("AI_COURSE_RESULT");

        return "course/ai_trip_course";
    }

    /**
     * 지역 선택 페이지
     */
    @GetMapping("/ai/locate")
    public String locatePage(Model model){

        List<AreaVO> regions = areaService.getCtpvList();

        model.addAttribute("regions", regions);

        return "course/ai_trip_course_locate";
    }

    /**
     * 군구 조회 (AJAX)
     */
    @GetMapping("/gungu")
    @ResponseBody
    public List<AreaVO> getGungu(@RequestParam int tripCtpv){

        AreaVO param = new AreaVO();
        param.setTripCtpv(tripCtpv);

        return areaService.getGnguList(param);
    }




    @GetMapping("/ai/recommend")
    public String recommendCourse(
            @RequestParam String regionName,
            @RequestParam(required = false) String gunguName,
            @RequestParam int days,
            @RequestParam List<String> themes,
            Model model,
            HttpSession session
    ) {

        Map<String, Object> pageData =
                (Map<String, Object>) session.getAttribute("AI_COURSE_RESULT");

        if (pageData == null) {

            AiCourseReq req = AiCourseReq.builder()
                    .regionName(regionName)
                    .gunguName(gunguName)
                    .days(days)
                    .themes(themes)
                    .build();

            pageData = aiCourseFacadeService.getAiCoursePageData(req);

            session.setAttribute("AI_COURSE_RESULT", pageData);
        }

        model.addAttribute("aiRes", pageData.get("aiRes"));
        model.addAttribute("courseItems", pageData.get("courseItems"));
        model.addAttribute("regionName", regionName);
        model.addAttribute("gunguName", gunguName);
        model.addAttribute("days", days);
        model.addAttribute("themes", themes);

        return "course/ai_course_view";
    }
}