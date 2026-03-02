package com.pcwk.ehr.drug;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.domain.DrugVO;

@Mapper
public interface DrugMapper extends WorkDiv<DrugVO> {

    int getCount();

    int deleteAll();
}
