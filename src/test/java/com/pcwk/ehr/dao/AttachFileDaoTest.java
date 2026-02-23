package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.domain.AttachFileVO;

@SpringBootTest
class AttachFileDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    AttachFileMapper attachFileMapper;

    AttachFileVO file01;
    AttachFileVO file02;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        attachFileMapper.deleteAll();

        file01 = new AttachFileVO();
        file01.setFileClsf("2");
        file01.setFilePathNm("/upload/notice/");
        file01.setFileNm("test01.png");
        file01.setBoardClsf("notice");
        file01.setBoardId(1);

        file02 = new AttachFileVO();
        file02.setFileClsf("1");
        file02.setFilePathNm("/upload/notice/");
        file02.setFileNm("test02.xlsx");
        file02.setBoardClsf("notice");
        file02.setBoardId(1);
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("파일 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 파일 등록
        // 3. 등록 확인

        // 1.
        int count = attachFileMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = attachFileMapper.doSave(file01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, attachFileMapper.getCount());

        log.info("file01: {}", file01);
    }

    @Test
    @DisplayName("전체 삭제")
    void deleteAll() {
        log.info("┌──────────────────────────┐");
        log.info("│deleteAll()               │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 전체 삭제
        // 3. 건수 확인

        // 1.
        attachFileMapper.doSave(file01);
        attachFileMapper.doSave(file02);
        assertEquals(2, attachFileMapper.getCount());

        // 2.
        attachFileMapper.deleteAll();

        // 3.
        assertEquals(0, attachFileMapper.getCount());
    }

    @Test
    @DisplayName("단건 조회")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelectOne()             │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 등록된 파일 번호 가져오기
        // 3. 단건 조회
        // 4. 결과 확인

        // 1.
        attachFileMapper.doSave(file01);

        // 2.
        AttachFileVO regVO = attachFileMapper.getAll().get(0);

        // 3.
        AttachFileVO outVO = attachFileMapper.doSelectOne(regVO);

        // 4.
        assertNotNull(outVO);
        assertEquals(regVO.getFileNo(), outVO.getFileNo());
        assertEquals(file01.getFileNm(), outVO.getFileNm());
        assertEquals(file01.getBoardClsf(), outVO.getBoardClsf());

        log.info("outVO: {}", outVO);
    }

    @Test
    @DisplayName("파일 삭제")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│doDelete()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 등록된 파일 번호 가져오기
        // 3. 삭제
        // 4. 건수 확인

        // 1.
        attachFileMapper.doSave(file01);
        assertEquals(1, attachFileMapper.getCount());

        // 2.
        AttachFileVO regVO = attachFileMapper.getAll().get(0);

        // 3.
        int flag = attachFileMapper.doDelete(regVO);
        assertEquals(1, flag);

        // 4.
        assertEquals(0, attachFileMapper.getCount());
    }
}
