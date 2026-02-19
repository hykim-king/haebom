package com.pcwk.ehr.dao;

import com.pcwk.ehr.support.SupportMapper;
import com.pcwk.ehr.support.SupportVO;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
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

        // 1. 기존 데이터 삭제
        supportMapper.deleteAll();
        assertEquals(0, supportMapper.getCount());

        // 2. 대량 등록을 위한 파라미터 설정 (키값 regNo로 통일)
        Map<String, Object> param = new HashMap<>();
        param.put("regNo", 1);                  // XML의 #{regNo}와 매칭
        param.put("saveSupportDataCount", 100); // 생성할 건수

        // 3. 실행 및 결과 검증
        int flag = supportMapper.saveAll(param);
        log.info("saveAll 실행 결과: {}", flag);
        assertEquals(100, flag);

        // 4. 최종 건수 확인
        int totalCount = supportMapper.getCount();
        log.info("DB 저장 건수: {}", totalCount);
        assertEquals(100, totalCount);
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
            vo.setSupCn("문의 내용 " + i);
            vo.setSupAnsCn("답변 내용 " + i);
            vo.setRegNo(1); // 부모 키 제약조건 준수

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
        outVo.setSupCn("테스트 내용입니다.");
        outVo.setSupAnsCn("답변 완료 되었습니다");
        outVo.setSupReg(LocalDateTime.now());
        outVo.setSupAnsReg(LocalDateTime.now());
        outVo.setRegNo(1);
        outVo.setSupYn("N");

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
        assertEquals(outVo.getSupCn(), outVO.getSupCn());
        assertEquals(outVo.getSupAnsCn(), outVO.getSupAnsCn());
        assertNotNull(outVO.getSupAnsReg());
        assertNotNull(outVO.getSupReg());
        assertEquals(outVO.getRegNo(), outVO.getRegNo());

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
        vo.setSupCn("수정 전 내용");
        vo.setSupAnsCn("수정 전 답변");
        vo.setRegNo(1);

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
        outVO.setSupCn(updatedContent);
        outVO.setSupAnsCn(updatedAnswer);
        log.info("수정 전 데이터: {}", outVO);

        // 수정 실행
        int updateFlag = supportMapper.doUpdate(outVO);
        assertEquals(1, updateFlag);
        log.info("수정 결과: {}", updateFlag);

        // 결과 확인
        SupportVO resultVO = supportMapper.doSelectOne(outVO);
        assertNotNull(resultVO, "수정된 데이터 조회 실패");
        assertEquals(updatedContent, resultVO.getSupCn(), "내용 수정 확인");
        assertEquals(updatedAnswer, resultVO.getSupAnsCn(), "답변 수정 확인");
        assertEquals(outVO.getRegNo(), resultVO.getRegNo(), "작성자 ID 확인");
        log.info("수정 후 데이터: {}", resultVO);
    }

    @Test
    @DisplayName("검색 확인")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        supportMapper.deleteAll();

        // 테스트 데이터 30건 생성
        Map<String, Object> param = new HashMap<>(); // Integer보다 Object가 Map 처리 시 안정적입니다.
        param.put("regNo", 1);
        param.put("saveSupportDataCount", 30);

        supportMapper.saveAll(param);

        // 페이징 조회 (1페이지, 10개)
        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        // XML에 검색 조건이 구현되어 있다면 아래 주석 해제하여 테스트
        // searchVO.setSearchWord("문의 내용");

        List<SupportVO> list = supportMapper.doRetrieve(searchVO);

        for (SupportVO vo : list) {
            log.info(vo);
        }

        assertEquals(10, list.size());

        if (!list.isEmpty()) {
            log.info("첫 번째 데이터 정보 : {}", list.get(0).toString());
        }
    }

    @Test
    @Disabled
    @DisplayName("객체생성 확인")
    void beans() {
        log.info("┌──────────────────────────┐");
        log.info("│beans()                   │");
        log.info("└──────────────────────────┘");

        log.info("supportMapper: {}", supportMapper);
        assertNotNull(supportMapper);
    }
}