// package com.pcwk.ehr.dao;

// import static org.junit.jupiter.api.Assertions.*;

// import java.util.List;

// import org.apache.logging.log4j.LogManager;
// import org.apache.logging.log4j.Logger;
// import org.junit.jupiter.api.AfterEach;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Disabled;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;

// import com.pcwk.ehr.cmn.DTO;
// import com.pcwk.ehr.relation.RelationMapper;
// import com.pcwk.ehr.domain.RelationVO;
// import com.pcwk.ehr.user.UserMapper;
// import com.pcwk.ehr.domain.UserVO;
// import com.pcwk.ehr.trip.TripMapper;
// import com.pcwk.ehr.domain.TripVO;

// @SpringBootTest
// class RelationDaoTest {
// 	final Logger log = LogManager.getLogger(getClass());

// 	@Autowired
// 	RelationMapper relationMapper;

//     @Autowired
//     UserMapper userMapper;
    
//     @Autowired
// 	TripMapper tripMapper;

// 	RelationVO relationVO01;
//     UserVO userVO01;

// 	DTO dto;

// 	@BeforeEach
// 	void setUp() throws Exception {
// 		log.info("┌──────────────────────────┐");
// 		log.info("│  setup()                 │");
// 		log.info("└──────────────────────────┘");

		
// 		relationVO01 = new RelationVO(1,0,90,0,1610521);
//         userVO01 = new UserVO();
//         userVO01.setUserNo(90);
//         userVO01.setUserEmlAddr("kim@test.com");
//         userVO01.setUserEnpswd("kim4");
//         userVO01.setUserNm("김김김");
//         userVO01.setUserBrdt(19900101);
//         userVO01.setUserTelno("010-0000-0000");
//         userVO01.setUserGndr("M");
//         userVO01.setUserMngrYn("N");
//         userVO01.setUserDelYn("N");

// 	}

// 	//@Disabled
// 	@Test
// 	@DisplayName("찜하기")
// 	void FavoriteStatus() {
// 		log.info("┌──────────────────────────┐");
// 		log.info("│ FavoriteStatus()         │");
// 		log.info("└──────────────────────────┘");
       
//         userMapper.doSave(userVO01);
       
//         // 1. 초기 세팅: 찜하기 상태(10)로 설정
//         relationVO01.setRelClsf(10); 
        
//         // 2. 업데이트 실행
//         int flag = relationMapper.FavoriteStatus(relationVO01);
//         log.info("업데이트 결과: {}", flag);
        
//         // 3. 검증: 업데이트된 행의 수가 1이어야 함
//         assertEquals(1, flag, "찜하기 업데이트에 실패했습니다.");


// 	}

// 	@Disabled
// 	@Test
// 	@DisplayName("가본 여행지 업데이트")
// 	void VisitedStatus() {
// 		log.info("┌──────────────────────────┐");
// 		log.info("│ VisitedStatus()          │");
// 		log.info("└──────────────────────────┘");
//         // 1. 초기 세팅: 방문 완료 상태(20)로 설정
//         relationVO01.setRelClsf(20);

//         // 2. 업데이트 실행
//         int flag = relationMapper.VisitedStatus(relationVO01);
//         log.info("업데이트 결과: {}", flag);

//         // 3. 검증
//         assertEquals(1, flag, "가본 여행지 업데이트에 실패했습니다.");

// 	}

// 	@AfterEach
// 	void tearDown() throws Exception {
// 		log.info("┌──────────────────────────┐");
// 		log.info("│ tearDown()               │");
// 		log.info("└──────────────────────────┘");
// 	}

// 	@Test
// 	// @Disabled
// 	void beans() {
// 		log.info("┌──────────────────────────┐");
// 		log.info("│beans()                   │");
// 		log.info("└──────────────────────────┘");

// 		log.info("RelationMapper:{}", relationMapper);
// 		assertNotNull(relationMapper);
// 	}

// }
