package com.pcwk.ehr.mypage;

import java.util.List;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.domain.TripVO;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/mypage")
public class MyPageController {

    @Autowired
    private MyPageService myPageService;

    /**
     * 1. 내 정보 상세 조회 (페이지 로드 시)
     */
    @GetMapping("/getUserInfo.do")
    @ResponseBody
    public UserVO getUserInfo(HttpSession session) {
        // 세션에서 앞선 여행지 상세처럼 사용자 정보(user)를 가져옵니다.
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        
        if (sessionUser == null) {
            log.info("로그인 세션이 없습니다.");
            return null;
        }

        // DB에서 최신 정보를 조회하여 반환 (이름, 닉네임, 연락처, 주소, 태그 포함)
        return myPageService.doSelectOne(sessionUser);
    }

    /**
     * 2. 찜 목록 개수 조회 
     */
    @GetMapping("/getRelationCount.do")
    @ResponseBody
    public int getRelationCount(HttpSession session) {
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        if (sessionUser == null) return 0;

        return myPageService.getRelationCount(sessionUser);
    }

    /**
     * 3. 찜 목록 리스트 조회 (List 활용)
     */
    @GetMapping("/getRelationList.do")
    @ResponseBody
    public List<UserVO> getRelationList(HttpSession session) {
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        if (sessionUser == null) return null;

        // Map을 절대 사용하지 않고 MyPageService의 List 반환 메서드 호출
        return myPageService.getRelationList(sessionUser);
    }

    /**
     * 4. 각 섹션별 수정 API (닉네임, 주소, 태그)
     */
    @PostMapping("/updateNick.do")
    @ResponseBody
    public int updateNick(UserVO userVO, HttpSession session) {
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateNick(userVO);
    }

    @PostMapping("/updateAddr.do")
    @ResponseBody
    public int updateAddr(UserVO userVO, HttpSession session) {
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateAddr(userVO);
    }

    @PostMapping("/updateTag.do")
    @ResponseBody
    public int updateTag(UserVO userVO, HttpSession session) {
        UserVO sessionUser = (UserVO) session.getAttribute("user");
        userVO.setUserNo(sessionUser.getUserNo());
        return myPageService.doUpdateTag(userVO);
    }


    /* 찜목록 삭제 */
    // 찜 목록 개별 삭제 (이미지의 삭제 버튼 기능)
    @PostMapping("/deleteWish.do")
    @ResponseBody
    public int deleteWish(String tripContsId, HttpSession session) {
        UserVO user = (UserVO) session.getAttribute("user");
        if (user == null) return 0;

        UserVO inVO = new UserVO();
        TripVO iVO = new TripVO();
        inVO.setUserNo(user.getUserNo());
        iVO.setTripContsId(tripContsId);
        
        return myPageService.doDeleteWish(inVO);
    }
}