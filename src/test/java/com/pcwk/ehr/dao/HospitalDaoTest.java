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
import com.pcwk.ehr.domain.HospitalVO;
import com.pcwk.ehr.hospital.HospitalMapper;

@SpringBootTest
class HospitalDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    HospitalMapper hospitalMapper;

    HospitalVO hospital01;
    HospitalVO hospital02;
    HospitalVO hospital03;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        hospitalMapper.deleteAll();

        hospital01 = new HospitalVO();
        hospital01.setHpNo(1);
        hospital01.setHpNm("서울대학교병원");
        hospital01.setHpAddr("서울특별시 종로구 대학로 101");
        hospital01.setHpEmrmYn("Y");
        hospital01.setHpTelno1("02-2072-2114");
        hospital01.setHpTelno2("02-2072-0000");
        hospital01.setHpLat(37.5796);
        hospital01.setHpLot(126.9990);
        hospital01.setHpOpTm("09:00");
        hospital01.setHpEndTm("18:00");
        hospital01.setHpWkndOpenYn("N");

        hospital02 = new HospitalVO();
        hospital02.setHpNo(2);
        hospital02.setHpNm("세브란스병원");
        hospital02.setHpAddr("서울특별시 서대문구 연세로 50-1");
        hospital02.setHpEmrmYn("Y");
        hospital02.setHpTelno1("02-2228-0114");
        hospital02.setHpTelno2(null);
        hospital02.setHpLat(37.5622);
        hospital02.setHpLot(126.9407);
        hospital02.setHpOpTm("08:30");
        hospital02.setHpEndTm("17:30");
        hospital02.setHpWkndOpenYn("N");

        hospital03 = new HospitalVO();
        hospital03.setHpNo(3);
        hospital03.setHpNm("삼성서울병원");
        hospital03.setHpAddr("서울특별시 강남구 일원로 81");
        hospital03.setHpEmrmYn("Y");
        hospital03.setHpTelno1("02-3410-2114");
        hospital03.setHpTelno2(null);
        hospital03.setHpLat(37.4881);
        hospital03.setHpLot(127.0855);
        hospital03.setHpOpTm("08:00");
        hospital03.setHpEndTm("17:00");
        hospital03.setHpWkndOpenYn("N");
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("병원 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 병원 등록
        // 3. 등록 확인

        // 1.
        int count = hospitalMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = hospitalMapper.doSave(hospital01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, hospitalMapper.getCount());

        log.info("hospital01: {}", hospital01);
    }

    @Test
    @DisplayName("전체 삭제")
    void deleteAll() {
        log.info("┌──────────────────────────┐");
        log.info("│deleteAll()               │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 등록
        // 2. 전체 삭제
        // 3. 건수 확인

        // 1.
        hospitalMapper.doSave(hospital01);
        hospitalMapper.doSave(hospital02);
        hospitalMapper.doSave(hospital03);
        assertEquals(3, hospitalMapper.getCount());

        // 2.
        hospitalMapper.deleteAll();

        // 3.
        assertEquals(0, hospitalMapper.getCount());
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
        hospitalMapper.doSave(hospital01);

        // 2.
        HospitalVO outVO = hospitalMapper.doSelectOne(hospital01);

        // 3.
        assertEquals(hospital01.getHpNm(), outVO.getHpNm());
        assertEquals(hospital01.getHpAddr(), outVO.getHpAddr());

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
        hospitalMapper.doSave(hospital01);
        hospitalMapper.doSave(hospital02);
        hospitalMapper.doSave(hospital03);
        assertEquals(3, hospitalMapper.getCount());

        // 2.
        DTO searchParam = new DTO();
        searchParam.setPageNo(1);
        searchParam.setPageSize(10);
        searchParam.setSearchDiv("");
        searchParam.setSearchWord("");

        List<HospitalVO> list = hospitalMapper.doRetrieve(searchParam);

        // 3.
        assertNotNull(list);
        assertTrue(list.size() > 0);

        for (HospitalVO vo : list) {
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

        log.info("hospitalMapper: {}", hospitalMapper);
        assertNotNull(hospitalMapper);
    }
}
