package com.pcwk.ehr.support;

import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.domain.UserVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final Logger log = LogManager.getLogger(getClass());

    // 1. 리스트 조회 및 메인 화면
    @GetMapping("/support")
    public String support(@RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                          Model model, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        String userMngrYn = "N";

        if (loginUser != null) {
            // 💡 [디버깅] 현재 로그인한 사람의 이메일이 정확히 뭔지 서버 콘솔에 찍어봅니다.
            log.info("현재 로그인 유저 이메일: [{}]", loginUser.getUserEmlAddr());

            // 💡 이메일 주소를 복사해서 아래 따옴표 안에 정확히 넣으세요. (대소문자 구분 필수!)
            if ("하니님의_실제_이메일@naver.com".equals(loginUser.getUserEmlAddr())) {
                userMngrYn = "Y";
                log.info("성공: 관리자 이메일 일치! Y를 부여합니다.");
            } else {
                userMngrYn = (loginUser.getUserMngrYn() != null) ? loginUser.getUserMngrYn() : "N";
            }
        }
        model.addAttribute("userMngrYn", userMngrYn);
        log.info("HTML로 전달되는 최종 값: [{}]", userMngrYn);

        // 페이징 및 리스트 조회
        int pageSize = 10;
        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(pageNo);
        searchVO.setPageSize(pageSize);

        List<SupportVO> list = supportService.doRetrieve(searchVO);
        log.info("조회된 리스트 개수: {}", (list != null) ? list.size() : 0);
        int totalCount = (list != null && !list.isEmpty()) ? list.get(0).getTotalCnt() : 0;
        int totalPages = (int) Math.ceil((double) totalCount / pageSize);
        int startPage = ((pageNo - 1) / 5) * 5 + 1;
        int endPage = Math.min(startPage + 4, totalPages);

        model.addAttribute("list", list);
        model.addAttribute("currentPage", pageNo);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("totalPages", totalPages);

        log.info("최종적으로 HTML에 던지는 값: [{}]", model.getAttribute("userMngrYn"));

        return "support/support";
    }

    // 2. 문의글 저장 (관리자 작성 차단 포함)
    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(@RequestBody SupportVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "로그인 정보가 없습니다.";

        // 관리자 글쓰기 차단
        if ("Y".equals(loginUser.getUserMngrYn()) || "하니관리자계정@naver.com".equals(loginUser.getUserEmlAddr())) {
            return "관리자 계정으로는 문의글 작성이 불가능합니다.";
        }

        // 유저 번호 복구 로직
        if (loginUser.getUserNo() == null) {
            int recoveredNo = supportService.getUserIdByEmail(loginUser.getUserEmlAddr());
            if (recoveredNo > 0) loginUser.setUserNo(recoveredNo);
        }

        inVO.setRegNo(loginUser.getUserNo());
        return String.valueOf(supportService.doSave(inVO));
    }

    // 3. 답변 등록 (관리자 전용)
    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(@RequestBody SupportVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null || !"Y".equals(loginUser.getUserMngrYn())) {
            return "관리자만 답변 등록이 가능합니다.";
        }
        return String.valueOf(supportService.doUpdate(inVO));
    }

    // 4. 삭제 로직
    @PostMapping("/doDelete.do")
    @ResponseBody
    public String doDelete(SupportVO inVO) {
        return String.valueOf(supportService.doDelete(inVO));
    }

    // 5. 💡 드디어 여기 있습니다! 단건 조회 (상세 보기용)
    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public SupportVO doSelectOne(@RequestBody SupportVO inVO) {
        log.info("단건 조회 요청: {}", inVO.getSupNo());
        return supportService.doSelectOne(inVO);
    }
}