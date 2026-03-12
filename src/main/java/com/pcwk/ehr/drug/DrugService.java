package com.pcwk.ehr.drug;

import java.util.List;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.DrugVO;

public interface DrugService extends WorkDiv<DrugVO> {

    List<DrugVO> getAll();
}
