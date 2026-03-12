package com.pcwk.ehr.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.course.CourseMapper;
import com.pcwk.ehr.domain.CourseVO;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@SpringBootTest
public class CourseDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    CourseMapper courseMapper;

    CourseVO course01;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

            course01 = new CourseVO();
            course01.setCourseNo(1);
            course01.setCourseNm("서울 여행코스");
            course01.setCourseInfo("서울의 주요 관광지를 포함한 여행코스입니다.");
            //course01.setCoursePathNm(1);
            course01.setCourseDstnc("10km");
            course01.setCourseReqTm("4시간");
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Disabled
    @Test
    @DisplayName("코스 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        int count = courseMapper.getCount();
        assertEquals(0, count);

        int flag = courseMapper.doSave(course01);
        assertEquals(1, flag);

        assertEquals(1, courseMapper.getCount());
        log.info("course01: {}", course01);
    }

    @Disabled
    @Test
    @DisplayName("단건 조회")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelectOne()             │");
        log.info("└──────────────────────────┘");
    
        // 1. 데이터 등록
         courseMapper.doSave(course01);
        // 2. 단건 조회
        CourseVO outVO = courseMapper.doSelectOne(course01);
        // 3. 조회 결과 확인
        assertEquals(course01.getCourseNm(), outVO.getCourseNm());
        assertEquals(course01.getCourseInfo(), outVO.getCourseInfo());
        log.info("outVO: {}", outVO);
    }

    @Disabled
    @Test
    @DisplayName("목록 조회")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│doRetrieve()              │");
        log.info("└──────────────────────────┘");

        // 1. 기존 데이터 삭제 (테스트 환경 초기화)
        // 주의: 실무 환경에서는 실제 데이터를 지우지 않도록 주의하세요.
        courseMapper.doDelete(course01); 

        // 2. 테스트 데이터 등록 (조회용 데이터 1건 이상 생성)
        courseMapper.doSave(course01);

        // 3. 검색 조건 설정 (DTO 객체 생성)
        // com.pcwk.ehr.cmn.DTO 또는 해당 프로젝트의 목록 전송용 DTO 사용
        com.pcwk.ehr.cmn.DTO searchDTO = new com.pcwk.ehr.cmn.DTO();
        searchDTO.setPageNo(1);      // 첫 번째 페이지
        searchDTO.setPageSize(10);   // 한 페이지에 10개씩
        searchDTO.setSearchDiv("10"); // 검색조건 (10: 코스명)
        searchDTO.setSearchWord("서울"); // 검색어

        // 4. 목록 조회 실행
        java.util.List<CourseVO> list = courseMapper.doRetrieve(searchDTO);

        // 5. 검증
        // 리스트가 비어있지 않은지 확인
        assertNotNull(list, "조회된 리스트는 null일 수 없습니다.");
        
        // 데이터가 최소 1건 이상인지 확인
        assertEquals(5, list.size(), "최소 1건의 데이터가 조회되어야 합니다.");

        // 조회된 데이터 로그 출력
        for (CourseVO vo : list) {
            log.info("조회된 코스: {}", vo);
        }
        
        // 첫 번째 데이터의 이름이 검색어 '서울'을 포함하는지 확인
        assertEquals(true, list.get(0).getCourseNm().contains("서울"));
    }

    @Disabled
    @Test
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("courseMapper: {}", courseMapper);
        assertNotNull(courseMapper);
    }
    
}
