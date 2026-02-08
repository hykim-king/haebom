package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.pcwk.ehr.trip.TripDTO;
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

	TripDTO dto;
	
	
	
@BeforeEach
void setUp() throws Exception {
    log.info("┌──────────────────────────┐");
    log.info("│  setup()                 │");
    log.info("└──────────────────────────┘");       
    
// 1번 데이터: 관광지(12), 이름에 '정서진' 포함
    tripVO01 = new TripVO(1, "정서진 관광지", "img01.png", "인천 서구", 126.5, 37.5, "자연", 12, 28, 1, 0, 10);
    
    // 2번 데이터: 문화시설(14), 주소에 '서울' 포함
    tripVO02 = new TripVO(2, "예술의전당", "img02.png", "서울특별시 서초구", 127.0, 37.4, "예술", 14, 11, 2, 0, 20);
    
    // 3번 데이터: 관광지(12), 이름에 '정서진' 없음
    tripVO03 = new TripVO(3, "해운대", "img03.png", "부산 해운대구", 129.1, 35.1, "바다", 12, 26, 3, 0, 30);

	dto=new TripDTO();

}

	@Disabled
	@Test
	@DisplayName("여행지 등록")
	void doSave() {
		log.info("┌──────────────────────────┐");
		log.info("│doSave()                  │");
		log.info("└──────────────────────────┘");
		//단건 삭제
		tripMapper.doDelete(tripVO01);
		tripMapper.doDelete(tripVO02);
		
		//단건 등록
		int flag = tripMapper.doSave(tripVO01);
		tripMapper.doSave(tripVO02);
		
		assertEquals(1, flag);
		log.info("flag:"+flag);
		
		//단건조회
		TripVO outVO01 = tripMapper.doSelectOne(tripVO01);
		TripVO outVO02 = tripMapper.doSelectOne(tripVO02);
		
		log.info("단건조회 데이터 outVO01:{}",outVO01);
		log.info("단건조회 데이터 outVO01:{}",outVO02);
		assertNotNull(outVO01);
	}
	
	//doRetrieve
	//@Disabled
	@Test
	void doRetrieve(){
		log.info("┌──────────────────────────┐");
		log.info("│doRetrieve()              │");
		log.info("└──────────────────────────┘");

    tripMapper.doDelete(tripVO01);
    tripMapper.doDelete(tripVO02);
    tripMapper.doDelete(tripVO03);

     tripMapper.doSave(tripVO01);
     tripMapper.doSave(tripVO02);
     tripMapper.doSave(tripVO03);
		TripVO searchVO = new TripVO();

   Map<String, String> searchMap = new HashMap<>();
    
    // 2. 파라미터 담기 (Key 이름은 XML의 #{name}과 일치해야 함)
    searchMap.put("pageNo", "1");
    searchMap.put("pageSize", "10");
    searchMap.put("searchDiv", "10"); // 검색구분(이름 or 지역)
    searchMap.put("searchWord", "정서진"); // 검색어
    searchMap.put("tripType", "12");  // 종류

    searchVO.setTripType(12);
    List<TripVO> list = tripMapper.doRetrieve(searchMap);
	log.info("조회 결과 : "+list);
     }
	
	
	
	
	
	
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
