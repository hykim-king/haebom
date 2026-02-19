package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.notice.NoticeVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        int seq = 0;
        LocalDateTime localDateTime = null;
        notice01 = new NoticeVO(seq, "제목01", "내용10", null, null, 1, 1);
        noticeMapper.deleteAll();

    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("검색 확인")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        // 1. 기존 데이터 삭제
        noticeMapper.deleteAll();

        // 2. 테스트 데이터 10건 생성 (saveAll 호출)
        Map<String, Integer> param = new HashMap<>();
        param.put("regNo", 1);
        param.put("saveNoticeDataCount", 10);

        int flag = noticeMapper.saveAll(param);
        assertEquals(10, flag);

        // 페이징 조회
        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        searchVO.setSearchDiv("10");
        searchVO.setSearchWord("공지사항 제목");

        // 실행
        List<NoticeVO> list = noticeMapper.doRetrieve(searchVO);

        // 결과 확인
        for (NoticeVO vo : list) {
            log.info(vo);
        }

        assertEquals(10, list.size());

        log.info("전체 건수 : {}", list.get(0).toString());
    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
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

        outVO.setNtcTtl(outVO.getNtcTtl() + "_Title Update");
        outVO.setNtcCn(outVO.getNtcCn() + "_Content Update");
        log.info("수정 전: {}", outVO);

        int flag = noticeMapper.doUpdate(outVO);
        assertEquals(1, flag);
        log.info("수정 후: {}", outVO);
    }

    @Test
    @DisplayName("조회 확인")
    void doSelectone() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectone()            │");
        log.info("└──────────────────────────┘");

        // 전체 삭제
        noticeMapper.deleteAll();

        int count = noticeMapper.getCount();
        assertEquals(0, count);
        log.info("전체 삭제 완료 - 초기화 확인 완료: {}", count);

        // 등록
        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);
        log.info("등록 완료 - 등록 건수: {}", flag);

        // 조회
        NoticeVO outVO = noticeMapper.doSelectOne(notice01);
        log.info("조회 결과: {}", outVO);
        assertNotNull(outVO); // <- 데이터가 비었는지 확인

        assertEquals(notice01.getNtcNo(), outVO.getNtcNo());
        assertEquals(notice01.getNtcTtl(), outVO.getNtcTtl());
        assertEquals(notice01.getNtcCn(), outVO.getNtcCn());
        assertNotNull(outVO.getNtcReg());
        assertNotNull(outVO.getNtcMod());
        assertEquals(notice01.getRegNo(), outVO.getRegNo());
        assertEquals(notice01.getModNo(), outVO.getModNo());

    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();
        noticeMapper.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);

        int flag = noticeMapper.doDelete(outVO);
        assertEquals(1, flag);

        assertEquals(0, noticeMapper.getCount());

    }

    @Test
    @DisplayName("등록 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수
        // 2. 등록
        // 3. 조회

        noticeMapper.deleteAll();

        // 1.
        int count = noticeMapper.getCount();
        assertEquals(0, count);
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
