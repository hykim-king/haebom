package com.pcwk.ehr.hospital;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.HospitalVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/medical")
@RequiredArgsConstructor
public class HospitalController  {

    final Logger log = LogManager.getLogger(getClass());
    private final HospitalService hospitalService;

    @GetMapping(value = "")
    public String medical() {
        log.info("medical()");
        return "medical/medical";
    }

    @GetMapping(value = "/api/hospitals")
    @ResponseBody
    public List<HospitalVO> doRetrieveHospitals(HospitalVO hospitalVO) {
        log.info("doRetrieveHospitals() hospitalVO: {}", hospitalVO);
        if (hospitalVO.getPageNo() == 0) hospitalVO.setPageNo(1);
        if (hospitalVO.getPageSize() == 0) hospitalVO.setPageSize(5);
        return hospitalService.doRetrieve(hospitalVO);
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