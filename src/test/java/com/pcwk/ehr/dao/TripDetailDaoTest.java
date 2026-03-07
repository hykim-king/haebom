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

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.trip.TripDetailMapper;
import com.pcwk.ehr.domain.TripDetailVO;
import com.pcwk.ehr.domain.TripVO;

import com.pcwk.ehr.trip.TripMapper;


@SpringBootTest
class TripDetailDaoTest {
	final Logger log = LogManager.getLogger(getClass());

	@Autowired
	TripDetailMapper tripDetailMapper;

	@Autowired
	TripMapper tripMapper;

	TripDetailVO tripDetailVO01;	
	TripVO tripVO01;

	DTO dto;

	@BeforeEach
	void setUp() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│  setup()                 │");
		log.info("└──────────────────────────┘");

		// 1번 데이터: 관광지(12), 이름에 '정서진' 포함
		tripVO01 = new TripVO();

		tripDetailVO01 = new TripDetailVO(1,"상세정보","휴뮤일","주차","운영 시간","전화번호","유모차","동물","요금","홈페이지","20240522",null);
		
		
	
	}

	//@Disabled
	@Test
	@DisplayName("여행지 상세 단건 조회")
	void doSelectOne() {
		log.info("┌──────────────────────────┐");
		log.info("│doSelectOne               │");
		log.info("└──────────────────────────┘");
		// 단건 삭제
		//tripDetailMapper.doDelete(tripDetailVO01);
		//tripMapper.doDelete(tripVO01);

		// 여행지 단건 등록
		//int h = tripMapper.doSave(tripVO01);
		//log.info("등록 여행지 데이터"+h);
		// 여행지 상세정보 단건 등록
		//int flag = tripDetailMapper.doSave(tripDetailVO01);

		//assertEquals(1, flag);
		//log.info("flag:" + flag);

		// 단건조회
		TripDetailVO inputVO = new TripDetailVO();
		inputVO.setTripContsId(1610521);
		TripDetailVO outVO01 = tripDetailMapper.doSelectOne(inputVO);

		log.info("단건조회 데이터 outVO01:{}", outVO01);
		assertNotNull(outVO01);
	}

	@AfterEach
	void tearDown() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│ tearDown()               │");
		log.info("└──────────────────────────┘");
	}

	@Test
	// @Disabled
	void beans() {
		log.info("┌──────────────────────────┐");
		log.info("│beans()                   │");
		log.info("└──────────────────────────┘");

		log.info("TripDetailMapper:{}", tripDetailMapper);
		assertNotNull(tripDetailMapper);
	}
}