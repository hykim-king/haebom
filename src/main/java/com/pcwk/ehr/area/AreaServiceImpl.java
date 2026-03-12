package com.pcwk.ehr.area;

import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.pcwk.ehr.cmn.DTO; 
import com.pcwk.ehr.domain.AreaVO;


@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaMapper areaMapper;

   
    @Override
    public int doSave(AreaVO param) { 
        return areaMapper.doSave(param);
     }

    @Override
    public int doDelete(AreaVO param) { 
        return areaMapper.doDelete(param);
     }

    @Override
    public int doUpdate(AreaVO param) { 
        return areaMapper.doUpdate(param); 
    }

    @Override
    public AreaVO doSelectOne(AreaVO param) { 
        return areaMapper.doSelectOne(param); 
    }

    @Override
    public List<AreaVO> doRetrieve(DTO param) { 
        return areaMapper.doRetrieve(param); 
    }
    // ------------------------------------------

    // 기존 추가 메서드들
    @Override
    public List<AreaVO> getCtpvList() {
        return areaMapper.getCtpvList();
    }

    @Override
    public List<AreaVO> getGnguList(AreaVO param) {
        return areaMapper.getGnguList(param);
    }

    @Override
    public List<AreaVO> getAll() {
        return areaMapper.getAll();
    }

    @Override
    public int getCount() {
        return areaMapper.getCount();
    }
}