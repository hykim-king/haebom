package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.domain.RelationVO;
import com.pcwk.ehr.relation.RelationMapper;

@SpringBootTest
class RelationDaoTest {
    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    RelationMapper relationMapper;

    RelationVO rel01;
    RelationVO rel02;

    @BeforeEach
    void setUp() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 0. 전체삭제
        relationMapper.deleteAll();

        rel01 = new RelationVO();
        rel01.setRelClsf(10);       // 찜한 여행지
        rel01.setUserNo(10);
        rel01.setCourseNo(null);
        rel01.setTripContsId(1);

        rel02 = new RelationVO();
        rel02.setRelClsf(20);       // 여행 완료한 여행지
        rel02.setUserNo(10);
        rel02.setCourseNo(null);
        rel02.setTripContsId(1);
    }

    @AfterEach
    void tearDown() throws Exception {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("관계 등록")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│doSave()                  │");
        log.info("└──────────────────────────┘");

        // 1.
        //int count = relationMapper.getCount();
        //assertEquals(0, count);

        // 2.
        int flag = relationMapper.doSave(rel01);
        assertEquals(1, flag);

        // 3.
        //assertEquals(1, relationMapper.getCount());

        log.info("rel01: {}", rel01);
    }

    @Test
    @DisplayName("전체 삭제")
    void deleteAll() {
        log.info("┌──────────────────────────┐");
        log.info("│deleteAll()               │");
        log.info("└──────────────────────────┘");

        // 1.
        relationMapper.doSave(rel01);
        relationMapper.doSave(rel02);
        //assertEquals(2, relationMapper.getCount());

        // 2.
        relationMapper.deleteAll();

        // 3.
        //assertEquals(0, relationMapper.getCount());
    }

    @Test
    @DisplayName("단건 조회")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelectOne()             │");
        log.info("└──────────────────────────┘");

        // 1.
        relationMapper.doSave(rel01);

        // 2.
        RelationVO regVO = relationMapper.getAll().get(0);

        // 3.
        RelationVO outVO = relationMapper.doSelectOne(regVO);

        // 4.
        assertNotNull(outVO);
        assertEquals(regVO.getRelNo(), outVO.getRelNo());
        assertEquals(rel01.getRelClsf(), outVO.getRelClsf());
        assertEquals(rel01.getTripContsId(), outVO.getTripContsId());

        log.info("outVO: {}", outVO);
    }

    @Test
    @DisplayName("사용자별 관계 목록 조회")
    void getListByUser() {
        log.info("┌──────────────────────────┐");
        log.info("│getListByUser()           │");
        log.info("└──────────────────────────┘");

        // 1.
        relationMapper.doSave(rel01);
        relationMapper.doSave(rel02);

        // 2. 전체 조회 (분류 조건 없이)
        RelationVO searchVO = new RelationVO();
        searchVO.setUserNo(10);

        List<RelationVO> list = relationMapper.getListByUser(searchVO);

        // 3.
        assertNotNull(list);
        assertEquals(2, list.size());

        for (RelationVO vo : list) {
            log.info("vo: {}", vo);
        }

        // 4. 찜한 여행지만 조회
        searchVO.setRelClsf(10);
        List<RelationVO> wishList = relationMapper.getListByUser(searchVO);
        assertEquals(1, wishList.size());
    }

    @Test
    @DisplayName("관계 수정")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│doUpdate()                │");
        log.info("└──────────────────────────┘");

        // 1.
        relationMapper.doSave(rel01);

        // 2.
        RelationVO regVO = relationMapper.getAll().get(0);
        regVO.setRelClsf(20); // 찜 -> 완료로 변경

        // 3.
        int flag = relationMapper.doUpdate(regVO);
        assertEquals(1, flag);

        // 4.
        RelationVO updateVO = relationMapper.doSelectOne(regVO);
        assertEquals(20, updateVO.getRelClsf());

        log.info("updateVO: {}", updateVO);
    }

    @Test
    @DisplayName("관계 삭제")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│doDelete()                │");
        log.info("└──────────────────────────┘");

        // 1.
        relationMapper.doSave(rel01);
        //assertEquals(1, relationMapper.getCount());

        // 2.
        RelationVO regVO = relationMapper.getAll().get(0);

        // 3.
        int flag = relationMapper.doDelete(regVO);
        assertEquals(1, flag);

        // 4.
        //assertEquals(0, relationMapper.getCount());
    }
}
