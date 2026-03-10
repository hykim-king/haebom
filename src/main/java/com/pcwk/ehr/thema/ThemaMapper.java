package com.pcwk.ehr.thema;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;

@Mapper
public interface ThemaMapper extends WorkDiv<TripVO> { 
    
    int getCount();

    List<TripVO> doRetrieveCustom(@Param("vo") TripVO inVO, @Param("sortType") String sortType);

    int doSaveWish(Map<String, Object> paramMap);
    int doDeleteWish(Map<String, Object> paramMap);
    
}