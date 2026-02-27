package com.pcwk.ehr.hospital;

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
public class HospitalController  {

    final Logger log = LogManager.getLogger(getClass());    


    @GetMapping(value = "")
    public String medical() {
        log.info("medical()");

        String viewname = "medical/medical";

        return viewname;
    }  

    @GetMapping(value = "/hospital_detail")
    public String hospital_detail() {
        log.info("hospital_detail()");

        String viewname = "medical/hospital_detail";

        return viewname;
    }
}