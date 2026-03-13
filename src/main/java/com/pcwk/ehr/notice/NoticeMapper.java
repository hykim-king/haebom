package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.NoticeVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoticeMapper extends WorkDiv<NoticeVO> {

    List<NoticeVO> getAll();

    int getCount();                 // 전체 건수 조회

    int deleteAll();                // 전체 삭제
}
