package com.pcwk.ehr.mypage;

import java.util.List;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.cmn.WorkDiv;

public interface MyPageService extends WorkDiv<UserVO>{

    /** 회원 정보 수정 (닉네임) */
    int doUpdateNick(UserVO userVO);

    /** 회원 정보 수정 (태그) */
    int doUpdateTag(UserVO userVO);

    /** 회원 정보 수정 (주소) */
    int doUpdateAddr(UserVO userVO);

    /** 비밀번호 변경 */
    int doUpdatePw(UserVO userVO);

    /** 찜/여행완료 목록 조회 */
    List<UserVO> getRelationList(UserVO userVO);

    /** 찜/여행완료 카운트 조회 */
    int getRelationCount(UserVO userVO);

    /** 관계 데이터 삭제 (찜 취소 등) */
    int deleteRelation(UserVO userVO);

    /** 사용자 정보 단건 조회 (WorkDiv 대용) */
    UserVO doSelectOne(UserVO userVO);
}