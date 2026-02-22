package com.pcwk.ehr.user.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.UserVO;

@Mapper
public interface UserMapper extends WorkDiv<UserVO> {

    int deleteAll();

    int getCount();
}
