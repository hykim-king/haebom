package com.pcwk.ehr.notice;

import com.pcwk.ehr.domain.NoticeVO; // [수정] VO 임포트 추가
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final Logger log = LogManager.getLogger(getClass());

    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "저장 성공";
    }

    @PostMapping("/doDelete.do")
    @ResponseBody
    public String doDelete(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "삭제 성공";
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
    public String doUpdate(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doUpdate()               │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "수정 성공";
    }

    @PostMapping( "/doRetrieve.do")
    @ResponseBody
    public String doRetrieve(NoticeVO inVO) { // [수정] 파라미터 추가
        log.info("┌──────────────────────────┐");
        log.info("│ doRetrieve()             │");
        log.info("│ outVO: " + inVO);         // [추가] 데이터 확인용 로그
        log.info("└──────────────────────────┘");

        return "목록 조회 성공";
    }
}