package com.pcwk.ehr.support;

import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.domain.UserVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2 // 💡 LogManager 대신 lombok 어노테이션으로 코드를 한 줄 줄입니다.
@Controller
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @GetMapping("/support")
    public String support(@RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                          Model model, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        String userMngrYn = "N";

        if (loginUser != null) {
            // 💡 권한 체크 로직 통합 (Optional하게 처리 가능하지만 직관성을 위해 유지)
            userMngrYn = (loginUser.getUserMngrYn() != null) ? loginUser.getUserMngrYn().trim().toUpperCase() : "N";

            // 💡 테스트 계정 보험 로직
            if ("N".equals(userMngrYn) && "ss@s".equals(loginUser.getUserEmlAddr())) {
                userMngrYn = "Y";
            }
        }

        // 1. 데이터 조회 및 페이징 계산
        int pageSize = 10;
        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(pageNo);
        searchVO.setPageSize(pageSize);

        List<SupportVO> list = supportService.doRetrieve(searchVO);

        int totalCount = (list != null && !list.isEmpty()) ? list.get(0).getTotalCnt() : 0;
        int totalPages = (int) Math.ceil((double) totalCount / pageSize);
        int startPage = ((pageNo - 1) / 5) * 5 + 1;
        int endPage = Math.min(startPage + 4, totalPages);

        // 2. 모델 전달 (중복 로그 제거 및 정제)
        model.addAttribute("list", list);
        model.addAttribute("userMngrYn", userMngrYn);
        model.addAttribute("currentPage", pageNo);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("totalPages", totalPages);

        log.info("지원 페이지 접속 - 유저: {}, 권한: {}, 리스트: {}건",
                (loginUser != null ? loginUser.getUserEmlAddr() : "비로그인"), userMngrYn, totalCount);

        return "support/support";
    }

    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(@RequestBody SupportVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "로그인 정보가 없습니다.";

        // 💡 관리자 차단 (보험 로직 포함)
        if ("Y".equals(loginUser.getUserMngrYn()) || "ss@s".equals(loginUser.getUserEmlAddr())) {
            return "관리자 계정으로는 문의글 작성이 불가능합니다.";
        }

        // 유저 번호 복구 (supportService 활용)
        if (loginUser.getUserNo() == null) {
            int recoveredNo = supportService.getUserIdByEmail(loginUser.getUserEmlAddr());
            if (recoveredNo > 0) loginUser.setUserNo(recoveredNo);
            else return "유저 정보를 찾을 수 없습니다.";
        }

        inVO.setRegNo(loginUser.getUserNo());
        return String.valueOf(supportService.doSave(inVO));
    }

    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(@RequestBody SupportVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");

        if (loginUser == null || (!"Y".equals(loginUser.getUserMngrYn()) && !"ss@s".equals(loginUser.getUserEmlAddr()))) {
            return "관리자만 답변 등록이 가능합니다.";
        }

        int flag = supportService.doUpdate(inVO);
        return String.valueOf(flag);
    }

    @PostMapping("/doDelete.do")
    @ResponseBody
    public String doDelete(SupportVO inVO) {
        return String.valueOf(supportService.doDelete(inVO));
    }

    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public SupportVO doSelectOne(@RequestBody SupportVO inVO) {
        return supportService.doSelectOne(inVO);
    }
}