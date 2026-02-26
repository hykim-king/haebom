package com.pcwk.ehr.area;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.AreaVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AreaMapper extends WorkDiv<AreaVO> {

    List<AreaVO> getCtpvList();

    List<AreaVO> getGnguList(AreaVO param);

    List<AreaVO> getAll();

    int getCount();

}