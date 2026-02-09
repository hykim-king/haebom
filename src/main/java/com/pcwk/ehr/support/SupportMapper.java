package com.pcwk.ehr.support;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface SupportMapper extends WorkDiv<SupportVO> {

    int getCount();     // 전체 건수 조회

    int deleteAll();    // 전체 삭제

    int saveAll(Map<String, Integer> param);      // 전체 저장

    List<SupportVO> getAll();

    List<SupportVO> doRetrieve(DTO dto);
}
