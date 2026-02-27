package com.pcwk.ehr.drug;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
<<<<<<<< HEAD:src/main/java/com/pcwk/ehr/user/UserMapper.java
import com.pcwk.ehr.domain.UserVO;
========
import com.pcwk.ehr.domain.DrugVO;
>>>>>>>> origin/donghan:src/main/java/com/pcwk/ehr/drug/DrugMapper.java

@Mapper
public interface DrugMapper extends WorkDiv<DrugVO> {

    int getCount();

    int deleteAll();
}
