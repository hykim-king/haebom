package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;





@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    UserEntity user01;
    UserEntity user02;
    UserEntity user03;

    @BeforeEach
    void setUp() {

        user01 = new UserEntity();
        user01.setUserEmlAddr("hong2@test.com");
        user01.setUserEnpswd("enc1234");
        user01.setUserNm("홍길동");
        user01.setUserBrdt(19900101);
        user01.setUserTelno("010-1211-1211");
        user01.setUserGndr("M");
        user01.setUserMngrYn("N");
        user01.setUserDelYn("N");
       

        

        
    }

    @AfterEach
    void tearDown() {
        // @Transactional이면 기본적으로 롤백되지만 명시적으로 정리하려면 아래 사용
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("사용자 등록 - Repository 직접 사용")
    void doSave() {
    // 1. 테스트 시작 전 상태 확인 (0이 아닐 수도 있으니 현재 카운트 보관)
        long beforeCount = userRepository.count();

        // 2. 저장
        UserEntity saved = userRepository.save(user01);
        
        // 3. 검증
        assertNotNull(saved.getUserNo(), "저장 후 ID가 생성되어야 합니다.");
        assertEquals(beforeCount + 1, userRepository.count(), "전체 개수가 1 증가해야 합니다.");
    }
}
