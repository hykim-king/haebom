package com.pcwk.ehr.mypage;

import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.cmn.WorkDiv;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;



@Mapper
public interface MyPageMapper extends WorkDiv<UserVO> {

    /**
     * 회원 정보 수정 (닉네임)
     */
    int doUpdateNick(UserVO userVO);

    /**
     * 회원 정보 수정 (태그)
     */
    int doUpdateTag(UserVO userVO);

    /**
     * 회원 정보 수정 (주소)
     */
    int doUpdateAddr(UserVO userVO);

    /**
     * 비밀번호 변경
     */
    int doUpdatePw(UserVO userVO);

    /**
     * 찜/여행완료 목록 조회
     */
    List<TripVO> getRelationList(@Param("userNo") int userNo, @Param("relClsf") int relClsf);

    /**
     * 찜/여행완료 카운트 조회
     */
    int getRelationCount(@Param("userNo") int userNo, @Param("relClsf") int relClsf);

    /**
     * 관계 데이터 삭제 (찜 취소 등)
     */
    int deleteRelation(@Param("userNo") int userNo, 
                       @Param("relClsf") int relClsf,
                       @Param("tripContsId") Integer tripContsId);

    // 닉네임 중복 체크
    int nickCheck(String userNick);

    // 여행 완료 목록
    List<TripVO> selectTripFinishedList(CommentVO vo);
    
    // 여행 완료 개수
    int selectTripFinishedCount(CommentVO vo);

    int deleteCmt(CommentVO vo);
}