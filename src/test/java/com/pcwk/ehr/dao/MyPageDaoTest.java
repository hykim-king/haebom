package com.pcwk.ehr.dao;


import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.mypage.MyPageMapper;
import com.pcwk.ehr.domain.UserVO;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MyPageDaoTest {
    
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    MyPageMapper myPageMapper;

    UserVO userVO01;

    DTO dto;


    @BeforeEach
	void setUp() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│  setup()                 │");
		log.info("└──────────────────────────┘");

        userVO01 = new UserVO(); 
        userVO01.setUserNo(985); 
        userVO01.setUserNick("닉네임"); 
        userVO01.setUserEmlAddr("test@email.com"); 
        userVO01.setUserEnpswd("pw123"); 
        userVO01.setUserNm("홍길동"); 
        userVO01.setUserBrdt(20260304); 
        userVO01.setUserTelno("010-1234-5678"); 
        userVO01.setUserGndr("M");

	}
    
    @AfterEach
	void tearDown() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│ tearDown()               │");
		log.info("└──────────────────────────┘");
	}

    @Test
    @DisplayName("테스트 유저 저장")
    void doSave(){
        // 1. 기존 데이터 삭제 (혹시 남아있을지 모를 985번 유저 정리)
        myPageMapper.doDelete(userVO01);

        // 2. 저장 (USER_NO: 985)
        int flag = myPageMapper.doSave(userVO01);
        assertEquals(1, flag, "데이터 저장에 실패했습니다."); // 성공 시 1건 리턴

        // 3. 저장된 데이터 단건 조회
        UserVO savedUser = myPageMapper.doSelectOne(userVO01);
        
        // 4. 데이터 비교 (검증)
        assertNotNull(savedUser, "저장된 사용자를 찾을 수 없습니다.");
        assertEquals(userVO01.getUserNick(), savedUser.getUserNick(), "닉네임이 일치하지 않습니다.");
        assertEquals(userVO01.getUserNm(), savedUser.getUserNm(), "이름이 일치하지 않습니다.");

        log.info("테스트 성공: " + savedUser.getUserNick() + "님이 정상 저장되었습니다.");

    }

    @Test
    @DisplayName("닉네임 수정")
    void doUpdateNick(){

        myPageMapper.doDelete(userVO01);
        myPageMapper.doSave(userVO01);

        String updateNick = "됐나";
        userVO01.setUserNick(updateNick);

        // 수정 실행
        int flag = myPageMapper.doUpdateNick(userVO01);
        assertEquals(1, flag, "닉네임 수정에 실패했습니다.");

        // 검증을 위한 재조회
        UserVO userVO = myPageMapper.doSelectOne(userVO01);

        // 비교 (수정한 닉네임이 DB에서 가져온 닉네임과 같은지 확인)
        assertNotNull(userVO, "수정 후 사용자를 조회할 수 없습니다.");
        assertEquals(updateNick, userVO.getUserNick(), "DB의 닉네임이 수정된 값과 일치하지 않습니다.");
        
        log.info("┌───────────────────────────────────────────────┐");
        log.info("│ [테스트 결과]                                   ");
        log.info("│ 기존 닉네임: 테스터닉                           ");
        log.info("│ 변경된 닉네임: {}                               ", userVO.getUserNick());
        log.info("└───────────────────────────────────────────────┘");

    }

    @Test
    @DisplayName("주소 수정")
    void doUpdateAddr() {
        // 1. 테스트 환경 설정 (985번 유저 초기화 및 생성)
        myPageMapper.doDelete(userVO01);
        myPageMapper.doSave(userVO01);
        log.info("Step 1. 초기 데이터 생성 완료");

        // 2. 수정할 주소 데이터 설정
        String updateZip = "12345";
        String updateAddr = "경기도 성남시 분당구";
        String updateDaddr = "판교역로 123";
        
        userVO01.setUserZip(updateZip);
        userVO01.setUserAddr(updateAddr);
        userVO01.setUserDaddr(updateDaddr);

        // 3. 수정 실행
        int flag = myPageMapper.doUpdateAddr(userVO01);
        assertEquals(1, flag, "주소 수정에 실패했습니다.");
        log.info("Step 2. 주소 수정 쿼리 실행 성공");

        // 4. 검증을 위한 재조회
        UserVO vsUser = myPageMapper.doSelectOne(userVO01);

        // 5. 결과 비교 및 로그 출력
        assertNotNull(vsUser, "수정 후 사용자를 조회할 수 없습니다.");
        assertEquals(updateZip, vsUser.getUserZip(), "우편번호가 일치하지 않습니다.");
        assertEquals(updateAddr, vsUser.getUserAddr(), "주소가 일치하지 않습니다.");
        assertEquals(updateDaddr, vsUser.getUserDaddr(), "상세주소가 일치하지 않습니다.");
        
        log.info("┌──────────────────────────────────────────────────────────┐");
        log.info("│ [주소 수정 테스트 결과]                                     ");
        log.info("│ 변경된 우편번호: {}                                         ", vsUser.getUserZip());
        log.info("│ 변경된 주소: {}                                            ", vsUser.getUserAddr());
        log.info("│ 변경된 상세주소: {}                                         ", vsUser.getUserDaddr());
        log.info("└──────────────────────────────────────────────────────────┘");
    }

    @Test
    @DisplayName("비밀번호 수정")
    void doUpdatePw() {
        // 1. 테스트 환경 설정 (985번 유저 초기화 및 생성)
        myPageMapper.doDelete(userVO01);
        myPageMapper.doSave(userVO01);
        log.info("Step 1. 초기 데이터 생성 완료 (기본 비번: {})", userVO01.getUserEnpswd());

        // 2. 수정할 비밀번호 설정
        String updatePw = "modipw123"; // 새로운 비밀번호
        userVO01.setUserEnpswd(updatePw);

        // 3. 수정 실행
        int flag = myPageMapper.doUpdatePw(userVO01);
        assertEquals(1, flag, "비밀번호 수정에 실패했습니다.");
        log.info("Step 2. 비밀번호 수정 쿼리 실행 성공");

        // 4. 검증을 위한 재조회
        UserVO userVO = myPageMapper.doSelectOne(userVO01);

        // 5. 결과 비교 및 로그 출력
        assertNotNull(userVO, "수정 후 사용자를 조회할 수 없습니다.");
        assertEquals(updatePw, userVO.getUserEnpswd(), "비밀번호가 일치하지 않습니다.");
        
        log.info("┌──────────────────────────────────────────────────────────┐");
        log.info("│ [비밀번호 수정 테스트 결과]                                 ");
        log.info("│ 변경 전 비번: pw1234                                       ");
        log.info("│ 변경 후 비번: {}                                          ", userVO.getUserEnpswd());
        log.info("└──────────────────────────────────────────────────────────┘");
    }


    @Test
	@Disabled
	void beans() {
		log.info("┌──────────────────────────┐");
		log.info("│beans()                   │");
		log.info("└──────────────────────────┘");

		log.info("MyPageMapper:{}", myPageMapper);
		assertNotNull(myPageMapper);
	}

}
