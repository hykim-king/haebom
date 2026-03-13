package com.pcwk.ehr.drug;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/medical")
@RequiredArgsConstructor
public class DrugController  {

    final Logger log = LogManager.getLogger(getClass());    


    @GetMapping(value = "/drug_detail")
    public String drug_detail() {
        log.info("drug_detail()");

        String viewname = "medical/drug_detail";

        return viewname;
    }
}