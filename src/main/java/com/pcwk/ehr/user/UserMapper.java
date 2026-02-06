package com.pcwk.ehr.user;

import org.apache.ibatis.annotations.Mapper;
import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.user.UserVO;

@Mapper
public interface UserMapper extends WorkDiv<UserVO> {
    
    /** 전체 삭제 (테스트 초기화용) */
    int deleteAll();
    
    /** 전체 사용자 수 조회 */
    int getCount();
}