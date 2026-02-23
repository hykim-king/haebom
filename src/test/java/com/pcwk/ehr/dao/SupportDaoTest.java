package com.pcwk.ehr.dao;

import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.domain.SupportVO;
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
class SupportDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    SupportMapper supportMapper;

    SupportVO support01;

    @BeforeEach
    void setUp() {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // [복구/수정] 기존 필드 유지하며 9개 파라미터 생성자 호출 (사용자 번호 1번 사용)
        support01 = new SupportVO(0, "문의 내용 01", "답변 대기 중", null, null, null, "N", 1, null);
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("등록 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();
        assertEquals(0, supportMapper.getCount());

        Map<String, Object> param = new HashMap<>();
        param.put("regNo", 1);
        param.put("saveSupportDataCount", 100);

        int flag = supportMapper.saveAll(param);
        log.info("saveAll 실행 결과: {}", flag);
        assertEquals(100, flag);

        int totalCount = supportMapper.getCount();
        log.info("DB 저장 건수: {}", totalCount);
        assertEquals(100, totalCount);
    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        // [복구] 하니님이 작성하신 doDelete 로직 그대로 유지
        supportMapper.deleteAll();

        for (int i = 1; i <= 10; i++) {
            SupportVO vo = new SupportVO();
            vo.setSupCn("문의 내용 " + i);
            vo.setSupAnsCn("답변 내용 " + i);
            vo.setRegNo(1);
            supportMapper.doSave(vo);
        }

        int count = supportMapper.getCount();
        log.info("생성된 데이터 건수: {}", count);
        assertEquals(10, count);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);

        int flag = supportMapper.doDelete(outVO);
        assertEquals(1, flag);
        log.info("삭제 된 건수: {}", flag);

        assertEquals(9, supportMapper.getCount());
        log.info("삭제 후 전체 건수: {}", supportMapper.getCount());
    }

    @Test
    @DisplayName("조회 확인")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectone()            │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        SupportVO vo = new SupportVO();
        vo.setSupCn("테스트 내용입니다.");
        vo.setSupAnsCn("답변 완료 되었습니다");
        vo.setRegNo(1);
        vo.setSupYn("N");

        int flag = supportMapper.doSave(vo);
        assertEquals(1, flag);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO savedVO = list.get(0);
        SupportVO outVO = supportMapper.doSelectOne(savedVO);

        log.info("조회 결과: {}", outVO);

        assertNotNull(outVO);
        assertEquals(vo.getSupCn(), outVO.getSupCn());
        assertEquals(vo.getSupAnsCn(), outVO.getSupAnsCn());
        assertNotNull(outVO.getSupReg());   // DB 자동 입력 날짜 확인
        assertNotNull(outVO.getSupRegHm()); // DB 자동 입력 시간 확인 [추가]
        assertEquals(vo.getRegNo(), outVO.getRegNo());
    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();
        supportMapper.doSave(support01);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);

        String updatedContent = "수정된 내용입니다!";
        String updatedAnswer = "수정된 답변입니다!";
        outVO.setSupCn(updatedContent);
        outVO.setSupAnsCn(updatedAnswer);

        int updateFlag = supportMapper.doUpdate(outVO);
        assertEquals(1, updateFlag);

        SupportVO resultVO = supportMapper.doSelectOne(outVO);
        assertNotNull(resultVO);
        assertEquals(updatedContent, resultVO.getSupCn());
        assertEquals(updatedAnswer, resultVO.getSupAnsCn());
        log.info("수정 후 데이터: {}", resultVO);
    }

    @Test
    @DisplayName("검색 확인")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        Map<String, Object> param = new HashMap<>();
        param.put("regNo", 1);
        param.put("saveSupportDataCount", 30);
        supportMapper.saveAll(param);

        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);

        List<SupportVO> list = supportMapper.doRetrieve(searchVO);

        for (SupportVO vo : list) {
            log.info(vo);
        }

        assertEquals(10, list.size());
    }
}