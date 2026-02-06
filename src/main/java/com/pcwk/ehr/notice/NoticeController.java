package com.pcwk.ehr.notice;

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
    public String doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        return "";
    }

    @PostMapping("/doDelete.do")
    @ResponseBody
    public String doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        return "";
    }

    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public String doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSelectOne()            │");
        log.info("└──────────────────────────┘");

        return "";
    }

    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│ doUpdate()               │");
        log.info("└──────────────────────────┘");

        return "";
    }

}
