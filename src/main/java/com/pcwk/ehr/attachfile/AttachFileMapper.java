package com.pcwk.ehr.attachfile;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.AttachFileVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AttachFileMapper extends WorkDiv<AttachFileVO> {

    List<AttachFileVO> getFileList(AttachFileVO param);

    List<AttachFileVO> getAll();

    int getCount();

    int deleteAll();
}
