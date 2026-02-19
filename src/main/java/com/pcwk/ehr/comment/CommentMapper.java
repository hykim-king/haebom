package com.pcwk.ehr.comment;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;

@Mapper
public interface CommentMapper extends WorkDiv<CommentVO> {

    int deleteAll();

    int getCount();

}
