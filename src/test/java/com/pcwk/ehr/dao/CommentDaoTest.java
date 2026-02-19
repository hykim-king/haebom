package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.comment.CommentMapper;
import com.pcwk.ehr.comment.CommentVO;

@SpringBootTest
class CommentDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired                                                                                                                                                            
    CommentMapper commentMapper;

    CommentVO comment01;
    CommentVO comment02;
    CommentVO comment03;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        commentMapper.deleteAll();

        comment01 = new CommentVO();
        comment01.setCmtCn("좋은 여행지입니다!");
        comment01.setCmtStarng(5);
        comment01.setCmtClsf(1);
        comment01.setTripCourseNo(1);
        comment01.setCmtHideYn("N");
        comment01.setRegNo(1);

        comment02 = new CommentVO();
        comment02.setCmtCn("경치가 아름다워요");
        comment02.setCmtStarng(4);
        comment02.setCmtClsf(1);
        comment02.setTripCourseNo(1);
        comment02.setCmtHideYn("N");
        comment02.setRegNo(1);

        comment03 = new CommentVO();
        comment03.setCmtCn("다음에 또 가고 싶어요");
        comment03.setCmtStarng(3);
        comment03.setCmtClsf(2);
        comment03.setTripCourseNo(2);
        comment03.setCmtHideYn("N");
        comment03.setRegNo(1);
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("댓글 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1. 전체 건수 조회
        // 2. 댓글 등록
        // 3. 등록 확인

        // 1.
        int count = commentMapper.getCount();
        assertEquals(0, count);

        // 2.
        int flag = commentMapper.doSave(comment01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, commentMapper.getCount());

        log.info("comment01: {}", comment01);
    }

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
        commentMapper.doSave(comment01);
        commentMapper.doSave(comment02);
        commentMapper.doSave(comment03);
        assertEquals(3, commentMapper.getCount());

        // 2.
        commentMapper.deleteAll();

        // 3.
        assertEquals(0, commentMapper.getCount());
    }

    @Disabled
    @Test
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("commentMapper: {}", commentMapper);
        assertNotNull(commentMapper);
    }
}
