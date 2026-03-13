package com.pcwk.ehr.admin;

import com.pcwk.ehr.comment.CommentMapper;
import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.domain.ReportVO;
import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.report.ReportMapper;
import com.pcwk.ehr.support.SupportService;
import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final Logger log = LogManager.getLogger(getClass());

    private final UserService userService;
    private final CommentMapper commentMapper;
    private final ReportMapper reportMapper;
    private final SupportService supportService;
    private final AdminService adminService;

    @GetMapping("/users")
    public String getUserList() {
        return "admin/admin";
    }

    // ---------------- 사용자 관리 ----------------

    @GetMapping("/users/api")
    @ResponseBody
    public List<UserEntity> getUserListApi() {
        log.info("관리자: 사용자 목록 데이터 요청");
        return userService.getAllUsers();
    }

    @PatchMapping("/users/{userNo}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer userNo, @RequestParam String status) {
        log.info("관리자: 사용자 상태 업데이트 요청 - 번호: {}, 대상 상태: {}", userNo, status);
        userService.updateUserStatus(userNo, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userNo}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userNo) {
        log.info("관리자: 사용자 삭제 요청 - 번호: {}", userNo);
        userService.deleteUser(userNo);
        return ResponseEntity.ok().build();
    }

    // ---------------- 댓글 관리 ----------------

    @GetMapping("/comments/api")
    @ResponseBody
    public Map<String, Object> getComments(CommentVO commentVO) {
        log.info("관리자 댓글 목록 조회 요청: {}", commentVO);

        if (commentVO.getPageNo() <= 0) commentVO.setPageNo(1);
        if (commentVO.getPageSize() <= 0) commentVO.setPageSize(10);

        List<Map<String, Object>> list = commentMapper.doAdminRetrieve(commentVO);
        int totalCnt = commentMapper.getSearchCount(commentVO);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCnt", totalCnt);
        result.put("pageNo", commentVO.getPageNo());
        result.put("pageSize", commentVO.getPageSize());

        return result;
    }

    @PatchMapping("/comments/{cmtNo}/hide")
    @ResponseBody
    public ResponseEntity<?> updateCommentHideStatus(@PathVariable int cmtNo,
                                                     @RequestParam String cmtHideYn,
                                                     Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String loginId = principal.getName();

        UserEntity user = userService.getAllUsers().stream()
                .filter(u -> loginId.equals(u.getUserEmlAddr()) || loginId.equals(u.getUserProviderId()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유저 정보를 찾을 수 없습니다.");
        }

        CommentVO vo = new CommentVO();
        vo.setCmtNo(cmtNo);
        vo.setCmtHideYn(cmtHideYn);
        vo.setModNo(user.getUserNo());

        int result = commentMapper.updateHideYn(vo);
        return result > 0 ? ResponseEntity.ok().build()
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    // ---------------- 신고 관리 ----------------

    @GetMapping("/reports/list")
    @ResponseBody
    public Map<String, Object> getReportList(ReportVO reportVO) {
        if (reportVO.getPageNo() <= 0) reportVO.setPageNo(1);
        if (reportVO.getPageSize() <= 0) reportVO.setPageSize(20);

        List<Map<String, Object>> list = reportMapper.doSelectAdminList(reportVO);
        int totalCnt = reportMapper.getAdminReportCount(reportVO);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCnt", totalCnt);
        return result;
    }

    @GetMapping("/reports/stats")
    @ResponseBody
    public Map<String, Object> getReportStats() {
        return reportMapper.getReportStats();
    }

    @GetMapping("/reports/{repNo}")
    @ResponseBody
    public Map<String, Object> getReportDetail(@PathVariable int repNo) {
        ReportVO vo = new ReportVO();
        vo.setRepNo(repNo);
        return reportMapper.RpdoSelectAdmin(vo);
    }

    @PostMapping("/reports/process")
    @ResponseBody
    public ResponseEntity<?> processReport(@RequestBody ReportVO reportVO) {
        log.info("관리자: 신고 처리 요청 - repNo: {}, repStatYn: {}", reportVO.getRepNo(), reportVO.getRepStatYn());

        int result = reportMapper.RpdoUpdateAdmin(reportVO);
        if (result > 0) {
            return ResponseEntity.ok().body("정상적으로 처리되었습니다.");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    // ---------------- 문의사항 관리 ----------------

    @PostMapping("/inquiries/{supNo}/reply")
    @ResponseBody
    public ResponseEntity<?> replyInquiry(@PathVariable int supNo,
                                          @RequestBody SupportVO supportVO) {
        log.info("관리자: 문의 답변 등록 - supNo: {}", supNo);
        supportVO.setSupNo(supNo);
        int result = supportService.doUpdate(supportVO);
        if (result > 0) {
            return ResponseEntity.ok().body("1");
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("0");
    }

    // ---------------- 데이터 통계 ----------------

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
        List<Map<String, Object>> reportChartData;

        if ("month".equals(type)) {
            param.put("startDate", year + "0101");
            param.put("endDate", year + "1231");

            signupChartData = adminService.getMemberRegistMonth(param);
            reportChartData = adminService.getReportCount(param);

        } else if ("day".equals(type)) {
            String mm = String.format("%02d", Integer.parseInt(month));

            java.time.LocalDate start = java.time.LocalDate.of(Integer.parseInt(year), Integer.parseInt(mm), 1);
            java.time.LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

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

    @GetMapping("/inquiries/api")
    @ResponseBody
    public Map<String, Object> getInquiries(SupportVO supportVO) {
        log.info("관리자 문의 목록 조회 요청: {}", supportVO);

        if (supportVO.getPageNo() <= 0) supportVO.setPageNo(1);
        if (supportVO.getPageSize() <= 0) supportVO.setPageSize(20);

        List<SupportVO> list = supportService.doRetrieve(supportVO);

        // Mapper의 COUNT(*) OVER() AS total_cnt 구조 사용
        int totalCnt = 0;
        if (list != null && !list.isEmpty()) {
            totalCnt = list.get(0).getTotalCnt();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCnt", totalCnt);
        result.put("pageNo", supportVO.getPageNo());
        result.put("pageSize", supportVO.getPageSize());

        return result;
    }
}