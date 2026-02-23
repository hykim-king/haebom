package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.comment.CommentMapper;
import com.pcwk.ehr.domain.CommentVO;
import com.pcwk.ehr.domain.ReportVO;
import com.pcwk.ehr.report.ReportMapper;

@SpringBootTest
class ReportDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    ReportMapper reportMapper;

    @Autowired
    CommentMapper commentMapper;

    ReportVO report01;
    ReportVO report02;

    CommentVO comment01;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제 (report → cmt 순서)
        reportMapper.deleteAll();
        commentMapper.deleteAll();

        // 1. 댓글 먼저 등록 (FK 참조용)
        comment01 = new CommentVO();
        comment01.setCmtCn("테스트 댓글");
        comment01.setCmtStarng(5);
        comment01.setCmtClsf(1);
        comment01.setTripCourseNo(1);
        comment01.setCmtHideYn("N");
        comment01.setRegNo(1);
        commentMapper.doSave(comment01);

        // 2. 신고 데이터 세팅
        report01 = new ReportVO();
        report01.setRepCn("욕설이 포함된 댓글입니다.");
        report01.setRepClsf(1);
        report01.setCmtNo(comment01.getCmtNo());
        report01.setRegNo(1);

        report02 = new ReportVO();
        report02.setRepCn("허위 정보가 포함되어 있습니다.");
        report02.setRepClsf(2);
        report02.setCmtNo(comment01.getCmtNo());
        report02.setRegNo(1);
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("신고 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 신고 등록
        // 3. 등록 확인

        // 1.
        int count = reportMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = reportMapper.doSave(report01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, reportMapper.getCount());

        log.info("report01: {}", report01);
    }

    @Test
    @DisplayName("신고 처리(수정)")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│doUpdate()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 신고 처리
        // 3. 결과 확인

        // 1.
        reportMapper.doSave(report01);

        // 2.
        report01.setRepStatYn("Y");
        int flag = reportMapper.doUpdate(report01);
        assertEquals(1, flag);

        // 3.
        ReportVO outVO = reportMapper.doSelectOne(report01);
        assertEquals("Y", outVO.getRepStatYn());
        assertNotNull(outVO.getRepProcDt());
        assertNotNull(outVO.getRepProcHm());

        log.info("outVO: {}", outVO);
    }

    @Test
    @DisplayName("신고 삭제")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│doDelete()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 삭제
        // 3. 결과 확인

        // 1.
        reportMapper.doSave(report01);
        assertEquals(1, reportMapper.getCount());

        // 2.
        int flag = reportMapper.doDelete(report01);
        assertEquals(1, flag);

        // 3.
        assertEquals(0, reportMapper.getCount());
    }

    @Test
    @DisplayName("단건 조회")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelectOne()             │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 단건 조회
        // 3. 결과 확인

        // 1.
        reportMapper.doSave(report01);

        // 2.
        ReportVO outVO = reportMapper.doSelectOne(report01);

        // 3.
        assertNotNull(outVO);
        assertEquals(report01.getRepCn(), outVO.getRepCn());
        assertEquals(report01.getRepClsf(), outVO.getRepClsf());

        log.info("outVO: {}", outVO);
    }

    @Disabled
    @Test
    @DisplayName("목록 조회")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│doRetrieve()              │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 목록 조회
        // 3. 결과 확인

        // 1.
        reportMapper.doSave(report01);
        reportMapper.doSave(report02);
        assertEquals(2, reportMapper.getCount());

        // 2.
        DTO searchParam = new DTO();
        searchParam.setPageNo(1);
        searchParam.setPageSize(10);
        searchParam.setSearchDiv("");
        searchParam.setSearchWord("");

        List<ReportVO> list = reportMapper.doRetrieve(searchParam);

        // 3.
        assertNotNull(list);
        assertTrue(list.size() > 0);

        for (ReportVO vo : list) {
            log.info("vo: {}", vo);
        }
    }

    @Disabled
    @Test
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("reportMapper: {}", reportMapper);
        assertNotNull(reportMapper);
    }
}
