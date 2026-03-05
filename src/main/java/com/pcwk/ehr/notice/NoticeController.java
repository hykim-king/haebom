package com.pcwk.ehr.notice;

import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Controller
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final Logger log = LogManager.getLogger(getClass());
    private final NoticeService noticeService;
    private final UserService userService;

    private static final String UPLOAD_PATH = "/Users/hani/upload/notice/";

    // ── 공통: 관리자 여부 ──
    private String resolveAdminYn(HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "N";
        String dbAuth = noticeService.checkAdminAuth(loginUser.getUserEmlAddr());
        return "Y".equalsIgnoreCase(dbAuth) ? "Y" : "N";
    }

    // ── 로그인 ──
    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/login";
    }

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

    // ── 목록 ──
    @GetMapping("")
    public String notice(NoticeVO inVO, Model model, HttpSession session) {
        if (inVO.getPageNo() == 0)   inVO.setPageNo(1);
        if (inVO.getPageSize() == 0) inVO.setPageSize(10);

        int totalCount = noticeService.doRetrieveCount(inVO);
        int totalPages = (int) Math.ceil((double) totalCount / inVO.getPageSize());
        if (totalPages < 1) totalPages = 1;

        model.addAttribute("userMngrYn", resolveAdminYn(session));
        model.addAttribute("list", noticeService.doRetrieve(inVO));
        model.addAttribute("searchVO", inVO);
        model.addAttribute("totalCount", totalCount);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("currentPage", inVO.getPageNo());
        return "notice/notice";
    }

    // ── 글쓰기 페이지 ──
    @GetMapping("/noticeWrite")
    public String noticeWrite(@RequestParam(value = "ntcNo", defaultValue = "0") int ntcNo,
                              Model model, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "redirect:/user/login";

        UserVO fullUser = noticeService.getLoginUserInfo(loginUser.getUserEmlAddr());
        if (fullUser == null) return "redirect:/user/login";

        if (!"Y".equals(fullUser.getUserMngrYn() != null
                ? fullUser.getUserMngrYn().trim().toUpperCase() : "N"))
            return "redirect:/notice/notice";

        NoticeVO outVO;
        if (ntcNo != 0) {
            NoticeVO inVO = new NoticeVO();
            inVO.setNtcNo(ntcNo);
            outVO = noticeService.doSelectOne(inVO);
            if (outVO == null) outVO = new NoticeVO();
        } else {
            outVO = new NoticeVO();
            outVO.setRegNo(fullUser.getUserNo());
        }
        outVO.setUserVO(fullUser);
        model.addAttribute("noticeVO", outVO);
        return "notice/notice_write";
    }

    // ── 등록 처리 (multipart) ──
    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(NoticeVO inVO,
                         @RequestParam(value = "files", required = false) List<MultipartFile> files,
                         HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "로그인 필요";

        UserVO fullUser = noticeService.getLoginUserInfo(loginUser.getUserEmlAddr());
        if (fullUser == null) return "유저 정보 오류";
        if (!"Y".equals(fullUser.getUserMngrYn() != null
                ? fullUser.getUserMngrYn().trim().toUpperCase() : "N")) return "권한이 없습니다.";

        inVO.setRegNo(fullUser.getUserNo());
        inVO.setUserVO(fullUser);

        int flag = ((NoticeServiceImpl) noticeService).doSave(inVO, files);
        return flag == 1 ? "저장 성공" : "저장 실패";
    }

    // ── 상세 조회 ──
    @GetMapping("/noticeDetail")
    public String noticeDetail(@RequestParam("ntcNo") int ntcNo, Model model, HttpSession session) {
        NoticeVO searchVO = new NoticeVO();
        searchVO.setNtcNo(ntcNo);
        NoticeVO outVO = noticeService.doSelectOne(searchVO); // 파일 목록도 포함됨

        model.addAttribute("outVO", outVO);
        model.addAttribute("userMngrYn", resolveAdminYn(session));
        return "notice/notice_detail";
    }

    // ── 삭제 ──
    @GetMapping("/doDelete.do")
    public String doDelete(@RequestParam("ntcNo") int ntcNo) {
        NoticeVO inVO = new NoticeVO();
        inVO.setNtcNo(ntcNo);
        noticeService.doDelete(inVO); // attach_file도 같이 삭제
        return "redirect:/notice/notice";
    }

    // ── 수정 처리 (multipart) ──
    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(NoticeVO inVO,
                           @RequestParam(value = "files", required = false) List<MultipartFile> files,
                           HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "권한 없음";

        String dbAuth = noticeService.checkAdminAuth(loginUser.getUserEmlAddr());
        if (!"Y".equalsIgnoreCase(dbAuth)) return "권한 없음";

        if (loginUser.getUserNo() == null || loginUser.getUserNo() == 0) {
            loginUser.setUserNo(noticeService.getUserIdByEmail(loginUser.getUserEmlAddr()));
        }
        loginUser.setUserMngrYn("Y");
        inVO.setModNo(loginUser.getUserNo());
        inVO.setUserVO(loginUser);

        int flag = ((NoticeServiceImpl) noticeService).doUpdate(inVO, files);
        return flag == 1 ? "수정 성공" : "수정 실패";
    }

    // ── 파일 다운로드 ──
    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("filePathNm") String filePathNm,
                                             @RequestParam("fileNm") String fileNm) {
        try {
            File file = new File(filePathNm);
            if (!file.exists()) return ResponseEntity.notFound().build();

            Resource resource = new FileSystemResource(file);
            String encodedName = URLEncoder.encode(fileNm, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename*=UTF-8''" + encodedName)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/doSelectOne.do") @ResponseBody public String doSelectOne(NoticeVO inVO) { return "조회 성공"; }
    @PostMapping("/doRetrieve.do")  @ResponseBody public String doRetrieve(NoticeVO inVO)  { return "목록 조회 성공"; }
}