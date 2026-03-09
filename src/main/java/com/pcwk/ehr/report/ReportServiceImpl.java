package com.pcwk.ehr.report;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.pcwk.ehr.domain.ReportVO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final Logger log = LogManager.getLogger(getClass());
    private final ReportMapper reportMapper;

    @Override
    public int doSave(ReportVO inVO) {
        log.info("신고 등록: {}", inVO);
        return reportMapper.doSave(inVO);
    }
}
