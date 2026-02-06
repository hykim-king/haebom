package com.pcwk.ehr.drug;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;

@Mapper
public interface DrugMapper extends WorkDiv<DrugVO> {


    //TEST용 전체 삭제
     int deleteAll();

     //건수 조회
     int getCount();

     //test용 대량 데이터
     int saveAll();

}
