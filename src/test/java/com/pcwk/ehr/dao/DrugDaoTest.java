/**
 * 
 */
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

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.drug.DrugMapper;
import com.pcwk.ehr.drug.DrugVO;

/**
 * <pre>
 * Class Name : DrugServiceTest
 * Description :
 *
 * Modification Information
 * 수정일        수정자     수정내용
 * ----------  --------  ---------------------------
 * 2026. 2. 6.  user   최초 생성
 * </pre>
 *
 * @author user
 * @since 2026. 2. 6.
 */
@SpringBootTest
class DrugDaoTest {
	
	final Logger log = LogManager.getLogger(getClass());

	@Autowired
    DrugMapper drugMapper;

	DrugVO drug01;
	DrugVO drug02;
	DrugVO drug03;

	DTO dto;

	@BeforeEach
	void setUp() throws Exception {
		log.debug("┌───────────────────────┐");
		log.debug("  setUp                  ");
		log.debug("└───────────────────────┘");


		//0. 전체 삭제
		drugMapper.deleteAll();

		drug01 = new DrugVO();
		drug01.setDsId(1L);
		drug01.setDsName("호산나약국");
		drug01.setDsAdd("서울특별시 강남구 언주로 871");
		drug01.setDsTel("02-543-6965");
		drug01.setDsMapx(127.0333541322);
		drug01.setDsMapy(37.5285677155);
		drug01.setDsOpen("09:00");
		drug01.setDsClose("18:00");
		drug01.setDsHoliday("N");

		drug02 = new DrugVO();
		drug02.setDsId(2L);
		drug02.setDsName("호원약국");
		drug02.setDsAdd("서울특별시 강남구 언주로108길 15");
		drug02.setDsTel("02-567-5534");
		drug02.setDsMapx(127.0405004199);
		drug02.setDsMapy(37.5085357287);
		drug02.setDsOpen("09:00");
		drug02.setDsClose("19:00");
		drug02.setDsHoliday("N");

		drug03 = new DrugVO();
		drug03.setDsId(3L);
		drug03.setDsName("화인약국");
		drug03.setDsAdd("서울특별시 강남구 강남대로 372 5층일부");
		drug03.setDsTel("02-2226-2256");
		drug03.setDsMapx(126.9990);
		drug03.setDsMapy(37.5965);
		drug03.setDsOpen("10:00");
		drug03.setDsClose("20:00");
		drug03.setDsHoliday("Y");

	}


	@AfterEach
	void tearDown() throws Exception {
		log.info("┌───────────────────────┐");
		log.info("  tearDown               ");
		log.info("└───────────────────────┘");
	}

	//@Disabled
	@Test
	@DisplayName("약국등록")
	void doSave() {
		log.info("┌───────────────────────┐");
		log.info("  doSave                 ");
		log.info("└───────────────────────┘");

		// 1. 전체 건수 조회
		// 2. 약국 등록
		// 3. 등록 확인

		//1.
		int count = drugMapper.getCount();
		assertEquals(0, count);

		// 2.
		int flag = drugMapper.doSave(drug01);
		assertEquals(1, flag);

		// 3.
		assertEquals(1, drugMapper.getCount());

	
		log.info("drug01:{}", drug01);

	}

	//@Disabled
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
		drugMapper.doSave(drug01);
		drugMapper.doSave(drug02);
		drugMapper.doSave(drug03);
		assertEquals(3, drugMapper.getCount());

		// 2.
		drugMapper.deleteAll();

		// 3.
		assertEquals(0, drugMapper.getCount());
	}

	//@Disabled
	@Test
	@DisplayName("단건조회")
	void doSelectOne() {
		log.info("┌──────────────────────────┐");
        log.info("  doSelectOne()             ");
        log.info("└──────────────────────────┘");

		// 1. 데이터 등록
		int flag = drugMapper.doSave(drug01);
		assertEquals(1, flag);

		// 2. 조회
		DrugVO outVo = drugMapper.doSelectOne(drug01);
		assertNotNull(outVo);
	
}


@Test
@DisplayName("목록 조회")
void doRetrieve() {
	log.info("┌──────────────────────────┐");
    log.info("  doRetrieve()              ");
    log.info("└──────────────────────────┘");

	// 1. 대량 데이터 등록
	int count = drugMapper.saveAll();
	assertEquals(1002, count);

	// 2. 페이징 파라미터 설정 (예: 1페이지, 10개씩)
    Map<String, String> param = new HashMap<>();
	param.put("pageSize", "10");
	param.put("pageNum", "1");
	param.put("searchWord", "테스트");
    
    // 3. 조회 실행
    List<DrugVO> list = drugMapper.doRetrieve(param);
    
	// 4. 검증 및 눈으로 확인
	log.info("조회된 데이터 건수: " + list.size());
	assertEquals(10, list.size());

	log.info("------------------------------------------------------------------");
	log.info(" 순번 |    약국 ID    |      약국 이름      |     전화번호");
	log.info("------------------------------------------------------------------");

		for(int i=0; i<list.size(); i++) {
			DrugVO vo = list.get(i);
			log.info(String.format(" [%2d] | %10d | %-15s | %s", 
					(i + 1), 
					vo.getDsId(), 
					vo.getDsName(), 
					vo.getDsTel()));
		}
	log.info("------------------------------------------------------------------");
			
}

	@Disabled
	@Test
	@DisplayName("객체생성 확인")
	void beans() {
		log.debug("┌───────────────────────┐");
		log.debug("  테스트 종료             ");
		log.debug("└───────────────────────┘");

		log.info("drugMapper: {}", drugMapper);
        assertNotNull(drugMapper);

	}

}
