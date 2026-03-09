package com.pcwk.ehr.comment;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.user.UserEntity;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentController {

    private final Logger log = LogManager.getLogger(getClass());
    private final CommentService commentService;

    /**
     * 댓글 등록 (파일 첨부 포함)
     */
    @PostMapping("/doSave.do")
    public Map<String, Object> doSave(
            @RequestParam("cmtCn") String cmtCn,
            @RequestParam("cmtStarng") int cmtStarng,
            @RequestParam("cmtClsf") int cmtClsf,
            @RequestParam("tripCourseNo") int tripCourseNo,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            result.put("status", -1);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        CommentVO inVO = new CommentVO();
        inVO.setCmtCn(cmtCn);
        inVO.setCmtStarng(cmtStarng);
        inVO.setCmtClsf(cmtClsf);
        inVO.setTripCourseNo(tripCourseNo);
        inVO.setRegNo(user.getUserNo());
        inVO.setCmtHideYn("N");

        int flag = commentService.doSave(inVO, files);
        result.put("status", flag);
        result.put("message", flag == 1 ? "등록 성공" : "등록 실패");
        return result;
    }

    /**
     * 댓글 수정 (파일 첨부 포함)
     */
    @PostMapping("/doUpdate.do")
    public Map<String, Object> doUpdate(
            @RequestParam("cmtNo") int cmtNo,
            @RequestParam("cmtCn") String cmtCn,
            @RequestParam("cmtStarng") int cmtStarng,
            @RequestParam("cmtClsf") int cmtClsf,
            @RequestParam("tripCourseNo") int tripCourseNo,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            result.put("status", -1);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        CommentVO inVO = new CommentVO();
        inVO.setCmtNo(cmtNo);
        inVO.setCmtCn(cmtCn);
        inVO.setCmtStarng(cmtStarng);
        inVO.setCmtClsf(cmtClsf);
        inVO.setTripCourseNo(tripCourseNo);
        inVO.setModNo(user.getUserNo());
        inVO.setCmtHideYn("N");

        int flag = commentService.doUpdate(inVO, files);
        result.put("status", flag);
        result.put("message", flag == 1 ? "수정 성공" : "수정 실패");
        return result;
    }

    /**
     * 댓글 삭제
     */
    @PostMapping("/doDelete.do")
    public Map<String, Object> doDelete(@RequestBody CommentVO inVO, HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        UserEntity user = (UserEntity) session.getAttribute("user");
        if (user == null) {
            result.put("status", -1);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        int flag = commentService.doDelete(inVO);
        result.put("status", flag);
        result.put("message", flag == 1 ? "삭제 성공" : "삭제 실패");
        return result;
    }

    /**
     * 여행지/코스별 댓글 목록 조회
     */
    @GetMapping("/getList.do")
    public Map<String, Object> getList(
            @RequestParam("tripCourseNo") int tripCourseNo,
            @RequestParam("cmtClsf") int cmtClsf) {

        CommentVO param = new CommentVO();
        param.setTripCourseNo(tripCourseNo);
        param.setCmtClsf(cmtClsf);

        List<CommentVO> list = commentService.getCommentsByTarget(param);
        int count = commentService.getCountByTarget(param);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("count", count);
        return result;
    }

    /**
     * 댓글 첨부 이미지 서빙
     */
    @GetMapping("/image")
    public ResponseEntity<Resource> getImage(@RequestParam("path") String path) {
        File file = new File(path);
        if (!file.exists()) return ResponseEntity.notFound().build();

        String name = file.getName().toLowerCase();
        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (name.endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (name.endsWith(".gif")) mediaType = MediaType.IMAGE_GIF;
        else if (name.endsWith(".webp")) mediaType = MediaType.parseMediaType("image/webp");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new FileSystemResource(file));
    }
}
