package com.pcwk.ehr.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
	private final Logger log = LogManager.getLogger(getClass());
	
	private final AdminService adminService;
	@GetMapping("/statisticChart")
    public String statisticChart(Model model) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ statisticChart() 호출             │");
        log.debug("└──────────────────────────────────┘");

        // 3. 뷰(main.html)로 데이터 전달
//        model.addAttribute("popularList", popularList);
//        model.addAttribute("randomRegionList", randomRegionList);

        // templates/main/main.html 호출
        return "admin/statistic_chart";
    }
	
	@PostMapping("/statisticData")
	@ResponseBody
	public Map<String, Object> statisticData(
	        @RequestParam String type,
	        @RequestParam String year,
	        @RequestParam(required = false) String month
	) {

	    Map<String, Object> param = new HashMap<>();
	    param.put("year", year);
	    param.put("month", month);

	    List<Map<String, Object>> signupChartData;

	    if ("month".equals(type)) {
	    	signupChartData = adminService.getMemberRegistMonth(param);
	    } else if ("day".equals(type)) {
	    	signupChartData = adminService.getMemberRegistDay(param);
	    } else {
	        return Map.of(
	                "result", 0,
	                "message", "invalid type"
	        );
	    }

	    return Map.of(
	            "result", 1,
	            "message", "success",
	            "signupChartData", signupChartData
	    );
	}

}
