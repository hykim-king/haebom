package com.pcwk.ehr.area;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.AreaVO;
import java.util.List;


public interface AreaService extends WorkDiv<AreaVO> {
    List<AreaVO> getCtpvList();

    List<AreaVO> getGnguList(AreaVO param);

    List<AreaVO> getAll();

    int getCount();
}
