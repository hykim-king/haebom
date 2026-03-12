package com.pcwk.ehr.admin;

import com.pcwk.ehr.comment.CommentMapper;
import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final Logger log = LogManager.getLogger(getClass());

    private final UserService userService;
    private final CommentMapper commentMapper;

    /**
     * 1. 관리자 메인 페이지 이동
     */
    @GetMapping("/users")
    public String getUserList(Model model) {
        return "admin/admin";
    }

    //---------------[사용자 관리]------------------------------------------------------------

    /**
     * 2. 사용자 목록 데이터 제공 (API)
     * JS(fetch) 요청에 응답하기 위해 @ResponseBody를 추가.
     */
    @GetMapping("/users/api")
    @ResponseBody
    public List<UserEntity> getUserListApi() {
        log.info("관리자: 사용자 목록 데이터 요청");
        return userService.getAllUsers();
    }

    /**
     * 3. 사용자 상태 변경 (드롭다운 방식)
     * /admin/users/{userNo}/status?status=Y 형태로 요청을 받습니다.
     */
    @PatchMapping("/users/{userNo}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer userNo, @RequestParam String status) {
        log.info("관리자: 사용자 상태 업데이트 요청 - 번호: {}, 대상 상태: {}", userNo, status);

        // userService에 status 값을 넘겨주는 새로운 메서드를 호출하거나 기존 로직 수정
        userService.updateUserStatus(userNo, status);

        return ResponseEntity.ok().build();
    }

    /**
     * 4. 물리적 데이터 삭제
     */
    @DeleteMapping("/users/{userNo}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer userNo) {
        log.info("관리자: 사용자 삭제 요청 - 번호: {}", userNo);
        userService.deleteUser(userNo);
        return ResponseEntity.ok().build();
    }

    //----------------[댓글 관리]-----------------------------------------------------------

    /**
     * 관리자 댓글 목록 조회
     * 예: /admin/comments/api?pageNo=1&pageSize=10&searchDiv=10&searchWord=내용
     */
    @GetMapping("/comments/api")
    @ResponseBody
    public Map<String, Object> getComments(CommentVO commentVO) {
        log.info("관리자 댓글 목록 조회 요청: {}", commentVO);

        if (commentVO.getPageNo() <= 0) {
            commentVO.setPageNo(1);
        }
        if (commentVO.getPageSize() <= 0) {
            commentVO.setPageSize(10);
        }

        List<Map<String, Object>> list = commentMapper.doAdminRetrieve(commentVO);
        int totalCnt = commentMapper.getSearchCount(commentVO);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("totalCnt", totalCnt);
        result.put("pageNo", commentVO.getPageNo());
        result.put("pageSize", commentVO.getPageSize());

        return result;
    }

    /**
     * 댓글 숨김/숨김해제
     * 예: PATCH /admin/comments/12/hide?cmtHideYn=Y
     */
    @PatchMapping("/comments/{cmtNo}/hide")
    public ResponseEntity<?> updateCommentHideStatus(
            @PathVariable int cmtNo,
            @RequestParam String cmtHideYn,
            HttpSession session) {

        if (!"Y".equals(cmtHideYn) && !"N".equals(cmtHideYn)) {
            return ResponseEntity.badRequest().body("cmtHideYn 값은 Y 또는 N만 가능합니다.");
        }

        CommentVO param = new CommentVO();
        param.setCmtNo(cmtNo);
        param.setCmtHideYn(cmtHideYn);

        Object userNoObj = session.getAttribute("userNo");
        if (userNoObj instanceof Integer) {
            param.setModNo((Integer) userNoObj);
        } else if (userNoObj instanceof String) {
            try {
                param.setModNo(Integer.parseInt((String) userNoObj));
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("세션 사용자 번호가 올바르지 않습니다.");
            }
        }

        int flag = commentMapper.updateHideYn(param);

        if (flag != 1) {
            return ResponseEntity.internalServerError().body("댓글 숨김 상태 변경에 실패했습니다.");
        }

        return ResponseEntity.ok("댓글 숨김 상태가 변경되었습니다.");
    }
}

