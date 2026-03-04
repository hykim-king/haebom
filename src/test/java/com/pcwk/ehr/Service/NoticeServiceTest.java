package com.pcwk.ehr.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.NoticeVO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.notice.NoticeMapper;
import com.pcwk.ehr.notice.NoticeService;
import com.pcwk.ehr.user.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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

        // 1. 관리자 권한을 가진 유저 정보 설정
        adminUser = new UserVO();
        adminUser.setUserNo(1);
        adminUser.setUserMngrYn("Y"); // [주석] 서비스 로직 내 권한 체크 통과를 위해 'Y' 설정

        // 2. 테스트용 공지사항 객체 초기화
        notice01 = new NoticeVO();
        notice01.setUserVO(adminUser);
        notice01.setNtcTtl("공지사항 제목"); // [수정] 필드명 ntcTtl 사용
        notice01.setNtcCn("공지사항 내용");  // [수정] 필드명 ntcCn 사용
        notice01.setRegNo(adminUser.getUserNo());
        notice01.setModNo(adminUser.getUserNo());

        // [추가] 테스트 시작 전 데이터 정합성을 위해 전체 삭제
        noticeMapper.deleteAll();
    }

    @Test
    @DisplayName("저장 확인")
    void doSave() {
        log.info("┌──────────────────────────┐");
        log.info("│─doSave()                 │");
        log.info("└──────────────────────────┘");

        // [주석] 서비스의 doSave는 제목에 '!!'가 붙으면 '[긴급]'으로 변환하는 로직이 포함되어 있습니다.
        int flag = noticeService.doSave(notice01);
        assertEquals(1, flag);

        // 전체 조회로 방금 저장된 번호 가져오기
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

        // 1. 저장
        noticeService.doSave(notice01);

        // 2. 조회할 번호 획득
        List<NoticeVO> list = noticeMapper.getAll();
        notice01.setNtcNo(list.get(0).getNtcNo());

        // 3. 서비스 단건 조회 실행
        NoticeVO outVO = noticeService.doSelectOne(notice01);

        // 4. 검증
        assertNotNull(outVO);
        assertEquals(notice01.getNtcNo(), outVO.getNtcNo());
    }

    @Test
    @DisplayName("수정 확인")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│─doUpdate()               │");
        log.info("└──────────────────────────┘");

        noticeService.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);

        // 3. 필드 수정
        outVO.setNtcTtl(outVO.getNtcTtl() + "_수정");
        outVO.setNtcCn(outVO.getNtcCn() + "_수정내용");
        outVO.setModNo(1);

        int flag = noticeService.doUpdate(outVO);
        assertEquals(1, flag);

        // 4. 검증
        NoticeVO updateVO = noticeService.doSelectOne(outVO);
        assertNotNull(updateVO);
        assertEquals(outVO.getNtcTtl(), updateVO.getNtcTtl());
    }

    @Test
    @DisplayName("검색 및 페이징 확인")
    void doRetrieve() {
        log.info("┌──────────────────────────┐");
        log.info("│─doRetrieve()             │");
        log.info("└──────────────────────────┘");

        // [수정] Map 대신 반복문으로 10건의 테스트 데이터 직접 생성
        for (int i = 1; i <= 10; i++) {
            NoticeVO vo = new NoticeVO();
            vo.setNtcTtl("공지사항 제목" + i);
            vo.setNtcCn("공지사항 내용" + i);
            vo.setRegNo(1);
            vo.setModNo(1);
            noticeMapper.doSave(vo);
        }

        // [수정] 검색 조건 설정 (NoticeVO가 DTO를 상속받았으므로 페이징 필드 사용 가능)
        NoticeVO searchVO = new NoticeVO();
        searchVO.setPageNo(1);
        searchVO.setPageSize(10);
        searchVO.setSearchWord("공지사항");

        // [주석] Mapper가 아닌 Service의 doRetrieve를 테스트합니다.
        List<NoticeVO> result = noticeService.doRetrieve(searchVO);

        assertNotNull(result);
        log.info("검색 결과 건수: {}건", result.size());

        for (NoticeVO vo : result) {
            log.info("조회된 데이터: {}", vo);
        }
    }

    @Test
    @DisplayName("삭제 확인")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");

        noticeService.doSave(notice01);

        List<NoticeVO> list = noticeMapper.getAll();
        NoticeVO outVO = list.get(0);

        // 서비스 삭제 호출
        int flag = noticeService.doDelete(outVO);

        assertEquals(1, flag);
        // [수정] getCount 호출 시 파라미터가 필요하다면 outVO를 넣어줍니다.
        assertEquals(0, noticeMapper.getCount(outVO));
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│─tearDown()               │");
        log.info("└──────────────────────────┘");
    }
}