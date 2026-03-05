package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

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

@SpringBootTest
class TripDaoTest {
	final Logger log = LogManager.getLogger(getClass());

	@Autowired
	TripMapper tripMapper;

	TripVO tripVO01;
	TripVO tripVO02;
	TripVO tripVO03;

	DTO dto;

	@BeforeEach
	void setUp() throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│  setup()                 │");
		log.info("└──────────────────────────┘");

		// 1번 데이터: 관광지(12), 이름에 '정서진' 포함
		tripVO01 = new TripVO();

		// 2번 데이터: 문화시설(14), 주소에 '서울' 포함
		tripVO02 = new TripVO();

		// 3번 데이터: 관광지(12), 이름에 '정서진' 없음
		tripVO03 = new TripVO();

	}

	//@Disabled
	@Test
	@DisplayName("여행지  단건 조회")
	void doSelectOne() {
		log.info("┌──────────────────────────┐");
		log.info("│doSelectOne               │");
		log.info("└──────────────────────────┘");
		// 단건 삭제
		//tripMapper.doDelete(tripVO01);
		//tripMapper.doDelete(tripVO02);

		// 단건 등록
		//int flag = tripMapper.doSave(tripVO01);
		//tripMapper.doSave(tripVO02);

		//assertEquals(1, flag);
		//log.info("flag:" + flag);
		TripVO inputVO = new TripVO();
		inputVO.setTripContsId(250427); // 조회하고 싶은 ID를 객체에 담음
		// 단건조회
		TripVO outVO01 = tripMapper.doSelectOne(inputVO);
		

		log.info("단건조회 데이터 outVO01:{}", outVO01);
		
		assertNotNull(outVO01);
	}

	//@Disabled
	@Test
	@DisplayName("여행지 목록 조회")
	void doRetrieve() {
		log.info("┌──────────────────────────┐");
		log.info("│ doRetrieve()             │");
		log.info("└──────────────────────────┘");

		// 1. 기존 데이터 정리 및 등록
		//tripMapper.doDelete(tripVO01);
		//tripMapper.doDelete(tripVO02);
		//tripMapper.doDelete(tripVO03);

		//tripMapper.doSave(tripVO01);
		//tripMapper.doSave(tripVO02);
		//tripMapper.doSave(tripVO03);

		TripVO searchVO = new TripVO();

		searchVO.setPageSize(10);
		searchVO.setPageNo(1);
		searchVO.setSearchWord("몽고정");
		// searchVO.setTripClsf(12); // TripVO의 필드
		log.info("여행지 전체 수"+tripMapper.getCount());
		List<TripVO> list = tripMapper.doRetrieve(searchVO);

		log.info("조회된 목록 개수: {}", list.size());
		assertNotNull(list);
		assertTrue(list.size() >= 1, "최소 1건 이상의 결과가 나와야 합니다.");

		for (TripVO vo : list) {
			log.info("조회된 데이터: {}", vo);
		}
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

		log.info("TripMapper:{}", tripMapper);
		assertNotNull(tripMapper);
	}

}