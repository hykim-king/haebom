package com.pcwk.ehr.report;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.ReportVO;
import com.pcwk.ehr.user.UserEntity;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 팝업 페이지
     */
    @GetMapping("/popup")
    public String reportPopup(@RequestParam("cmtNo") int cmtNo, Model model) {
        model.addAttribute("cmtNo", cmtNo);
        return "fragment/report_popup";
    }

    /**
     * 신고 등록 API
     */
    @PostMapping("/doSave.do")
    @ResponseBody
    public Map<String, Object> doSave(@RequestBody ReportVO inVO, HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            result.put("status", -1);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        inVO.setRegNo(user.getUserNo());
        int flag = reportService.doSave(inVO);
        result.put("status", flag);
        result.put("message", flag == 1 ? "신고가 접수되었습니다." : "신고 접수에 실패했습니다.");
        return result;
    }
}
