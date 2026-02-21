package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserMapper;

@SpringBootTest
class UserDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    UserMapper userMapper;

    UserVO user01;
    UserVO user02;
    UserVO user03;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        userMapper.deleteAll();

        user01 = new UserVO();
        user01.setUserEmlAddr("hong@test.com");
        user01.setUserEnpswd("enc1234");
        user01.setUserNm("홍길동");
        user01.setUserBrdt(19900101);
        user01.setUserTelno("010-1111-1111");
        user01.setUserGndr("M");
        user01.setUserMngrYn("N");
        user01.setUserDelYn("N");

        user02 = new UserVO();
        user02.setUserEmlAddr("kim@test.com");
        user02.setUserEnpswd("enc5678");
        user02.setUserNm("김철수");
        user02.setUserBrdt(19950515);
        user02.setUserTelno("010-2222-2222");
        user02.setUserGndr("M");
        user02.setUserMngrYn("N");
        user02.setUserDelYn("N");

        user03 = new UserVO();
        user03.setUserEmlAddr("lee@test.com");
        user03.setUserEnpswd("enc9999");
        user03.setUserNm("이영희");
        user03.setUserBrdt(19980320);
        user03.setUserTelno("010-3333-3333");
        user03.setUserGndr("F");
        user03.setUserMngrYn("N");
        user03.setUserDelYn("N");
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("사용자 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 사용자 등록
        // 3. 등록 확인

        // 1.
        int count = userMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = userMapper.doSave(user01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, userMapper.getCount());

        log.info("user01: {}", user01);
    }

    @Disabled
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
        userMapper.doSave(user01);
        userMapper.doSave(user02);
        userMapper.doSave(user03);
        assertEquals(3, userMapper.getCount());

        // 2.
        userMapper.deleteAll();

        // 3.
        assertEquals(0, userMapper.getCount());
    }

    @Disabled
    @Test
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("userMapper: {}", userMapper);
        assertNotNull(userMapper);
    }
}
