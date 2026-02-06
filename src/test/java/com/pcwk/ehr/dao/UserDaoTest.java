package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.user.UserVO;
import com.pcwk.ehr.user.UserMapper;

@SpringBootTest
class UserDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    UserMapper mapper;

    UserVO user01;
    UserVO user02;

    @BeforeEach
void setUp() throws Exception {
    log.info("┌──────────────────────────┐");
    log.info("│──setup───────────────────│");
    log.info("└──────────────────────────┘");

    // 제약 조건 준수 사항:
    // 1. userId: 시퀀스가 들어갈 자리이므로 0 입력 (Long이 아닌 int 타입 확인)
    // 2. userBirth: NUMBER(8)이므로 8자리 숫자 (예: 19950101)
    // 3. userSex: CHAR(1)이므로 "M" 또는 "F"
    // 4. userRole: NUMBER(1)이므로 1 또는 0
    // 5. Nullable: No인 컬럼들은 절대 null이 들어가면 안 됨
    
    user01 = new UserVO(0, "test01@naver.com", "1234", "테스터01", 19950101, 
                          "010-1111-1111", "default.png", "#tag1", "M", 1, 
                          null, null, null, null);
    
    user02 = new UserVO(0, "test02@naver.com", "5678", "테스터02", 19981225, 
                          "010-2222-2222", "user.png", "#tag2", "F", 1, 
                          null, null, null, null);

    // DB 데이터 초기화
    mapper.deleteAll();
}

    //@Disabled
    @Test
    @DisplayName("사용자 등록 테스트")
    void doSave() {
        log.info("│doSave() 테스트 시작");
        
        // 1. 등록 실행
        int flag = mapper.doSave(user01);
        assertEquals(1, flag, "등록 실패");
        
        // 2. 등록 건수 확인
        int count = mapper.getCount();
        assertEquals(1, count);
        
        log.info("│등록된 사용자 ID: " + user01.getUserId());
    }

    @Disabled
    @Test
    @DisplayName("단건 조회 테스트")
    void doSelectOne() {
        log.info("│doSelectOne() 테스트 시작");
        
        // 1. 사전 등록
        mapper.doSave(user01);
        
        // 2. 조회
        UserVO outVO = mapper.doSelectOne(user01);
        
        // 3. 비교
        assertNotNull(outVO);
        isSameUser(user01, outVO);
    }

    @Disabled
    @Test
    @DisplayName("사용자 정보 수정 테스트")
    void doUpdate() {
        log.info("│doUpdate() 테스트 시작");
        
        // 1. 등록 및 조회
        mapper.doSave(user01);
        UserVO registeredVO = mapper.doSelectOne(user01);
        
        // 2. 데이터 수정
        String updatedName = "수정된이름";
        String updatedTel = "010-9999-9999";
        registeredVO.setUserName(updatedName);
        registeredVO.setUserTel(updatedTel);
        
        // 3. Update 수행
        int flag = mapper.doUpdate(registeredVO);
        assertEquals(1, flag);
        
        // 4. 결과 검증
        UserVO resultVO = mapper.doSelectOne(registeredVO);
        assertEquals(updatedName, resultVO.getUserName());
        assertEquals(updatedTel, resultVO.getUserTel());
    }

    @Disabled
    @Test
    @DisplayName("사용자 삭제 테스트")
    void doDelete() {
        log.info("│doDelete() 테스트 시작");
        
        // 1. 데이터 2건 등록
        mapper.doSave(user01);
        mapper.doSave(user02);
        assertEquals(2, mapper.getCount());
        
        // 2. 1건 삭제 (user01)
        int flag = mapper.doDelete(user01);
        assertEquals(1, flag);
        
        // 3. 남은 건수 확인
        assertEquals(1, mapper.getCount());
    }

    /** 데이터 비교를 위한 보조 메서드 */
    private void isSameUser(UserVO org, UserVO out) {
        assertEquals(org.getEmail(), out.getEmail());
        assertEquals(org.getUserName(), out.getUserName());
        assertEquals(org.getUserTel(), out.getUserTel());
        assertEquals(org.getUserSex(), out.getUserSex());
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}
