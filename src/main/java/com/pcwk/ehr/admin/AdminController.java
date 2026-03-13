package com.pcwk.ehr.admin;

import java.time.LocalDate;
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

import com.pcwk.ehr.config.SecurityConfig;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SecurityConfig securityConfig;
    private final AdminService adminService;

    private final Logger log = LogManager.getLogger(getClass());

    @GetMapping("/statisticChart")
    public String statisticChart(Model model) {
        log.debug("┌──────────────────────────────────┐");
        log.debug("│ statisticChart() 호출             │");
        log.debug("└──────────────────────────────────┘");

        return "admin/statistic_chart";
    }

    @PostMapping("/statisticData")
//    @GetMapping("/statisticData")
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
        List<Map<String, Object>> reportChartData;

        if ("month".equals(type)) {
            param.put("startDate", year + "0101");
            param.put("endDate", year + "1231");

            signupChartData = adminService.getMemberRegistMonth(param);
            reportChartData = adminService.getReportCount(param);

        } else if ("day".equals(type)) {
            String mm = String.format("%02d", Integer.parseInt(month));
            
      
            LocalDate start = LocalDate.of(Integer.parseInt(year), Integer.parseInt(mm), 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            
            param.put("startDate", start.toString().replace("-", ""));
            param.put("endDate", end.toString().replace("-", ""));

            signupChartData = adminService.getMemberRegistDay(param);
            reportChartData = adminService.getReportCount(param);

        } else {
            return Map.of(
                    "result", 0,
                    "message", "invalid type"
            );
        }

        return Map.of(
                "result", 1,
                "message", "success",
                "signupChartData", signupChartData,
                "reportChartData", reportChartData
        );
    }
}