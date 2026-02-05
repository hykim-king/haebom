package com.pcwk.ehr.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.SsuserVO;

@Mapper
public interface SsuserMapper extends WorkDiv<SsuserVO> {
    
    /** 전체 삭제 (테스트 초기화용) */
    int deleteAll();
    
    /** 전체 사용자 수 조회 */
    int getCount();
}