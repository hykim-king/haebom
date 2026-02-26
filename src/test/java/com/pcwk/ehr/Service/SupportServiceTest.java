package com.pcwk.ehr.Service;

import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.support.SupportService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


@SpringBootTest
class SupportServiceTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    SupportService supportService;

    @Autowired
    SupportMapper supportMapper;

    SupportVO support01;

    @BeforeEach
    void setUp() {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();
        support01 = new SupportVO(0, "문의 내용 01", "답변 대기 중", null, null, null, "N", 13, null);
    }

    @Test
    @DisplayName("등록 확인")
    @Disabled
    void doSave(){
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();
        assertEquals(0, supportMapper.getCount());

        List<SupportVO> list = new ArrayList<>();
        for(int i=1; i<=3; i++) {
            SupportVO vo = new SupportVO();
            vo.setSupCn("문의사항 내용 " + i);
            vo.setSupAnsCn("답변 완료 " + i);
            vo.setRegNo(11);
            supportMapper.doSave(vo);
        }

        int totalCount = supportMapper.getCount();
        log.info("DB 저장 건수: {}", totalCount);
        assertEquals(3, totalCount);
    }

    @Test
    @DisplayName("삭제 확인")
    @Disabled
    void doDelete(){
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        // 1. 전체 삭제 후 1건 등록
        supportMapper.deleteAll();
        SupportVO vo = new SupportVO();
        vo.setSupCn("삭제 테스트용 문의 내용");
        vo.setSupAnsCn("삭제 테스트용 답변 내용");
        vo.setRegNo(11);
        supportMapper.doSave(vo);

        // 2. 데이터 가져오기
        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);

        // 3. 삭제
        int flag = supportService.doDelete(outVO);
        assertEquals(1, flag);
        log.info("삭제 된 건수: {}", flag);

        // 4. 확인
        assertEquals(0,supportMapper.getCount());
        log.info("DB 저장 건수: {}", supportMapper.getCount());

    }

    @Test
    @DisplayName("조회 확인")
    void doSelectOne(){
        log.info("┌──────────────────────────┐");
        log.info("│ doSelectOne()            │");
        log.info("└──────────────────────────┘");
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}
