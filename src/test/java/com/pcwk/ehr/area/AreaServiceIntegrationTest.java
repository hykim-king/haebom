package com.pcwk.ehr.area;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class AreaServiceIntegrationTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    AreaService areaService;

    @Autowired
    AreaMapper areaMapper;

    @Test
    void fetchAndSaveAll_integration() throws Exception {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│ AreaServiceIntegrationTest: 시작               │");
        log.info("└──────────────────────────────────────────────┘");

        // 기존 데이터 초기화
        areaMapper.deleteAll();
        log.info("  - 기존 area 데이터 삭제 완료");

        // 실제 API 호출 및 DB 저장 수행
        areaService.fetchAndSaveAll();
        log.info("  - areaService.fetchAndSaveAll() 호출 완료");

        // 결과 검증: 적어도 1건 이상 저장되었는지 확인
        int count = areaMapper.getCount();
        log.info("  - 저장 후 건수: {}", count);

        assertTrue(count > 0, "API 데이터가 area 테이블에 저장되지 않았습니다.");

        log.info("┌──────────────────────────────────────────────┐");
        log.info("│ AreaServiceIntegrationTest: 완료               │");
        log.info("└──────────────────────────────────────────────┘");
    }
}
