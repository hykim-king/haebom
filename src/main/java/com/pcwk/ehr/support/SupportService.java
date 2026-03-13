package com.pcwk.ehr.support;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.domain.UserVO;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface SupportService extends WorkDiv<SupportVO> {

    int doSave(SupportVO inVO);

    int doDelete(SupportVO inVO);

    int doUpdate(SupportVO inVO);

    SupportVO doSelectOne(SupportVO inVO);

    List<SupportVO> doRetrieve(DTO dto);

}
