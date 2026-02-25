package com.pcwk.ehr.comment;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.CommentVO;

@Mapper
public interface CommentMapper extends WorkDiv<CommentVO> {

    int deleteAll();

    int getCount();

}
