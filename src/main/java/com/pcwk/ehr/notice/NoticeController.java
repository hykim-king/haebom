package com.pcwk.ehr.notice;

import com.pcwk.ehr.domain.NoticeVO; // [수정] VO 임포트 추가
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
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final Logger log = LogManager.getLogger(getClass());
    private final NoticeService noticeService;

    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        int flag = noticeService.doSave(inVO);

        return flag == 1 ? "저장 성공" : "저장 실패";
    }

    @GetMapping("/noticeWrite")
    public String noticeWrite(@RequestParam("ntcNo") int ntcNo, Model model) {
        log.info("┌──────────────────────────┐");
        log.info("│ noticeWrite()            │");
        log.info("└──────────────────────────┘");

        if (ntcNo != 0) {
            NoticeVO inVO = new NoticeVO();
            inVO.setNtcNo(ntcNo);

            // 수정
            NoticeVO outVO = noticeService.doSelectOne(inVO);
            // 전달
            model.addAttribute(outVO);
        } else {
            // 이동
            model.addAttribute(new NoticeVO());
        }
        return "notice/notice_write";
    }



    @GetMapping("/notice")
    public String notice(Model model) {
        log.info("┌──────────────────────────┐");
        log.info("│ notice()                 │");
        log.info("└──────────────────────────┘");

        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);

        List<NoticeVO> list = noticeService.doRetrieve(searchVO);

        model.addAttribute("list", list);

        return "notice/notice";
    }

    @GetMapping("/noticeDetail")
    public String noticeDetail(@RequestParam("ntcNo") int ntcNo, Model model) {
        log.info("┌──────────────────────────┐");
        log.info("│ noticeDetail()           │");
        log.info("└──────────────────────────┘");

        NoticeVO searchVO = new NoticeVO();
        searchVO.setNtcNo(ntcNo);

        // 1. 상세보기 호출
        NoticeVO outVO = noticeService.doSelectOne(searchVO);

        // 2. 조회 결과
        model.addAttribute("outVO", outVO);

        return "notice/notice_detail";
    }

    @GetMapping("/doDelete.do")
    public String doDelete(@RequestParam("ntcNo") int ntcNo) {
        NoticeVO inVO = new NoticeVO();
        inVO.setNtcNo(ntcNo);

        noticeService.doDelete(inVO);

        return "redirect:/notice/notice";
    }

    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public String doSelectOne(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doSelectOne()            │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "조회 성공";
    }

    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(NoticeVO inVO, HttpSession session) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doUpdate()               │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        // 로그인 했을때 주석 풀기
//        UserVO loginUser = (UserVO) session.getAttribute("loginUser");
//
//        if (loginUser == null) {
//            log.warn("관리자가 아님");
//            return "권한이 없습니다.";
//        }
//
//        String mngrYn = loginUser.getUserMngrYn();
//        if (mngrYn == null || !"Y".equals(mngrYn.trim())) {
//            log.warn("관리자 권한 부족. 현재값: " + mngrYn);
//            return "권한이 없습니다.";
//        }

//        inVO.setModNo(loginUser.getUserNo());
//        inVO.setUserVO(loginUser);

        if(inVO.getModNo()==0){
            inVO.setModNo(1);
        }

        int flag = noticeService.doUpdate(inVO);
        return flag == 1 ? "수정 성공" : "수정 실패";
    }


    @PostMapping("/doRetrieve.do")
    @ResponseBody
    public String doRetrieve(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doRetrieve()             │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "목록 조회 성공";
    }
}