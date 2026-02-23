package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.NoticeVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeMapper extends WorkDiv<NoticeVO> {

    int getCount();                 // 전체 건수 조회

    List<NoticeVO> getAll();        // 전체 선택

    int deleteAll();                // 전체 삭제
     // 전체 저장
     int saveAll(List<NoticeVO> list);
}
