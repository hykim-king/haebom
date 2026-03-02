package com.pcwk.ehr.dao;

import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.notice.NoticeMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 기본 테스트 데이터 설정
        notice01 = new NoticeVO();
        notice01.setNtcNo(1);
        notice01.setNtcTtl("테스트 제목");
        notice01.setNtcCn("테스트 내용");
        notice01.setRegNo(10);
        notice01.setModNo(10);
        notice01.setNtcReg("20260302");

        noticeMapper.deleteAll();
    }

    @Test
    @DisplayName("등록 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        // [수정] Map 없이 직접 doSave 호출 및 결과 확인
        noticeMapper.deleteAll();

        // 1. 초기 상태 확인
        int count = noticeMapper.getCount(notice01);
        assertEquals(0, count);

        // 2. 등록 실행
        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag); // [주석] 등록 성공 시 1이 반환되어야 합니다.

        // 3. 건수 및 데이터 일치 확인
        assertEquals(1, noticeMapper.getCount(notice01));

        NoticeVO savedVO = noticeMapper.doSelectOne(notice01);
        assertNotNull(savedVO);
        assertEquals(notice01.getNtcTtl(), savedVO.getNtcTtl());
        log.info("등록 완료 및 검증 성공: {}", savedVO.getNtcTtl());
    }

    @Test
    @DisplayName("검색 확인 (대량 등록)")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();

        // [수정] Map을 쓰지 않고 반복문을 통해 10건의 데이터를 직접 등록합니다.
        int saveDataCount = 10;
        for (int i = 1; i <= saveDataCount; i++) {
            NoticeVO tempVO = new NoticeVO();
            tempVO.setNtcNo(i);
            tempVO.setNtcTtl("공지사항 제목 " + i);
            tempVO.setNtcCn("공지사항 내용 " + i);
            tempVO.setRegNo(10);
            tempVO.setModNo(10);

            noticeMapper.doSave(tempVO);
        }

        // 전체 건수 확인
        int totalCount = noticeMapper.getCount(notice01);
        assertEquals(saveDataCount, totalCount);
        log.info("대량 등록 완료 - 총 건수: {}", totalCount);
    }

    // ... doUpdate, doSelectone 등 나머지 메서드는 이전과 동일하게 유지
}