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

import com.pcwk.ehr.trip.TripMapper;
import com.pcwk.ehr.trip.TripVO;

@SpringBootTest
class TripDaoTest {
	final Logger log = LogManager.getLogger(getClass());
	
	@Autowired
	TripMapper tripMapper;
	
	TripVO tripVO01;
	TripVO tripVO02;
	TripVO tripVO03;
	
	
	
	@BeforeEach
	void setUp() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│  setup()                 │");
		log.info("└──────────────────────────┘");		
		
		tripVO01 = new TripVO(1, "정서진", "no_img.png", "인천광역시 서구 아라뱃길 인근", 126.591, 37.552, "자연", 5, 28, 1, 2);
		tripVO02 = new TripVO(2, "정동진", "no_img.png", "강원도 강릉시 강동면", 129.034, 37.689, "바다", 5, 32, 3, 4);
		tripVO03 = new TripVO(3, "경주 대릉원", "no_img.png", "경상북도 경주시 황남동", 129.213, 35.839, "릉", 5, 37, 5, 6);

	}

	@Disabled
	@Test
	@DisplayName("여행지 등록")
	void doSave() {
		log.info("┌──────────────────────────┐");
		log.info("│doSave()                  │");
		log.info("└──────────────────────────┘");
		
		//단건 등록
		//int flag = tripMapper.doSave(tripVO01);
		assertEquals(1, flag);
		
		//단건조회
		TripVO outVO01 = tripMapper.doSelectOne(tripVO01);
		log.info("단건조회 데이터 outVO01:{}",outVO01);
		assertNotNull(outVO01);
	}
	
	//doSelectOne
	//doRetrieve


	
	
	
	
	
	@AfterEach
	void tearDown() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│ tearDown()               │");
		log.info("└──────────────────────────┘");		
	}

	@Test
	//@Disabled
	void beans() {
		log.info("┌──────────────────────────┐");
		log.info("│beans()                   │");
		log.info("└──────────────────────────┘");
		
		log.info("TripMapper:{}",tripMapper);
		assertNotNull(tripMapper);
	}

}
