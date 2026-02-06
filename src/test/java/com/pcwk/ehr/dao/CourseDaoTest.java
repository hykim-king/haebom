package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.course.CourseMapper;
import com.pcwk.ehr.course.CourseVO;

@SpringBootTest
class CourseDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    CourseMapper mapper;

    CourseVO course01;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // trip_id는 DB에 존재하는 trip_id 값을 사용해야 FK 제약조건 위반이 발생하지 않습니다.
        course01 = new CourseVO(0, "남산 산책로", "서울의 야경을 즐기는 코스", "namsan.jpg", "3.5km", "1시간 30분", 1);
        
        mapper.deleteAll();
    }

    @Test
    @DisplayName("코스 등록 테스트")
    void doSave() {
        int flag = mapper.doSave(course01);
        assertEquals(1, flag);
        assertEquals(1, mapper.getCount(course01));
    }

    @Test
    @DisplayName("코스 조회 테스트")
    void doSelectOne() {
        mapper.doSave(course01);
        CourseVO outVO = mapper.doSelectOne(course01);
        assertNotNull(outVO);
        assertEquals(course01.getCourseName(), outVO.getCourseName());
    }

    @Test
    @DisplayName("코스 수정 테스트")
    void doUpdate() {
        mapper.doSave(course01);
        CourseVO registeredVO = mapper.doSelectOne(course01);
        
        registeredVO.setCourseName("수정된 산책로");
        mapper.doUpdate(registeredVO);
        
        CourseVO resultVO = mapper.doSelectOne(registeredVO);
        assertEquals("수정된 산책로", resultVO.getCourseName());
    }

    @Test
    @DisplayName("코스 삭제 테스트")
    void doDelete() {
        mapper.doSave(course01);
        assertEquals(1, mapper.getCount(course01));
        
        mapper.doDelete(course01);
        assertEquals(0, mapper.getCount(course01));
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}
