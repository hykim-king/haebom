package com.pcwk.ehr.support;

import com.pcwk.ehr.cmn.WorkDiv;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SupportMapper extends WorkDiv<SupportVO> {

    int getCount();     // 전체 건수 조회

    int deleteAll();    // 전체 삭제

    int saveAll();      // 전체 저장

}
