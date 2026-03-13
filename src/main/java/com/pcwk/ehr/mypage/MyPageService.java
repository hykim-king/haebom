package com.pcwk.ehr.mypage;

import java.util.List;

import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.cmn.WorkDiv;


public interface MyPageService extends WorkDiv<UserVO> {

    /** 회원 정보 수정 (닉네임) */
    int doUpdateNick(UserVO userVO);

    /** 회원 정보 수정 (태그) */
    int doUpdateTag(UserVO userVO);

    /** 회원 정보 수정 (주소) */
    int doUpdateAddr(UserVO userVO);

    // 비밀번호 변경 (현재비번 확인 로직 포함)
    int updatePassword(UserVO vo, String newPw);

    /** 찜/여행완료 목록 조회 */
    List<TripVO> getRelationList(int userNo, int relClsf);

    /** 찜/여행완료 카운트 조회 */
    int getRelationCount(int userNo, int relClsf);

    /** 관계 데이터 삭제 (찜 취소 등) */
    int deleteRelation(int userNo, int relClsf,Integer tripContsId);

    /** 사용자 정보 단건 조회 (WorkDiv 대용) */
    UserVO doSelectOne(UserVO userVO);

    int nickCheck(String userNick);
}