package com.pcwk.ehr.notice;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NoticeMapper extends WorkDiv<NoticeVO> {

    List<NoticeVO> getAll();

    int getCount();                 // 전체 건수 조회

    int deleteAll();                // 전체 삭제

    String checkAdminAuth(String email);

    int getUserIdByEmail(String email);

    UserVO getLoginUserInfo(String email);

    int getLastNtcNo();

    int doRetrieveCount(NoticeVO inVO);
}