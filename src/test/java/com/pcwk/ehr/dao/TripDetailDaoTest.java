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
	
		
	
	}

	//@Disabled
	@Test
	@DisplayName("여행지 상세 단건 조회")
	void doSelectOne() {
		log.info("┌──────────────────────────┐");
		log.info("│doSelectOne               │");
		log.info("└──────────────────────────┘");

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