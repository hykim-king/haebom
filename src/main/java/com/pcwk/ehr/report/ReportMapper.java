package com.pcwk.ehr.report;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.ReportVO;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReportMapper extends WorkDiv<ReportVO> {

    int getCount();

    int deleteAll();

    //관리자용
    Map<String, Object> getReportStats();

    // ReportMapper.java
    Map<String, Object> RpdoSelectAdmin(ReportVO reportVO);

    int RpdoUpdateAdmin(ReportVO reportVO);

    List<Map<String, Object>> doSelectAdminList(ReportVO reportVO);
    int getAdminReportCount(ReportVO reportVO);

}
