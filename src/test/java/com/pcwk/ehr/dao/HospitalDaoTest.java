package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.hospital.HospitalMapper;
import com.pcwk.ehr.hospital.HospitalVO;

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
        hospital01.setHpId(1L);
        hospital01.setHpName("서울대학교병원");
        hospital01.setHpAdd("서울특별시 종로구 대학로 101");
        hospital01.setHpEms("Y");
        hospital01.setHpTel1("02-2072-2114");
        hospital01.setHpTel2("02-2072-0000");
        hospital01.setHpMapx(126.9990);
        hospital01.setHpMapy(37.5796);
        hospital01.setHpOpen("09:00");
        hospital01.setHpClose("18:00");
        hospital01.setHpHoliday("N");

        hospital02 = new HospitalVO();
        hospital02.setHpId(2L);
        hospital02.setHpName("세브란스병원");
        hospital02.setHpAdd("서울특별시 서대문구 연세로 50-1");
        hospital02.setHpEms("Y");
        hospital02.setHpTel1("02-2228-0114");
        hospital02.setHpTel2(null);
        hospital02.setHpMapx(126.9407);
        hospital02.setHpMapy(37.5622);
        hospital02.setHpOpen("08:30");
        hospital02.setHpClose("17:30");
        hospital02.setHpHoliday("N");

        hospital03 = new HospitalVO();
        hospital03.setHpId(3L);
        hospital03.setHpName("삼성서울병원");
        hospital03.setHpAdd("서울특별시 강남구 일원로 81");
        hospital03.setHpEms("Y");
        hospital03.setHpTel1("02-3410-2114");
        hospital03.setHpTel2(null);
        hospital03.setHpMapx(127.0855);
        hospital03.setHpMapy(37.4881);
        hospital03.setHpOpen("08:00");
        hospital03.setHpClose("17:00");
        hospital03.setHpHoliday("N");
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
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("hospitalMapper: {}", hospitalMapper);
        assertNotNull(hospitalMapper);
    }
}
