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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pcwk.ehr.user.UserVO;
import com.pcwk.ehr.user.UserMapper;

@SpringBootTest
class UserDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    UserMapper mapper;

    @Autowired
    PasswordEncoder passwordEncoder;

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
    
    // raw data: 비밀번호
    String password01 = "1234";
    String password02 = "5678";
    
    user01 = new UserVO(0, "test01@naver.com", password01, "테스터01", 19950101, 
                          "010-1111-1111", "default.png", "#tag1", "M", 1, 
                          null, null, null, null);
    
    user02 = new UserVO(0, "test02@naver.com", password02, "테스터02", 19981225, 
                          "010-2222-2222", "user.png", "#tag2", "F", 1, 
                          null, null, null, null);

    // DB 데이터 초기화
    mapper.deleteAll();
}

    //@Disabled
    @Test
    @DisplayName("사용자 등록 테스트")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");
        
        // 1. 초기 건수 확인
        int count = mapper.getCount();
        assertEquals(0, count);
        
        // 2. raw data: 비밀번호
        String password = user01.getPassword();
        
        // 3. 비밀번호 암호화
        user01.setPassword(passwordEncoder.encode(password));
        
        // 4. 등록 실행
        int flag = mapper.doSave(user01);
        assertEquals(1, flag, "등록 실패");
        
        // 5. 등록 건수 확인
        assertEquals(1, mapper.getCount());
        
        // 6. rowdata 복원
        user01.setPassword(password);
        
        log.info("│등록된 사용자 ID: " + user01.getUserId());
    }


    @Test
    @DisplayName("단건 조회 테스트")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelectOne()             │");
        log.info("└──────────────────────────┘");
        
        // 1. raw data: 비밀번호
        String password = user01.getPassword();
        
        // 2. 비밀번호 암호화 후 등록
        user01.setPassword(passwordEncoder.encode(password));
        mapper.doSave(user01);
        
        // 3. 조회
        UserVO outVO = mapper.doSelectOne(user01);
        
        // 4. rowdata 복원
        user01.setPassword(password);
        
        // 5. 비교
        assertNotNull(outVO);
        log.info("outVO: {}", outVO);
        log.info("user01: {}", user01);
        isSameUser(user01, outVO);
    }

    @Test
    @DisplayName("사용자 정보 수정 테스트")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│doUpdate()                │");
        log.info("└──────────────────────────┘");
        
        // 1. raw data: 비밀번호
        String password = user01.getPassword();
        
        // 2. 비밀번호 암호화 후 등록
        user01.setPassword(passwordEncoder.encode(password));
        mapper.doSave(user01);
        
        // 3. rowdata 복원
        user01.setPassword(password);
        
        // 4. 등록 및 조회
        UserVO registeredVO = mapper.doSelectOne(user01);
        
        // 5. 데이터 수정
        String updatedName = "수정된이름";
        String updatedTel = "010-9999-9999";
        registeredVO.setUserName(updatedName);
        registeredVO.setUserTel(updatedTel);
        
        // 6. Update 수행
        int flag = mapper.doUpdate(registeredVO);
        assertEquals(1, flag);
        
        // 7. 결과 검증
        UserVO resultVO = mapper.doSelectOne(registeredVO);
        assertEquals(updatedName, resultVO.getUserName());
        assertEquals(updatedTel, resultVO.getUserTel());
    }

    @Test 
    @DisplayName("사용자 삭제 테스트")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│doDelete()                │");
        log.info("└──────────────────────────┘");
        
        // 1. raw data: 비밀번호
        String password01 = user01.getPassword();
        String password02 = user02.getPassword();
        
        // 2. 비밀번호 암호화
        user01.setPassword(passwordEncoder.encode(password01));
        user02.setPassword(passwordEncoder.encode(password02));
        
        // 3. 데이터 2건 등록
        mapper.doSave(user01);
        mapper.doSave(user02);
        assertEquals(2, mapper.getCount());
        
        // 4. rowdata 복원
        user01.setPassword(password01);
        
        // 5. 1건 삭제 (user01)
        int flag = mapper.doDelete(user01);
        assertEquals(1, flag);
        
        // 6. 남은 건수 확인
        assertEquals(1, mapper.getCount());
    }

    /** 데이터 비교를 위한 보조 메서드 */
    private void isSameUser(UserVO org, UserVO out) {
        assertEquals(org.getUserId(), out.getUserId());
        assertEquals(org.getEmail(), out.getEmail());
        assertEquals(org.getUserName(), out.getUserName());
        assertEquals(org.getUserTel(), out.getUserTel());
        assertEquals(org.getUserSex(), out.getUserSex());
        assertEquals(org.getUserBirth(), out.getUserBirth());
        
        // 암호화된 비밀번호 검증
        boolean isMatch = passwordEncoder.matches(org.getPassword(), out.getPassword());
        assertTrue(isMatch);
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}
