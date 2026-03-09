package com.pcwk.ehr.comment;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.pcwk.ehr.domain.CommentVO;

public interface CommentService {

    int doSave(CommentVO inVO);

    int doSave(CommentVO inVO, List<MultipartFile> files);

    int doUpdate(CommentVO inVO);

    int doUpdate(CommentVO inVO, List<MultipartFile> files);

    int doDelete(CommentVO inVO);

    List<CommentVO> getCommentsByTarget(CommentVO param);

    int getCountByTarget(CommentVO param);
}
