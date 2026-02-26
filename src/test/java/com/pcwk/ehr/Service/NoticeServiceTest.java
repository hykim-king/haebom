package com.pcwk.ehr.Service;

import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.notice.NoticeService;
import com.pcwk.ehr.user.UserMapper;
import com.pcwk.ehr.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class NoticeServiceTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    NoticeService noticeService;

    @Autowired
    NoticeMapper noticeMapper;

    @Autowired
    UserService userService;

    NoticeVO notice01;
    UserVO adminUser;

    @BeforeEach
    void setUp() {
        log.info("┌──────────────────────────┐");
        log.info("│──setup───────────────────│");
        log.info("└──────────────────────────┘");

        // 1. User 정보 가져오기
        adminUser = new UserVO();
        adminUser.setUserNo(135);
        adminUser.setUserMngrYn("Y");

        log.info(adminUser.getUserNo());

        // 2.
        notice01 = new NoticeVO();
        notice01.setUserVO(adminUser);
        notice01.setNtcTtl("공지사항 제목");
        notice01.setNtcCn("공지사항 내용");
        notice01.setRegNo(adminUser.getUserNo());
        notice01.setModNo(adminUser.getUserNo());

    }

    @Test
    @DisplayName("저장 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSave()                 │");
        log.info("└──────────────────────────┘");

        int flag = noticeService.doSave(notice01);
        assertEquals(1, flag);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO vo = list.get(0);
        notice01.setNtcNo(vo.getNtcNo());

        NoticeVO outVO = noticeService.doSelectOne(notice01);
        assertNotNull(outVO);
        assertEquals(notice01.getNtcNo(), outVO.getNtcNo(), "번호가 일치하지 않습니다.");

    }

    @Test
    @DisplayName("조회 확인")
    void doSelectOne() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSelectOne()            │");
        log.info("└──────────────────────────┘");

        // 0.
        noticeMapper.deleteAll();

        // 1. 저장
        noticeService.doSave(notice01);

        // 2. 조회
        List<NoticeVO> list = noticeMapper.getAll();
        notice01.setNtcNo(list.get(0).getNtcNo());

        NoticeVO outVO = noticeService.doSelectOne(notice01);

        // 3. 검증
        assertNotNull(outVO);
        assertEquals(notice01.getNtcNo(), outVO.getNtcNo(), "번호가 일치하지 않습니다.");

    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();
        noticeService.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        notice01.setNtcNo(list.get(0).getNtcNo());

        // 2. 조회
        NoticeVO outVO = noticeService.doSelectOne(notice01);
        assertNotNull(outVO);

        // 3. 수정
        outVO.setNtcTtl(outVO.getNtcTtl() + "_수정");
        outVO.setNtcCn(outVO.getNtcCn() + "_수정내용");
        outVO.setModNo(135);

        int flag = noticeService.doUpdate(outVO);
        assertEquals(1, flag);

        // 4. 검증
        NoticeVO updateVO = noticeService.doSelectOne(outVO);
        assertNotNull(updateVO);
        assertEquals(outVO.getNtcTtl(), updateVO.getNtcTtl());

    }

    @Test
    @DisplayName("검색 확인")
    void doRetrieve() {

        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        // 1. 기존 데이터 삭제 (실제 DB에 DELETE 쿼리가 날아감)
        noticeMapper.deleteAll();

        // 2. 테스트 데이터 10건 생성 및 즉시 저장 (실제 DB에 INSERT 쿼리가 10번 날아감)
        for (int i = 1; i <= 10; i++) {
            NoticeVO vo = new NoticeVO();
            vo.setNtcNo(i);
            vo.setNtcTtl("공지사항 제목" + i);
            vo.setNtcCn("공지사항 내용" + i);
            vo.setRegNo(135);
            vo.setModNo(135);
            noticeMapper.doSave(vo);
        }

        // 3. 건수 확인 (실제 DB에서 COUNT 쿼리 실행)
        int totalCount = noticeMapper.getCount();
        log.info("저장된 전체 건수: {}", totalCount);

        // 4. 페이징 조회 테스트 (실제 DB에서 SELECT 쿼리 실행)
        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        searchVO.setSearchWord("공지사항");
        log.info("searchVO: {}", searchVO);

        List<NoticeVO> result = noticeMapper.doRetrieve(searchVO);
        assertNotNull(result);

        for (NoticeVO vo : result) {
            log.info("검색 결과: {}", vo);
        }

        log.info("검색 결과 확인 완료: {}건 조회됨", result.size());
    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        noticeMapper.deleteAll();
        noticeMapper.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);

        int flag = noticeMapper.doDelete(outVO);

        assertEquals(1, flag);
        assertEquals(0, noticeMapper.getCount());

        log.info("삭제 확인 완료: {}건 삭제됨", flag);

    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}
