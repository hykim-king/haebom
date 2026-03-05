package com.pcwk.ehr.hospital;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.pcwk.ehr.domain.HospitalVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/medical")
@RequiredArgsConstructor
public class HospitalController  {

    final Logger log = LogManager.getLogger(getClass());
    private final HospitalService hospitalService;

    @GetMapping(value = "")
    public String medical(Model model) {
        log.info("medical()");

        model.addAttribute("hospitals", hospitalService.getAll());

        return "medical/medical";
    }  

    @GetMapping(value = "/hospital_detail")
    public String hospital_detail(@RequestParam("id") int id, Model model) {
        log.info("hospital_detail() id: {}", id);

        HospitalVO param = new HospitalVO();
        param.setHpNo(id);
        HospitalVO hospital = hospitalService.doSelectOne(param);
        model.addAttribute("hospital", hospital);

        return "medical/hospital_detail";
    }
}