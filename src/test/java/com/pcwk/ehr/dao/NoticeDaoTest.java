package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.domain.NoticeVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
        notice01 = new NoticeVO(0, "제목01", "내용10", null, null, null, null, 1, 1);

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

        noticeMapper.deleteAll();

        Map<String, Object> param = new HashMap<>(); // [수정] Map 타입 변경 권장
        param.put("regNo", 1);
        param.put("modNo", 1); // [추가] XML에서 사용하므로 추가
        param.put("saveNoticeDataCount", 10);

        noticeMapper.saveAll(param);

        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        // searchDiv, searchWord 등은 DTO나 VO에 필드가 있어야 작동합니다.

        List<NoticeVO> list = noticeMapper.doRetrieve(searchVO);

        for (NoticeVO vo : list) {
            log.info(vo);
        }

        assertEquals(10, list.size());
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
        outVO.setModNo(1); // 수정자 변경 테스트

        int flag = noticeMapper.doUpdate(outVO);
        assertEquals(1, flag);

        NoticeVO updateVO = noticeMapper.doSelectOne(outVO);
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

        // 등록된 시퀀스 번호를 가져오기 위해 전체 목록에서 첫 번째 객체 사용
        NoticeVO regVO = noticeMapper.getAll().get(0);
        NoticeVO outVO = noticeMapper.doSelectOne(regVO);

        log.info("조회 결과: {}", outVO);
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
        int flag = noticeMapper.doDelete(list.get(0));

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