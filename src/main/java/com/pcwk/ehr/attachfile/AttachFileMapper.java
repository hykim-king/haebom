package com.pcwk.ehr.attachfile;

import com.pcwk.ehr.domain.AttachFileVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AttachFileMapper {

    // XML: doSave - 파일 등록
    int doSave(AttachFileVO fileVO);

    // XML: doDelete - 단건 삭제 (FILE_NO 기준)
    int doDelete(AttachFileVO fileVO);

    // XML: deleteAll - 전체 삭제
    int deleteAll();

    // XML: getCount - 건수 조회
    int getCount();

    // XML: doSelectOne - 단건 조회 (FILE_NO 기준)
    AttachFileVO doSelectOne(AttachFileVO fileVO);

    // XML: getFileList - 게시판별 파일 목록 조회 (BOARD_CLSF + BOARD_ID)
    List<AttachFileVO> getFileList(AttachFileVO fileVO);

    // XML: getAll - 전체 조회
    List<AttachFileVO> getAll();
}