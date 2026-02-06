package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.notice.NoticeVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class NoticeDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    NoticeMapper noticeMapper;

    NoticeVO notice01;

    @BeforeEach
    void setUp() throws Exception{
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        int seq = 0;
        LocalDateTime localDateTime = null;
        notice01 = new NoticeVO(seq,"제목01","내용10",localDateTime,5,localDateTime);

        noticeMapper.deleteAll();

    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate(){
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        // 일단 전체 지우고 하나 저장
        noticeMapper.deleteAll();
        noticeMapper.doSave(notice01);
        log.info("전체 삭제 후 저장 완료:{}", notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);
        log.info("조회 결과: {}", outVO);

        outVO.setNoticeTitle(outVO.getNoticeTitle()+"_Title Update");
        outVO.setNoticeContent(outVO.getNoticeContent()+"_Content Update");
        log.info("수정 전: {}", outVO);

        int flag = noticeMapper.doUpdate(outVO);
        assertEquals(1, flag);
        log.info("수정 후: {}", outVO);
    }

    @Test
    @DisplayName("조회 확인")
    void doSelectone(){
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectone()            │");
        log.info("└──────────────────────────┘");

        // 전체 삭제
        noticeMapper.deleteAll();

        int count = noticeMapper.getCount();
        assertEquals(0,count);
        log.info("전체 삭제 완료 - 초기화 확인 완료: {}", count);

        // 등록
        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);
        log.info("등록 완료 - 등록 건수: {}", flag);

        // 조회
        NoticeVO outVO = noticeMapper.doSelectOne(notice01);
        log.info("조회 결과: {}", outVO);
        assertNotNull(outVO); // <- 데이터가 비었는지 확인

        assertEquals(notice01.getNoticeId(), outVO.getNoticeId());
        assertEquals(notice01.getNoticeTitle(), outVO.getNoticeTitle());
        assertEquals(notice01.getNoticeContent(), outVO.getNoticeContent());
        assertEquals(notice01.getRegId(), outVO.getRegId());
        assertNotNull(outVO.getModDt());
        assertNotNull(outVO.getRegDt());

    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete(){
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        // 초기화 확인
        int count = this.noticeMapper.getCount();
        assertEquals(0,count);
        log.info("초기화 확인 - 전체 건수: {}", count);

        // 단건 등록
        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);

        log.info("단건 등록 - 결과: {}", flag);

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

        noticeMapper.deleteAll();

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
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("noticeMapper: {}", noticeMapper);
        assertNotNull(noticeMapper);
    }

}
