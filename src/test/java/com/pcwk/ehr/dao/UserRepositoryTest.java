package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.util.UUID; // ⭐ UUID 임포트 추가

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;

@SpringBootTest
//@Transactional // 데이터를 눈으로 확인하기 위해 주석 처리 유지
class UserRepositoryTest {

    @Autowired
    UserRepository userRepository;

    UserEntity user01;

    @BeforeEach
    void setUp() {
        // ⭐ 실행 시마다 중복되지 않는 고유한 ID 생성 (예: a1b2c3d4)
        String randomId = UUID.randomUUID().toString().substring(0, 8);

        user01 = new UserEntity();
        
        // 1. 이메일 랜덤화: Kim_a1b2c3d4@test.com
        user01.setUserEmlAddr("Kim_" + randomId + "@test.com");
        
        // 2. 닉네임 랜덤화: 길동이_a1b2c3d4
        user01.setUserNick("길동이_" + randomId);
        
        // 3. 전화번호 랜덤화: 010-1111-a1b2 (문자가 포함되어도 된다면 고유하게 설정)
        // 만약 숫자만 들어가야 한다면 System.currentTimeMillis() 등을 조합할 수도 있습니다.
        user01.setUserTelno("010-" + randomId.substring(0, 4) + "-" + randomId.substring(4, 8));
        
        user01.setUserReg(LocalDateTime.now());
        user01.setUserEnpswd("enc1234");
        user01.setUserNm("길동");
        user01.setUserBrdt(19900101);
        user01.setUserGndr("M");
        user01.setUserMngrYn("N");
        user01.setUserDelYn("N");
    }

    @Disabled
    @Test
    @DisplayName("사용자 등록")
    void doSave() {
        long beforeCount = userRepository.count();

        UserEntity saved = userRepository.save(user01);
        
        assertNotNull(saved.getUserNo(), "저장 후 ID가 생성되어야 합니다.");
        assertEquals(beforeCount + 1, userRepository.count(), "전체 개수가 1 증가해야 합니다.");
        
        System.out.println("가입된 이메일: " + saved.getUserEmlAddr());
        System.out.println("가입된 닉네임: " + saved.getUserNick());
    }

    // ... 기존 setUp() 및 doSave() 메서드 아래에 추가 ...

    @Disabled
    @Test
    @DisplayName("사용자 조회")
    void doSelect() {
        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);

        // 2. 단건 조회 (ID로 조회)
        UserEntity foundUser = userRepository.findById(saved.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다."));

        // 3. 검증
        assertEquals(saved.getUserEmlAddr(), foundUser.getUserEmlAddr());
        assertEquals(saved.getUserNick(), foundUser.getUserNick());
    }

    //@Disabled
    @Test
    @DisplayName("사용자 수정")
    void doUpdate() {
        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);
        Integer savedNo = saved.getUserNo();

        // 2. 데이터 수정
        String updatedNick = "수정된닉네임";
        saved.setUserNick(updatedNick);
        userRepository.save(saved); // JPA는 save가 Insert와 Update 역할을 겸합니다.

        // 3. 다시 조회해서 확인
        UserEntity updatedUser = userRepository.findById(savedNo).get();
        assertEquals(updatedNick, updatedUser.getUserNick(), "닉네임이 수정되어야 합니다.");
    }

    @Disabled
    @Test
    @DisplayName("사용자 삭제")
    void doDelete() {
        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);
        Integer savedNo = saved.getUserNo();

        // 2. 삭제
        userRepository.delete(saved);

        // 3. 삭제 확인
        boolean exists = userRepository.existsById(savedNo);
        assertFalse(exists, "삭제된 데이터는 존재하지 않아야 합니다.");
    }

    @AfterEach
    void tearDown() {
        // 데이터를 확인하기 위해 deleteAll() 주석 유지
        // userRepository.deleteAll();
    }
}