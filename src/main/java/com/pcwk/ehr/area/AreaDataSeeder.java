package com.pcwk.ehr.area;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * 테스트/초기 데이터용으로 AREA 테이블에 샘플 레코드를 삽입하는 유틸리티
 * 사용법: 스프링 컨텍스트에서 `areaDataSeeder.seedSampleData()` 호출
 */
@Component
public class AreaDataSeeder {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    AreaMapper mapper;

    public void seedSampleData() {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│       AreaDataSeeder: 샘플 데이터 삽입 시작    │");
        log.info("└──────────────────────────────────────────────┘");

        // 샘플 데이터 목록: 시도(시/도)와 군구(군/구)
        // areaId는 매퍼에서 SEQ_AREA.NEXTVAL로 처리되어야 함
        List<AreaVO> samples = Arrays.asList(
            // 서울(시도)
            new AreaVO(0, 1, "서울특별시", 0, null),
            // 서울 강남구(군구)
            new AreaVO(0, 1, "서울특별시", 101, "강남구"),
            // 서울 종로구
            new AreaVO(0, 1, "서울특별시", 102, "종로구"),
            // 부산(시도)
            new AreaVO(0, 2, "부산광역시", 0, null),
            // 부산 해운대구
            new AreaVO(0, 2, "부산광역시", 201, "해운대구"),
            // 대구(시도)
            new AreaVO(0, 3, "대구광역시", 0, null),
            // 인천(시도)
            new AreaVO(0, 4, "인천광역시", 0, null),
            // 경기(시도)
            new AreaVO(0, 5, "경기도", 0, null),
            // 경기 성남시
            new AreaVO(0, 5, "경기도", 501, "성남시")
        );

        int inserted = 0;
        for (AreaVO vo : samples) {
            try {
                int flag = mapper.doSave(vo);
                if (flag == 1) {
                    inserted++;
                    log.info("  ✓ 저장 성공: {} / areaId={}", vo.getAreaSidoName(), vo.getAreaId());
                } else {
                    log.warn("  - 저장 실패 플래그: {} ({} : {})", flag, vo.getAreaSidoName(), vo.getAreaGunguName());
                }
            } catch (Exception e) {
                log.error("  ! 저장 중 예외 발생: {} - {}", vo.getAreaSidoName(), e.getMessage(), e);
            }
        }

        log.info("┌──────────────────────────────────────────────┐");
        log.info("│       AreaDataSeeder: 삽입 완료 (건수={})        │", inserted);
        log.info("└──────────────────────────────────────────────┘");
    }
}
