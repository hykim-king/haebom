package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.NoticeVO;

import java.util.List;

public interface NoticeService extends WorkDiv<NoticeVO> {

    int doSave(NoticeVO inVO);

    int doDelete(NoticeVO inVO);

    int doUpdate(NoticeVO inVO);

    NoticeVO doSelectOne(NoticeVO inVO);

    List<NoticeVO> doRetrieve(DTO dto);
}
