package com.pcwk.ehr.drug;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.pcwk.ehr.domain.DrugVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/medical")
@RequiredArgsConstructor
public class DrugController  {

    final Logger log = LogManager.getLogger(getClass());
    private final DrugService drugService;

    @GetMapping(value = "/api/drugs")
    @ResponseBody
    public List<DrugVO> getAllDrugs() {
        log.info("getAllDrugs()");
        return drugService.getAll();
    }

    @GetMapping(value = "/drug_detail")
    public String drug_detail(@RequestParam("id") int id, Model model) {
        log.info("drug_detail() id: {}", id);

        DrugVO param = new DrugVO();
        param.setDsNo(id);
        DrugVO drug = drugService.doSelectOne(param);
        model.addAttribute("drug", drug);

        return "medical/drug_detail";
    }
}