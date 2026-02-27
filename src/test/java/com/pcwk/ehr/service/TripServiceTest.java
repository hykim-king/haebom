package com.pcwk.ehr.service;

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
import com.pcwk.ehr.trip.TripMapper;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.trip.TripService;



@SpringBootTest
class TripServiceTest {
	final Logger log = LogManager.getLogger(getClass());

	
	@Autowired
	TripMapper  tripMapper;
	
	@Autowired
	TripService tripService;
	
	
	DTO     dto;
	@BeforeEach
	void setUp() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│──setup───────────────────│");
		log.info("└──────────────────────────┘");		
		
		dto=new DTO();		
	}

	@AfterEach
	void tearDown() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│─tearDown─────────────────│");
		log.info("└──────────────────────────┘");			
	}

	@DisplayName("단건 조회 & 조회수")
	@Test
	void doSelectOneUp() {
		log.info("┌──────────────────────────┐");
		log.info("│─doSelectOneUp()          │");
		log.info("└──────────────────────────┘");
		
        TripVO inputVO = new TripVO();
		inputVO.setTripContsId(1610521); // 조회하고 싶은 ID를 객체에 담음
		// 단건조회,조회전 횟수
		TripVO outVO01 = tripMapper.doSelectOne(inputVO);
		log.info("outVO01: {}",outVO01);
		log.info("조회 전 횟수 :"+outVO01.getTripInqCnt());
		//read_cnt==0
		//assertEquals(0, outVO01.getTripInqCnt());
		
		// 조회 후 횟수
		TripVO outVOReadCnt =tripService.upDoSelectOne(inputVO);
		log.info("outVOReadCnt: {}",outVOReadCnt);
		log.info("조회 후 횟수 :"+ outVOReadCnt.getTripInqCnt());
	}
	
	@Disabled
	@Test
	void beans() {
		log.info("┌──────────────────────────┐");
		log.info("│─beans()                  │");
		log.info("└──────────────────────────┘");
		
		log.info("tripMapper: {}",tripMapper);
		log.info("tripService: {}",tripService);
		
		assertNotNull(tripMapper);
		assertNotNull(tripService);
		
	}

}
