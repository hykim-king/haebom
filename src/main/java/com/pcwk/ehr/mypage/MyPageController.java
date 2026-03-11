package com.pcwk.ehr.mypage;

import java.util.HashMap;
import java.util.List;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.user.UserEntity; // 💡 반드시 추가되어야 함
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/mypage")
public class MyPageController {

    @Autowired
    private MyPageService myPageService;

    /**
     * 0. 마이페이지 화면 이동 (View)
     * 이 메서드는 @ResponseBody가 없어야 합니다!
     */
    @GetMapping("/mypage.do")
    public String myPageHome(HttpSession session) {
       UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null) {
            log.info("로그인 세션이 없습니다.");
            return "redirect:../user/login";
        }
        return "mypage/mypage";
    }

    /**
     * 1. 내 정보 상세 조회
     */
    @GetMapping("/getUserInfo.do")
    @ResponseBody
    public UserVO getUserInfo(HttpSession session) {
        // 💡 UserEntity로 꺼냅니다.
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");

        if (sessionUser == null) {
            log.info("로그인 세션이 없습니다.");
            return null;
        }

        // 서비스가 UserVO를 요구한다면 데이터를 옮겨 담습니다.
        UserVO inVO = new UserVO();
        inVO.setUserNo(sessionUser.getUserNo());
        inVO.setUserEmlAddr(sessionUser.getUserEmlAddr());

        return myPageService.doSelectOne(inVO);
    }

    /**
     * 2. 찜 목록 개수 조회
     */
    @GetMapping("/getRelationCount.do")
    @ResponseBody
    public int getRelationCount(@RequestParam("relClsf") int relClsf, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        // ibatis : @Param 방식으로 수정된 서비스 호출 (int, int 던짐)
        return myPageService.getRelationCount(sessionUser.getUserNo(), relClsf);
    }

    /**
     * 3. 찜(10) / 여행완료(20) 목록 리스트 조회
     * URL 예시: /mypage/getRelationList.do?relClsf=10
     */
    @GetMapping("/getRelationList.do")
    @ResponseBody
    public List<TripVO> getRelationList(@RequestParam("relClsf") int relClsf, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");

        if (sessionUser == null)
            return null;

        // 세션의 유저번호와 파라미터로 받은 분류값을 서비스에 전달
        return myPageService.getRelationList(sessionUser.getUserNo(), relClsf);
    }

    /**
     * 4. 닉네임 수정
     */
    @PostMapping("/updateNick.do")
    @ResponseBody
    public int updateNick(UserVO userVO, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        // 화면에서 받은 userVO에 세션의 유저 번호를 심어줍니다.
        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateNick(userVO);
    }

    // 닉네임 중복 체크 API
    @GetMapping("/nickCheck.do")
    @ResponseBody
    public int checkNickname(@RequestParam("nickname") String nickname) {
        // 전달받은 닉네임으로 서비스 호출
        return myPageService.nickCheck(nickname);
    }

    /**
     * 5. 주소 수정
     */
    @PostMapping("/updateAddr.do")
    @ResponseBody
    public int updateAddr(UserVO userVO, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateAddr(userVO);
    }

    /**
     * 6. 태그 수정
     */
    @PostMapping("/updateTag.do")
    @ResponseBody
    public int updateTag(UserVO userVO, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateTag(userVO);
    }
    /*
    * 7. 비밀번호 수정
     */
    @PostMapping("/updatePw.do")
    @ResponseBody
    public int updatePw(UserVO userVO, @RequestParam("newPw") String newPw, HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null) return 0;

        userVO.setUserNo(sessionUser.getUserNo());
        // 현재 비번은 userVO.userEnpswd에 담겨 오고, 새 비번은 newPw로 받음
        return myPageService.updatePassword(userVO, newPw);
    }



    /*
    * 8. 관계 분류(10/20) 값 입력받고 삭제
    *    trip_conts_id 없을시 전체삭제, 있으면 개별 삭제
    */
    @PostMapping("/deleteRelation.do")
    @ResponseBody
    public int deleteRelation(@RequestParam("relClsf") int relClsf,
            @RequestParam(value = "tripContsId", required = false) Integer tripContsId,
            HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        // 서비스 호출 (ID가 없으면 null로 넘어감 -> MyBatis <if>문에서 처리됨)
        return myPageService.deleteRelation(sessionUser.getUserNo(), relClsf, tripContsId);
    }

    /**
     * 9. 여행 완료 목록 조회
     */
    @GetMapping("/selectTripFinishedList.do")
    @ResponseBody
    public List<TripVO> selectTripFinishedList(HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null) return null;

        CommentVO inVO = new CommentVO();
        inVO.setRegNo(sessionUser.getUserNo()); // 사용자 번호를 CommentVO에 담음

        return myPageService.selectTripFinishedList(inVO);
    }

    /**
     * 10. 여행 완료 개수 조회
     */
    @GetMapping("/selectTripFinishedCount.do")
    @ResponseBody
    public int selectTripFinishedCount(HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null) return 0;

        CommentVO inVO = new CommentVO();
        inVO.setRegNo(sessionUser.getUserNo());

        return myPageService.selectTripFinishedCount(inVO);
    }

    /**
     * 11. 여행 완료 통합 삭제
     */
    @PostMapping("/deleteFinishedTrip.do")
    @ResponseBody
    public int deleteFinishedTrip(
            @RequestParam("cmtNo") int cmtNo,
            @RequestParam("tripContsId") int tripContsId,
            HttpSession session) {
        
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null) return 0;

        // 댓글 삭제용 정보
        CommentVO commentVO = new CommentVO();
        commentVO.setCmtNo(cmtNo);
        commentVO.setRegNo(sessionUser.getUserNo());

        // 관계 삭제용 정보 (TripVO에 userNo가 없다면, 
        // 서비스/매퍼에서 파라미터를 유동적으로 조절해야 합니다. 
        // 여기서는 파라미터로 넘긴 tripId와 세션 userNo를 직접 활용하도록 구성)
        TripVO tripVO = new TripVO();
        tripVO.setTripContsId(tripContsId);
        
        return myPageService.deleteFinishedTrip(commentVO, tripVO);
    }


/*/@PostMapping("/deleteFinishedTrip.do")
@ResponseBody
public int deleteFinishedTrip(@RequestParam("cmtNo") int cmtNo, HttpSession session) {
    // tripContsId 파라미터 삭제
    UserEntity sessionUser = (UserEntity) session.getAttribute("user");
    
    CommentVO commentVO = new CommentVO();
    commentVO.setCmtNo(cmtNo);
    commentVO.setRegNo(sessionUser.getUserNo());

    // 서비스에서도 cmtNo만 사용하도록 수정하거나, 
    // 기존 서비스에 tripVO 대신 null이나 0을 던져야 함
    return myPageService.deleteCmt(commentVO); 
}*/

}