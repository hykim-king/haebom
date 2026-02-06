package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.area.AreaVO;
import com.pcwk.ehr.area.AreaMapper;

@SpringBootTest
class AreaDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    AreaMapper mapper;

    AreaVO area01;  // 시도 데이터
    AreaVO area02;  // 군구 데이터
    AreaVO area03;  // 추가 테스트용

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│         setUp() - 테스트 초기화              │");
        log.info("└──────────────────────────────────────────────┘");

        // 제약 조건 준수 사항:
        // 1. areaId: 시퀀스가 들어갈 자리이므로 0 입력
        // 2. areaSido: 시도 코드 (1~17)
        // 3. areaSidoName: 시도명 (예: "서울특별시")
        // 4. areaGungu: 군구 코드 (시도만 있으면 0 또는 NULL)
        // 5. areaGunguName: 군구명 (시도만 있으면 NULL)

        log.info("\n[Step 1] 테스트 데이터 생성");
        
        // 시도 데이터: 서울 (시도코드: 1)
        area01 = new AreaVO(0, 1, "서울특별시", 0, null);
        log.info("  - 시도 데이터 생성: {}", area01.getAreaSidoName());
        
        // 군구 데이터: 서울 강남구 (시도: 1, 군구: 101)
        area02 = new AreaVO(0, 1, "서울특별시", 101, "강남구");
        log.info("  - 군구 데이터 생성: {} > {}", area02.getAreaSidoName(), area02.getAreaGunguName());
        
        // 추가 테스트용: 부산 (시도코드: 2)
        area03 = new AreaVO(0, 2, "부산광역시", 0, null);
        log.info("  - 추가 시도 데이터 생성: {}", area03.getAreaSidoName());
        log.info("  ✓ 테스트 데이터 생성 완료");

        log.info("\n[Step 2] 데이터베이스 초기화");
        // DB 데이터 초기화 (이전 테스트 데이터 삭제)
        mapper.deleteAll();
        log.info("  - 기존 데이터 삭제 완료");
        
        int count = mapper.getCount();
        log.info("  - 현재 지역 데이터 건수: {}", count);
        assertEquals(0, count, "초기화 후 데이터 건수는 0이어야 합니다");
        log.info("  ✓ 데이터베이스 초기화 완료\n");
    }

    @Test
    @DisplayName("지역 등록 테스트 - 시도")
    void doSave() {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│         doSave() - 지역 등록 테스트          │");
        log.info("└──────────────────────────────────────────────┘");
        
        // 1단계: 초기 데이터베이스 상태 확인
        log.info("\n[Step 1] 초기 데이터베이스 상태 확인");
        int count = mapper.getCount();
        log.info("  - 초기 지역 데이터 건수: {}", count);
        assertEquals(0, count, "초기 건수는 0이어야 합니다");
        log.info("  ✓ 초기 상태 확인 완료");
        
        // 2단계: 등록할 데이터 정보 확인
        log.info("\n[Step 2] 등록할 데이터 정보");
        log.info("  - 지역 타입: 시도 (군구 코드 미포함)");
        log.info("  - 지역명: {}", area01.getAreaSidoName());
        log.info("  - 시도 코드: {}", area01.getAreaSido());
        
        // 3단계: 데이터베이스에 지역 등록
        log.info("\n[Step 3] 데이터베이스에 지역 등록");
        int flag = mapper.doSave(area01);
        log.info("  - 등록 결과 플래그: {}", flag);
        assertEquals(1, flag, "등록이 실패했습니다");
        log.info("  - 할당된 지역 ID: {}", area01.getAreaId());
        log.info("  ✓ 지역 등록 성공");
        
        // 4단계: 등록된 지역 건수 확인
        log.info("\n[Step 4] 등록 결과 검증");
        int afterCount = mapper.getCount();
        log.info("  - 등록 후 지역 데이터 건수: {}", afterCount);
        assertEquals(1, afterCount, "등록 후 건수는 1이어야 합니다");
        log.info("  ✓ 건수 확인 완료");
        
        // 5단계: 테스트 결과 요약
        log.info("\n[Step 5] 테스트 결과 요약");
        log.info("  - 등록된 지역명: {}", area01.getAreaSidoName());
        log.info("  - 등록된 시도 코드: {}", area01.getAreaSido());
        log.info("  - 등록된 지역 ID: {}", area01.getAreaId());
        
        log.info("\n┌──────────────────────────────────────────────┐");
        log.info("│         ✓ doSave() 테스트 완료              │");
        log.info("└──────────────────────────────────────────────┘\n");
    }

    @Test
    @DisplayName("단건 조회 테스트 - 시도")
    void doSelectOne() {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│       doSelectOne() - 단건 조회 테스트       │");
        log.info("└──────────────────────────────────────────────┘");
        
        // 1단계: 등록할 지역 데이터 정보 확인
        log.info("\n[Step 1] 등록할 지역 데이터 정보");
        log.info("  - 지역명: {}", area01.getAreaSidoName());
        log.info("  - 시도 코드: {}", area01.getAreaSido());
        
        // 2단계: 데이터베이스에 지역 등록
        log.info("\n[Step 2] 데이터베이스에 지역 등록");
        int saveFlag = mapper.doSave(area01);
        log.info("  - 등록 결과: {} (1=성공)", saveFlag);
        assertEquals(1, saveFlag, "지역 등록 실패");
        log.info("  - 할당된 지역 ID: {}", area01.getAreaId());
        log.info("  ✓ 지역 등록 완료");
        
        // 3단계: 데이터베이스에서 지역 조회
        log.info("\n[Step 3] 데이터베이스에서 지역 조회");
        log.info("  - 조회 기준: areaId={}", area01.getAreaId());
        AreaVO outVO = mapper.doSelectOne(area01);
        log.info("  - 조회 결과:");
        log.info("    * areaId: {}", outVO.getAreaId());
        log.info("    * areaSido: {}", outVO.getAreaSido());
        log.info("    * areaSidoName: {}", outVO.getAreaSidoName());
        log.info("    * areaGungu: {}", outVO.getAreaGungu());
        log.info("  ✓ 지역 조회 완료");
        
        // 4단계: 조회 결과 유효성 검증
        log.info("\n[Step 4] 조회 결과 유효성 검증");
        assertNotNull(outVO, "조회된 지역 정보가 null입니다");
        log.info("  ✓ 조회 결과 not null 확인");
        
        // 5단계: 상세 데이터 비교
        log.info("\n[Step 5] 상세 데이터 비교");
        log.info("  - 등록한 데이터 (area01):");
        log.info("    * areaId: {}, areaSido: {}, areaSidoName: {}", 
                 area01.getAreaId(), area01.getAreaSido(), area01.getAreaSidoName());
        log.info("  - 조회한 데이터 (outVO):");
        log.info("    * areaId: {}, areaSido: {}, areaSidoName: {}", 
                 outVO.getAreaId(), outVO.getAreaSido(), outVO.getAreaSidoName());
        
        isSameArea(area01, outVO);
        log.info("  ✓ 모든 필드 값 일치 확인 완료");
        
        log.info("\n┌──────────────────────────────────────────────┐");
        log.info("│      ✓ doSelectOne() 테스트 완료            │");
        log.info("└──────────────────────────────────────────────┘\n");
    }

    @Test
    @DisplayName("지역 정보 수정 테스트")
    void doUpdate() {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│        doUpdate() - 지역 정보 수정 테스트     │");
        log.info("└──────────────────────────────────────────────┘");
        
        // 1단계: 원본 데이터 정보 확인
        log.info("\n[Step 1] 원본 데이터 정보 확인");
        log.info("  - 원본 지역명: {}", area01.getAreaSidoName());
        log.info("  - 원본 시도 코드: {}", area01.getAreaSido());
        
        // 2단계: 데이터베이스에 지역 등록
        log.info("\n[Step 2] 데이터베이스에 지역 등록");
        int saveFlag = mapper.doSave(area01);
        log.info("  - 등록 결과: {} (1=성공)", saveFlag);
        assertEquals(1, saveFlag, "지역 등록 실패");
        log.info("  - 할당된 지역 ID: {}", area01.getAreaId());
        log.info("  ✓ 지역 등록 완료");
        
        // 3단계: 데이터베이스에서 등록된 지역 조회
        log.info("\n[Step 3] 등록된 지역 정보 조회");
        AreaVO registeredVO = mapper.doSelectOne(area01);
        log.info("  - 조회된 지역 정보:");
        log.info("    * areaId: {}", registeredVO.getAreaId());
        log.info("    * areaSidoName: {}", registeredVO.getAreaSidoName());
        log.info("    * areaGungu: {}", registeredVO.getAreaGungu());
        log.info("  ✓ 조회 완료");
        
        // 4단계: 지역 정보 수정
        log.info("\n[Step 4] 지역 정보 수정");
        String updatedSidoName = "수정된지역명";
        int updatedGungu = 101;
        String updatedGunguName = "수정된군구명";
        log.info("  - 수정 전:");
        log.info("    * areaSidoName: {} → {}", registeredVO.getAreaSidoName(), updatedSidoName);
        log.info("    * areaGungu: {} → {}", registeredVO.getAreaGungu(), updatedGungu);
        log.info("    * areaGunguName: null → {}", updatedGunguName);
        registeredVO.setAreaSidoName(updatedSidoName);
        registeredVO.setAreaGungu(updatedGungu);
        registeredVO.setAreaGunguName(updatedGunguName);
        log.info("  ✓ 수정 값 설정 완료");
        
        // 5단계: 데이터베이스 UPDATE 실행
        log.info("\n[Step 5] 데이터베이스 UPDATE 실행");
        int updateFlag = mapper.doUpdate(registeredVO);
        log.info("  - 수정 결과 플래그: {}", updateFlag);
        assertEquals(1, updateFlag, "지역 수정 실패");
        log.info("  ✓ 데이터 수정 완료");
        
        // 6단계: 수정된 결과 검증
        log.info("\n[Step 6] 수정된 결과 검증");
        AreaVO resultVO = mapper.doSelectOne(registeredVO);
        log.info("  - 수정 후 조회된 정보:");
        log.info("    * areaId: {}", resultVO.getAreaId());
        log.info("    * areaSidoName: {}", resultVO.getAreaSidoName());
        log.info("    * areaGungu: {}", resultVO.getAreaGungu());
        log.info("    * areaGunguName: {}", resultVO.getAreaGunguName());
        
        log.info("  - 데이터 검증:");
        assertEquals(updatedSidoName, resultVO.getAreaSidoName(), "지역명 수정 검증 실패");
        log.info("    ✓ 지역명 수정 확인 ({})", resultVO.getAreaSidoName());
        assertEquals(updatedGungu, resultVO.getAreaGungu(), "군구 코드 수정 검증 실패");
        log.info("    ✓ 군구 코드 수정 확인 ({})", resultVO.getAreaGungu());
        assertEquals(updatedGunguName, resultVO.getAreaGunguName(), "군구명 수정 검증 실패");
        log.info("    ✓ 군구명 수정 확인 ({})", resultVO.getAreaGunguName());
        
        log.info("\n┌──────────────────────────────────────────────┐");
        log.info("│       ✓ doUpdate() 테스트 완료              │");
        log.info("└──────────────────────────────────────────────┘\n");
    }

    @Test
    @DisplayName("지역 삭제 테스트")
    void doDelete() {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│        doDelete() - 지역 삭제 테스트          │");
        log.info("└──────────────────────────────────────────────┘");
        
        // 1단계: 등록할 지역 데이터 정보 확인
        log.info("\n[Step 1] 등록할 지역 데이터 정보");
        log.info("  - 지역1: {}", area01.getAreaSidoName());
        log.info("  - 지역2: {}", area02.getAreaGunguName());
        log.info("  - 지역3: {}", area03.getAreaSidoName());
        log.info("  ✓ 데이터 정보 확인 완료");
        
        // 2단계: 3건의 지역 데이터를 데이터베이스에 등록
        log.info("\n[Step 2] 3건의 지역 데이터 등록");
        int save1Flag = mapper.doSave(area01);
        log.info("  - 지역1 등록 결과: {} (1=성공)", save1Flag);
        assertEquals(1, save1Flag, "지역1 등록 실패");
        log.info("    * 할당된 ID: {}", area01.getAreaId());
        
        int save2Flag = mapper.doSave(area02);
        log.info("  - 지역2 등록 결과: {} (1=성공)", save2Flag);
        assertEquals(1, save2Flag, "지역2 등록 실패");
        log.info("    * 할당된 ID: {}", area02.getAreaId());
        
        int save3Flag = mapper.doSave(area03);
        log.info("  - 지역3 등록 결과: {} (1=성공)", save3Flag);
        assertEquals(1, save3Flag, "지역3 등록 실패");
        log.info("    * 할당된 ID: {}", area03.getAreaId());
        
        int countAfterSave = mapper.getCount();
        log.info("  - 등록 후 지역 데이터 총 건수: {}", countAfterSave);
        assertEquals(3, countAfterSave, "등록 후 지역 건수는 3이어야 합니다");
        log.info("  ✓ 3건의 지역 등록 확인 완료");
        
        // 3단계: 지역1 삭제
        log.info("\n[Step 3] 지역1 삭제 실행");
        log.info("  - 삭제 대상: areaId={}, areaSidoName={}", area01.getAreaId(), area01.getAreaSidoName());
        int deleteFlag = mapper.doDelete(area01);
        log.info("  - 삭제 결과 플래그: {}", deleteFlag);
        assertEquals(1, deleteFlag, "지역 삭제 실패");
        log.info("  ✓ 지역1 삭제 완료");
        
        // 4단계: 삭제 후 건수 확인
        log.info("\n[Step 4] 삭제 결과 검증");
        int countAfterDelete = mapper.getCount();
        log.info("  - 삭제 후 지역 데이터 총 건수: {}", countAfterDelete);
        log.info("  - 예상 건수: 2건 (총 3건 - 삭제 1건)");
        assertEquals(2, countAfterDelete, "삭제 후 지역 건수는 2이어야 합니다");
        log.info("  ✓ 삭제 결과 검증 완료");
        
        log.info("\n┌──────────────────────────────────────────────┐");
        log.info("│       ✓ doDelete() 테스트 완료              │");
        log.info("└──────────────────────────────────────────────┘\n");
    }

    /**
     * 데이터 비교를 위한 보조 메서드
     * 
     * Description: 등록한 지역 정보(org)와 조회한 지역 정보(out)가 일치하는지 검증
     * 
     * @param org - 등록한 지역 정보 (원본 데이터)
     * @param out - 조회한 지역 정보 (데이터베이스에서 조회한 데이터)
     */
    private void isSameArea(AreaVO org, AreaVO out) {
        log.info("    지역 정보 필드 검증:");
        
        // 지역 ID 검증
        log.debug("      - areaId: org={}, out={}", org.getAreaId(), out.getAreaId());
        assertEquals(org.getAreaId(), out.getAreaId(), "지역 ID가 일치하지 않습니다");
        log.info("      ✓ areaId 일치");
        
        // 시도 코드 검증
        log.debug("      - areaSido: org={}, out={}", org.getAreaSido(), out.getAreaSido());
        assertEquals(org.getAreaSido(), out.getAreaSido(), "시도 코드가 일치하지 않습니다");
        log.info("      ✓ areaSido 일치");
        
        // 시도명 검증
        log.debug("      - areaSidoName: org={}, out={}", org.getAreaSidoName(), out.getAreaSidoName());
        assertEquals(org.getAreaSidoName(), out.getAreaSidoName(), "시도명이 일치하지 않습니다");
        log.info("      ✓ areaSidoName 일치");
        
        // 군구 코드 검증
        log.debug("      - areaGungu: org={}, out={}", org.getAreaGungu(), out.getAreaGungu());
        assertEquals(org.getAreaGungu(), out.getAreaGungu(), "군구 코드가 일치하지 않습니다");
        log.info("      ✓ areaGungu 일치");
        
        // 군구명 검증
        log.debug("      - areaGunguName: org={}, out={}", org.getAreaGunguName(), out.getAreaGunguName());
        assertEquals(org.getAreaGunguName(), out.getAreaGunguName(), "군구명이 일치하지 않습니다");
        log.info("      ✓ areaGunguName 일치");
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────────────────────────┐");
        log.info("│       tearDown() - 테스트 정리               │");
        log.info("└──────────────────────────────────────────────┘");
        log.info("  ✓ 테스트 정리 완료\n");
    }
}
