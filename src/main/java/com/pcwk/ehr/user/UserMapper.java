package com.pcwk.ehr.user;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;

@Mapper
public interface UserMapper extends WorkDiv<UserVO> {

    int deleteAll();

    int getCount();
}
