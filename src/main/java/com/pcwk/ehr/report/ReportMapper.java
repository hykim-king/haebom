package com.pcwk.ehr.report;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.ReportVO;

@Mapper
public interface ReportMapper extends WorkDiv<ReportVO> {

    int getCount();

    int deleteAll();

}
