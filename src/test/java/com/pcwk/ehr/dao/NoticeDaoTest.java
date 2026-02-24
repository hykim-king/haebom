package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.domain.NoticeVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
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

        // [수정] 새로운 NoticeVO 생성자 파라미터 개수(9개)에 맞게 조정
        // 순서: ntcNo, ntcTtl, ntcCn, ntcReg, ntcRegHm, ntcMod, ntcModHm, regNo, modNo
        notice01 = new NoticeVO(1, "제목01", "내용10", "안뇽", "ㅋㅋ", "ㅎㅇㅎㅇ", "12345", 11, 11);

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

        // 2. 테스트 데이터 10건 생성 및 즉시 저장
        for (int i = 1; i <= 10; i++) {
            NoticeVO vo = new NoticeVO();
            vo.setNtcTtl("공지사항 제목" + i);
            vo.setNtcCn("공지사항 내용" + i);
            vo.setRegNo(11);
            vo.setModNo(11);

            // saveAll 대신 확실히 검증된 doSave 호출
            noticeMapper.doSave(vo);
        }

        // 3. 건수 확인 (정확히 10건이어야 함)
        int totalCount = noticeMapper.getCount();
        log.info("저장된 전체 건수: {}", totalCount);
        assertEquals(10, totalCount);

        // 4. 페이징 조회 테스트
        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        searchVO.setSearchWord("공지사항");

        List<NoticeVO> retrieveList = noticeMapper.doRetrieve(searchVO);
        assertEquals(10, retrieveList.size());
    }


    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();
        noticeMapper.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);

        outVO.setNtcTtl(outVO.getNtcTtl() + "_수정");
        outVO.setNtcCn(outVO.getNtcCn() + "_수정내용");
        outVO.setModNo(11);

        int flag = noticeMapper.doUpdate(outVO);
        assertEquals(1, flag);

        NoticeVO updateVO = noticeMapper.doSelectOne(outVO);
        assertNotNull(updateVO);
        assertEquals(outVO.getNtcTtl(), updateVO.getNtcTtl());
    }

    @Test
    @DisplayName("조회 확인")
    void doSelectone() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectone()            │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();

        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);

        List<NoticeVO> list = noticeMapper.getAll();
        assertEquals(1, list.size());

        // 등록된 시퀀스 번호를 가져오기 위해 전체 목록에서 첫 번째 객체 사용
        NoticeVO regVO = list.get(0);
        assertNotNull(regVO);

        NoticeVO outVO = noticeMapper.doSelectOne(regVO);
        assertNotNull(outVO);

        assertEquals(regVO.getNtcNo(), outVO.getNtcNo());
        assertEquals(regVO.getNtcTtl(), outVO.getNtcTtl());
        assertNotNull(outVO.getNtcReg());
        assertNotNull(outVO.getNtcRegHm()); // [추가] 시간 필드 검증
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

        noticeMapper.deleteAll();

        int count = noticeMapper.getCount();
        assertEquals(0, count);

        int flag = noticeMapper.doSave(notice01);
        assertEquals(1, flag);
        assertEquals(1, noticeMapper.getCount());
    }
}