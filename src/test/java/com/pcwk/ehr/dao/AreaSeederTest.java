package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.area.AreaDataSeeder;
import com.pcwk.ehr.area.AreaMapper;

@SpringBootTest
public class AreaSeederTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    AreaDataSeeder seeder;

    @Autowired
    AreaMapper mapper;

    @Test
    @DisplayName("샘플 데이터 삽입 테스트 - AreaDataSeeder")
    void seedSampleData() {
        log.info("샘플 데이터 삽입 시작");
        // 기존 데이터 초기화
        mapper.deleteAll();
        // 삽입
        seeder.seedSampleData();
        int count = mapper.getCount();
        log.info("삽입 후 건수: {}", count);
        assertTrue(count > 0, "샘플 데이터가 하나도 삽입되지 않았습니다.");
    }
}
