package com.pcwk.ehr.comment;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.report.ReportMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final Logger log = LogManager.getLogger(getClass());
    private final CommentMapper commentMapper;
    private final ReportMapper reportMapper;
    private final AttachFileMapper attachFileMapper;

    private static final String UPLOAD_PATH = System.getProperty("user.home") + "/upload/comment/";

    @Override
    public int doSave(CommentVO inVO) {
        return doSave(inVO, null);
    }

    @Override
    public int doSave(CommentVO inVO, List<MultipartFile> files) {
        log.info("댓글 등록: {}", inVO);
        int result = commentMapper.doSave(inVO);

        if (result == 1 && files != null) {
            int count = 0;
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty() && count < 5) {
                    saveAttachFile(file, inVO.getCmtNo());
                    count++;
                }
            }
        }

        return result;
    }

    @Override
    public int doUpdate(CommentVO inVO) {
        return doUpdate(inVO, null);
    }

    @Override
    public int doUpdate(CommentVO inVO, List<MultipartFile> files) {
        log.info("댓글 수정: cmtNo={}", inVO.getCmtNo());
        int result = commentMapper.doUpdate(inVO);

        if (result == 1 && files != null && !files.isEmpty()) {
            deleteAttachFiles(inVO.getCmtNo());
            int count = 0;
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty() && count < 5) {
                    saveAttachFile(file, inVO.getCmtNo());
                    count++;
                }
            }
        }

        return result;
    }

    @Override
    public int doDelete(CommentVO inVO) {
        log.info("댓글 삭제: cmtNo={}", inVO.getCmtNo());
        // 첨부파일 삭제
        deleteAttachFiles(inVO.getCmtNo());
        // 관련 신고 삭제
        reportMapper.deleteByCmtNo(inVO.getCmtNo());
        return commentMapper.doDelete(inVO);
    }

    @Override
    public List<CommentVO> getCommentsByTarget(CommentVO param) {
        return commentMapper.getCommentsByTarget(param);
    }

    @Override
    public int getCountByTarget(CommentVO param) {
        return commentMapper.getCountByTarget(param);
    }

    @Override
    public boolean hasUserCommented(CommentVO param) {
        return commentMapper.getCountByUserAndTarget(param) > 0;
    }

    private void saveAttachFile(MultipartFile file, int cmtNo) {
        File uploadDir = new File(UPLOAD_PATH);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String originalName = file.getOriginalFilename();
        String savedName = UUID.randomUUID() + "_" + originalName;
        File saveFile = new File(UPLOAD_PATH, savedName);

        try {
            file.transferTo(saveFile);
            log.info("댓글 이미지 저장: {}", savedName);

            AttachFileVO fileVO = new AttachFileVO();
            fileVO.setFileClsf("img");
            fileVO.setFilePathNm(UPLOAD_PATH + savedName);
            fileVO.setFileNm(originalName);
            fileVO.setBoardClsf("comment");
            fileVO.setBoardId(cmtNo);

            attachFileMapper.doSave(fileVO);
        } catch (IOException e) {
            log.error("댓글 이미지 저장 실패: {}", e.getMessage());
        }
    }

    private void deleteAttachFiles(int cmtNo) {
        AttachFileVO param = new AttachFileVO();
        param.setBoardClsf("comment");
        param.setBoardId(cmtNo);

        List<AttachFileVO> files = attachFileMapper.getFileList(param);
        for (AttachFileVO f : files) {
            new File(f.getFilePathNm()).delete();
            attachFileMapper.doDelete(f);
        }
    }
}
