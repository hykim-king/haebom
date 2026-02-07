package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.cmn.WorkDiv;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeMapper extends WorkDiv<NoticeVO> {

    int getCount();                 // 전체 건수 조회

    List<NoticeVO> getAll();        // 전체 선택

    int deleteAll();                // 전체 삭제

    int saveAll(Map<String, Integer> param);                  // 전체 저장

    /**
     * 목록조회 (검색 + 페이징)
     * @param dto (검색조건, 페이지 정보)
     * @return List<NoticeVO>
     */
     List<NoticeVO> doRetrieve(DTO dto);


}
