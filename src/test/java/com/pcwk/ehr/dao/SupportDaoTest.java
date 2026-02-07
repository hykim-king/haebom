package com.pcwk.ehr.dao;

import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.support.SupportVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

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

        // 기존 데이터 삭제
        supportMapper.deleteAll();

        support01 = new SupportVO();
        support01.setSupId(5); // ID 직접 설정
        support01.setSupContent("테스트 내용입니다.");
        support01.setSupAnswer("답변 완료 되었습니다");
        support01.setSupAnswerReg(LocalDateTime.now());
        support01.setRegDt(LocalDateTime.now());
        support01.setRegId(5);

        // 1.
        int count = supportMapper.getCount();
        assertEquals(0,count);
        log.info("등록 전 전체 건수: {}", count);

        // 2.
        int flag = supportMapper.doSave(support01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, supportMapper.getCount());
        log.info("등록 후 전체 건수: {}", supportMapper.getCount());


    }

}