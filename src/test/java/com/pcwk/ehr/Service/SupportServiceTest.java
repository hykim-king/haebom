package com.pcwk.ehr.Service;

import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.support.SupportService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class SupportServiceTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    SupportService supportService;

    @Autowired
    SupportMapper supportMapper;

    SupportVO support01;

    final int EXISTING_USER_NO = 1;

    @BeforeEach
    void setUp() {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        support01 = new SupportVO();
        support01.setSupCn("문의 내용01");
        support01.setSupAnsCn("답변 대기 중...");
        support01.setRegNo(EXISTING_USER_NO);
        support01.setSupYn("N");
    }

    @Test
    @DisplayName("등록 확인")
    void doSave(){
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        for(int i=1; i<=100; i++) {
            SupportVO vo = new SupportVO();
            vo.setSupCn("문의사항 내용 " + i);
            vo.setSupAnsCn("답변 완료 " + i);
            vo.setRegNo(EXISTING_USER_NO);
            vo.setSupYn("N");

            supportService.doSave(vo);
        }

        int totalCount = supportMapper.getCount();
        log.info("DB 저장 건수: {}", totalCount);
        assertEquals(100, totalCount);
    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete(){
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        supportService.doSave(support01);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);

        int flag = supportService.doDelete(outVO);
        assertEquals(1, flag);
        log.info("삭제 된 건수: {}", flag);

        // --- 확인 로직 보완 ---
        int finalCount = supportMapper.getCount();
        log.info("삭제 후 DB 건수: {}", finalCount);
        assertEquals(0, finalCount);
    }

    @Test
    @DisplayName("단건 조회 확인")
    void doSelectOne(){
        log.info("┌──────────────────────────┐");
        log.info("│ doSelectOne()            │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();
        supportService.doSave(support01);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO savedVO = list.get(0);

        SupportVO outVO = supportService.doSelectOne(savedVO);

        assertNotNull(outVO);
        assertEquals(savedVO.getSupCn(), outVO.getSupCn());
        log.info("조회된 내용: {}", outVO.getSupCn());
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}