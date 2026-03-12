package com.pcwk.ehr.comment;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CommentVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface CommentMapper extends WorkDiv<CommentVO> {

    int deleteAll(); 

    int getCount();

    //관리자 검색용
    int getSearchCount(CommentVO commentVO);

    //관리자 댓글 숨김상태용
    int updateHideYn(CommentVO commentVO);

    //관리자용 조회
    List<Map<String, Object>> doAdminRetrieve(CommentVO commentVO);

}
