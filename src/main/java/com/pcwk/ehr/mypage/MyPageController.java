package com.pcwk.ehr.mypage;

import java.util.HashMap;
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
import com.pcwk.ehr.user.UserEntity; // 💡 반드시 추가되어야 함
import lombok.extern.slf4j.Slf4j;
import java.util.Map;
import java.util.HashMap;


@Slf4j
@Controller
@RequestMapping("/mypage")
public class MyPageController {

    @Autowired
    private MyPageService myPageService;

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
    public int getRelationCount(HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return 0;

        UserVO inVO = new UserVO();
        inVO.setUserNo(sessionUser.getUserNo());

        return myPageService.getRelationCount(inVO);
    }

    /**
     * 3. 찜 목록 리스트 조회
     */
    @GetMapping("/getRelationList.do")
    @ResponseBody
    public List<UserVO> getRelationList(HttpSession session) {
        UserEntity sessionUser = (UserEntity) session.getAttribute("user");
        if (sessionUser == null)
            return null;

        UserVO inVO = new UserVO();
        inVO.setUserNo(sessionUser.getUserNo());

        return myPageService.getRelationList(inVO);
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

    /**
     * 7. 찜목록 삭제
     */
    @PostMapping("/deleteWish.do")
    @ResponseBody
    public int deleteWish(String tripContsId, HttpSession session) {
        // 💡 1. 세션에서 UserEntity 꺼내기
        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null)
            return 0;

        // 💡 2. Map 생성 및 데이터 담기
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("userNo", user.getUserNo());

        if (tripContsId != null && !tripContsId.isEmpty()) {
            paramMap.put("tripContsId", Integer.parseInt(tripContsId));
        }

        // 💡 3. Map을 파라미터로 서비스 호출
        return myPageService.doDeleteWish(paramMap);
    }
}