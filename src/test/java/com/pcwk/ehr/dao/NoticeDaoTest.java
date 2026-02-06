package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.notice.NoticeVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class NoticeDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    NoticeMapper noticeMapper;

    NoticeVO notice01;
    NoticeVO notice02;
    NoticeVO notice03;

    @BeforeEach
    void setUp() throws Exception{
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        int seq = 0;

        LocalDateTime localDateTime = null;
        notice01 = new NoticeVO(seq,"제목01","내용10",localDateTime,10,1);
        notice02 = new NoticeVO(seq,"제목02","내용10",localDateTime,20,2);
        notice03 = new NoticeVO(seq,"제목03","내용10",localDateTime,30,3);
        // 전체 삭제
        noticeMapper.deleteAll();

    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("등록 확인")
    void doSave(){
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수
        // 2. 등록
        // 3. 조회

        // 1.
        int count = noticeMapper.getCount();
        assertEquals(0,count);
        log.info("등록 전 전체 건수: {}", count);

        // 2.
        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, noticeMapper.getCount());
        log.info("등록 후 전체 건수: {}", noticeMapper.getCount());
    }


    @Test
    @Disabled
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("noticeMapper: {}", noticeMapper);
        assertNotNull(noticeMapper);
    }

}
