package com.pcwk.ehr.attachfile;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.AttachFileVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AttachFileMapper extends WorkDiv<AttachFileVO> {

    int getCount();

    // XML: getFileList - 게시판별 파일 목록 조회 (BOARD_CLSF + BOARD_ID)
    List<AttachFileVO> getFileList(AttachFileVO fileVO);

    // XML: getAll - 전체 조회
    List<AttachFileVO> getAll();
}