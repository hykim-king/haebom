package com.pcwk.ehr.area;

import org.apache.ibatis.annotations.Mapper;
import com.pcwk.ehr.cmn.WorkDiv;

@Mapper
public interface AreaMapper extends WorkDiv<AreaVO> {
    
    /** 전체 삭제 (초기화용) */
    int deleteAll();
    
    /** 전체 건수 조회 */
    int getCount();
    
    /** 시도 목록 조회 (중복 제거) */
    java.util.List<AreaVO> getSidoList();
    
    /** 특정 시도의 군구 목록 조회 */
    java.util.List<AreaVO> getGunguListBySido(int areaSido);
}