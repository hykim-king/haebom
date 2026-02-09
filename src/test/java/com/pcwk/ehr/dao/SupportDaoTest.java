package com.pcwk.ehr.dao;

import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.support.SupportVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class SupportDaoTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    SupportMapper supportMapper;

    SupportVO support01;
    @Autowired
    private NoticeMapper noticeMapper;

    @BeforeEach
    void setUp() {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }

    @Test
    @DisplayName("등록 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");

        // 기존 데이터 삭제
        supportMapper.deleteAll();

        support01 = new SupportVO();
        support01.setSupId(5); // ID 직접 설정
        support01.setSupContent("테스트 내용입니다.");
        support01.setSupAnswer("답변 완료 되었습니다");
        support01.setSupAnswerReg(LocalDateTime.now());
        support01.setRegDt(LocalDateTime.now());
        support01.setRegId(5);

        // 1.
        int count = supportMapper.getCount();
        assertEquals(0, count);
        log.info("등록 전 전체 건수: {}", count);

        // 2.
        int flag = supportMapper.doSave(support01);
        assertEquals(1, flag);

        // 3.
        assertEquals(1, supportMapper.getCount());
        log.info("등록 후 전체 건수: {}", supportMapper.getCount());
    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        for (int i = 1; i <= 10; i++) {
            SupportVO vo = new SupportVO();
            vo.setSupContent("문의 내용 " + i);
            vo.setSupAnswer("답변 내용 " + i);
            vo.setRegId(5); // 부모 키 제약조건 준수

            supportMapper.doSave(vo);
        }

        int count = supportMapper.getCount();
        log.info("생성된 데이터 건수: {}", count);
        assertEquals(10, count);

        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);

        int flag = supportMapper.doDelete(outVO);
        assertEquals(1, flag);
        log.info("삭제 된 건수: {}", flag);

        assertEquals(9, supportMapper.getCount());
        log.info("삭제 후 전체 건수: {}", supportMapper.getCount());
    }

    @Test
    @DisplayName("조회 확인")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectone()            │");
        log.info("└──────────────────────────┘");

        // 데이터 초기화
        supportMapper.deleteAll();
        int count = supportMapper.getCount();
        log.info("등록 전 전체 건수: {}", count);
        assertEquals(0, count);

        // 데이터 등록
        SupportVO outVo = new SupportVO();
        outVo.setSupContent("테스트 내용입니다.");
        outVo.setSupAnswer("답변 완료 되었습니다");
        outVo.setSupAnswerReg(LocalDateTime.now());
        outVo.setRegDt(LocalDateTime.now());
        outVo.setRegId(5);

        // 데이터 저장
        int flag = supportMapper.doSave(outVo);
        assertEquals(1, flag);
        log.info("저장 결과: {}", flag);

        // 데이터 조회
        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);
        log.info("조회 결과: {}", outVO);

        // 결과
        assertNotNull(outVO, "결과");
        assertEquals(outVo.getSupContent(), outVO.getSupContent());
        assertEquals(outVo.getSupAnswer(), outVO.getSupAnswer());
        assertNotNull(outVo.getSupAnswerReg());
        assertNotNull(outVO.getRegDt());
        assertEquals(outVO.getRegId(), outVO.getRegId());

    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        // 일단 전체 지우고 하나 저장
        supportMapper.deleteAll();

        // 테스트 데이터 생성
        SupportVO vo = new SupportVO();
        vo.setSupContent("수정 전 내용");
        vo.setSupAnswer("수정 전 답변");
        vo.setRegId(5);

        // 일단 저장
        supportMapper.doSave(vo);
        log.info("저장 결과: {}", vo);

        // 데이터 가져옴
        List<SupportVO> list = supportMapper.getAll();
        SupportVO outVO = list.get(0);
        log.info("조회 결과: {}", outVO);

        // 수정
        String updatedContent = "수정된 내용입니다!";
        String updatedAnswer = "수정된 답변입니다!";
        outVO.setSupContent(updatedContent);
        outVO.setSupAnswer(updatedAnswer);
        log.info("수정 전 데이터: {}", outVO);

        // 수정 실행
        int updateFlag = supportMapper.doUpdate(outVO);
        assertEquals(1, updateFlag);
        log.info("수정 결과: {}", updateFlag);

        // 결과 확인
        SupportVO resultVO = supportMapper.doSelectOne(outVO);
        assertNotNull(resultVO, "수정된 데이터 조회 실패");
        assertEquals(updatedContent, resultVO.getSupContent(), "내용 수정 확인");
        assertEquals(updatedAnswer, resultVO.getSupAnswer(), "답변 수정 확인");
        assertEquals(outVO.getRegId(), resultVO.getRegId(), "작성자 ID 확인");
        log.info("수정 후 데이터: {}", resultVO);
    }

    @Test
    @DisplayName("검색 확인")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        // 기존 데이터 삭제
        supportMapper.deleteAll();

        // 테스트 데이터 10건 생성
        Map<String, Integer> param = new HashMap<>();
        param.put("regId", 5);
        param.put("saveSupportDataCount", 30);

        int flag = supportMapper.saveAll(param);
        assertEquals(30, flag);


        // 페이징 조회
        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        searchVO.setSearchDiv("10");
        searchVO.setSearchWord("문의 제목");

        // 실행
        List<SupportVO> list = supportMapper.doRetrieve(searchVO);

        // 결과 확인
        for (SupportVO vo : list) {
            log.info(vo);
        }

        assertEquals(10, list.size());

        log.info("전체 건수 : {}", list.get(0).toString());


    }
}