package com.pcwk.ehr.notice;

import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final Logger log = LogManager.getLogger(getClass());
    private final NoticeService noticeService;
    private final UserService userService;

    // 로그인 페이지 이동
    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/login";
    }

    // 로그인 처리
    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody UserVO vo, HttpSession session) {
        try {
            UserVO loginUser = userService.loginDetail(vo.getUserEmlAddr(), vo.getUserEnpswd());
            session.setAttribute("user", loginUser);
            return ResponseEntity.ok().body("{\"success\": true}");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("{\"success\": false}");
        }
    }

    // 목록 조회 (페이징 + 검색 조건 유지)
    @GetMapping("/notice")
    public String notice(NoticeVO inVO, Model model, HttpSession session) {
        // 1. 화면에서 넘어온 페이지 번호가 없으면 1로 초기화
        if (inVO.getPageNo() == 0) {
            inVO.setPageNo(1);
        }
        // 페이지 사이즈가 없으면 10으로 초기화
        if (inVO.getPageSize() == 0) {
            inVO.setPageSize(10);
        }

        // 2. 권한 체크 (기존 로직)
        UserVO loginUser = (UserVO) session.getAttribute("user");
        String userMngrYn = "N";

        if (loginUser != null) {
            String dbAuth = noticeService.checkAdminAuth(loginUser.getUserEmlAddr());
            if ("Y".equalsIgnoreCase(dbAuth)) {
                userMngrYn = "Y";
            }
        }
        model.addAttribute("userMngrYn", userMngrYn);

        // 3. 목록 조회 (inVO에 담긴 페이지 번호와 검색어를 그대로 사용)
        List<NoticeVO> list = noticeService.doRetrieve(inVO);
        model.addAttribute("list", list);

        // 4. [중요] 화면 페이징 버튼에서 쓸 수 있도록 현재 검색/페이지 정보를 다시 모델에 저장
        model.addAttribute("searchVO", inVO);

        return "notice/notice";
    }

    @GetMapping("/noticeWrite")
    public String noticeWrite(@RequestParam(value = "ntcNo", defaultValue = "0") int ntcNo, Model model, HttpSession session) {
        log.info("noticeWrite() 진입");

        UserVO loginUser = (UserVO) session.getAttribute("user");

        if (loginUser == null) {
            return "redirect:/user/login";
        }

        // 💡 [핵심 해결] 세션 정보(불량품)를 버리고, DB에서 완전한 유저 정보를 다시 가져옵니다.
        // 이러면 userNo, userNm, userMngrYn 등 모든 정보가 꽉 채워집니다!
        UserVO fullUser = noticeService.getLoginUserInfo(loginUser.getUserEmlAddr());

        if (fullUser == null) {
            log.warn("DB에 유저 정보 없음");
            return "redirect:/user/login";
        }

        // 가져온 정보로 권한 체크 (공백 제거 등 안전 처리)
        String mngrCheck = (fullUser.getUserMngrYn() != null) ? fullUser.getUserMngrYn().trim().toUpperCase() : "N";
        if (!"Y".equals(mngrCheck)) {
            return "redirect:/notice/notice";
        }

        NoticeVO outVO;
        if (ntcNo != 0) {
            NoticeVO inVO = new NoticeVO();
            inVO.setNtcNo(ntcNo);
            outVO = noticeService.doSelectOne(inVO);
            if (outVO == null) outVO = new NoticeVO();
        } else {
            outVO = new NoticeVO();
            outVO.setRegNo(fullUser.getUserNo()); // DB에서 가져온 진짜 번호 사용
        }

        // 화면에 '꽉 찬 유저 정보'를 전달합니다. (이름이 잘 나올 거예요!)
        outVO.setUserVO(fullUser);
        model.addAttribute("noticeVO", outVO);

        return "notice/notice_write";
    }

    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(NoticeVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "로그인 필요";

        // DB에서 정보 다시 조회 (복구)
        UserVO fullUser = noticeService.getLoginUserInfo(loginUser.getUserEmlAddr());
        if (fullUser == null) return "유저 정보 오류";

        String mngrCheck = (fullUser.getUserMngrYn() != null) ? fullUser.getUserMngrYn().trim().toUpperCase() : "N";
        if (!"Y".equals(mngrCheck)) return "권한이 없습니다.";

        // 복구된 정보로 저장 진행
        inVO.setRegNo(fullUser.getUserNo());
        inVO.setUserVO(fullUser);

        int flag = noticeService.doSave(inVO);
        return flag == 1 ? "저장 성공" : "저장 실패";
    }

    // 상세 조회
    @GetMapping("/noticeDetail")
    public String noticeDetail(@RequestParam("ntcNo") int ntcNo, Model model) {
        NoticeVO searchVO = new NoticeVO();
        searchVO.setNtcNo(ntcNo);
        NoticeVO outVO = noticeService.doSelectOne(searchVO);

        // 💡 [수정] 상세 HTML(notice_detail.html)은 "outVO"라는 이름을 쓰고 있습니다!
        // HTML을 고치는 대신 여기서 이름을 맞춰줍니다.
        model.addAttribute("outVO", outVO);
        return "notice/notice_detail";
    }

    // 삭제 처리
    @GetMapping("/doDelete.do")
    public String doDelete(@RequestParam("ntcNo") int ntcNo) {
        NoticeVO inVO = new NoticeVO();
        inVO.setNtcNo(ntcNo);
        noticeService.doDelete(inVO);
        return "redirect:/notice/notice";
    }

    // [수정] 수정 처리 - 여기도 '복구 로직' 추가!
    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(NoticeVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "권한 없음";

        // 1. 권한 체크
        String dbAuth = noticeService.checkAdminAuth(loginUser.getUserEmlAddr());
        if (!"Y".equalsIgnoreCase(dbAuth)) return "권한 없음";

        // 2. 회원번호 복구
        if (loginUser.getUserNo() == null || loginUser.getUserNo() == 0) {
            int dbUserNo = noticeService.getUserIdByEmail(loginUser.getUserEmlAddr());
            loginUser.setUserNo(dbUserNo);
        }
        loginUser.setUserMngrYn("Y");

        inVO.setModNo(loginUser.getUserNo());
        inVO.setUserVO(loginUser); // 서비스단 체크용

        int flag = noticeService.doUpdate(inVO);
        return flag == 1 ? "수정 성공" : "수정 실패";
    }

    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public String doSelectOne(NoticeVO inVO) { return "조회 성공"; }

    @PostMapping("/doRetrieve.do")
    @ResponseBody
    public String doRetrieve(NoticeVO inVO) { return "목록 조회 성공"; }
}