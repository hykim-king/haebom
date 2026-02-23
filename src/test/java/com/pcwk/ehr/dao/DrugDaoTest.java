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
import com.pcwk.ehr.domain.DrugVO;
import com.pcwk.ehr.drug.DrugMapper;

@SpringBootTest
class DrugDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    DrugMapper drugMapper;

    DrugVO drug01;
    DrugVO drug02;
    DrugVO drug03;


    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        drugMapper.deleteAll();

        drug01 = new DrugVO();
        drug01.setDsNo(1);
        drug01.setDsNm("서울약국");
        drug01.setDsAddr("서울특별시 종로구 대학로 101");
        drug01.setDsTelno("02-2072-2114");
        drug01.setDsLat(37.5796);
        drug01.setDsLot(126.9990);
        drug01.setDsOpTm("09:00");
        drug01.setDsEndTm("18:00");
        drug01.setDsWkndOpenYn("N");

        drug02 = new DrugVO();
        drug02.setDsNo(2);
        drug02.setDsNm("세브란스약국");
        drug02.setDsAddr("서울특별시 서대문구 연세로 50-1");
        drug02.setDsTelno("02-2228-0114");
        drug02.setDsLat(37.5622);
        drug02.setDsLot(126.9407);
        drug02.setDsOpTm("08:30");
        drug02.setDsEndTm("17:30");
        drug02.setDsWkndOpenYn("N");

        drug03 = new DrugVO();
        drug03.setDsNo(3);
        drug03.setDsNm("삼성서울약국");
        drug03.setDsAddr("서울특별시 강남구 일원로 81");
        drug03.setDsTelno("02-3410-2114");
        drug03.setDsLat(37.4881);
        drug03.setDsLot(127.0855);
        drug03.setDsOpTm("08:00");
        drug03.setDsEndTm("17:00");
        drug03.setDsWkndOpenYn("N");
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("약국 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 약국 등록
        // 3. 등록 확인

        // 1.
        int count = drugMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = drugMapper.doSave(drug01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, drugMapper.getCount());

        log.info("drug01: {}", drug01);
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
        drugMapper.doSave(drug01);

        // 2.
        DrugVO outVO = drugMapper.doSelectOne(drug01);

        // 3.
        assertEquals(drug01.getDsNm(), outVO.getDsNm());
        assertEquals(drug01.getDsAddr(), outVO.getDsAddr());

        log.info("outVO: {}", outVO);
    }

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
        drugMapper.doSave(drug01);
        drugMapper.doSave(drug02);
        drugMapper.doSave(drug03);
        assertEquals(3, drugMapper.getCount());

        // 2.
        DTO searchParam = new DTO();
        searchParam.setPageNo(1);
        searchParam.setPageSize(10);
        searchParam.setSearchDiv("");
        searchParam.setSearchWord("");

        List<DrugVO> list = drugMapper.doRetrieve(searchParam);

        // 3.
        assertNotNull(list);
        assertTrue(list.size() > 0);

        for (DrugVO vo : list) {
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

        log.info("drugMapper: {}", drugMapper);
        assertNotNull(drugMapper);
    }
}
