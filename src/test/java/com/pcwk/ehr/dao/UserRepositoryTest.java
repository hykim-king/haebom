package com.pcwk.ehr.dao;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.pcwk.ehr.cmn.EncryptionUtil;

@SpringBootTest
// @Transactional // 데이터를 눈으로 확인하기 위해 주석 처리 유지
class UserRepositoryTest {

    final Logger log = LogManager.getLogger(getClass());

    @Autowired
    UserRepository userRepository;

    @Autowired
    EncryptionUtil encryptionUtil;

    UserEntity user01;

    final String rawPassword = "mySecretPassword123";
    final String rawTel = "010-1234-5678";

    // DB가 CHAR(8), CHAR(4)로 날짜/시간을 관리하므로 포맷터 준비
    private static final DateTimeFormatter YYYYMMDD = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HHmm");

    @BeforeEach
    void setUp() {
        // 실행 시마다 중복되지 않는 고유한 ID 생성 (예: a1b2c3d4)
        String randomId = UUID.randomUUID().toString().substring(0, 8);

        user01 = new UserEntity();

        // 1) 이메일 랜덤화: Kim_a1b2c3d4@test.com
        user01.setUserEmlAddr("Kim_" + randomId + "@test.com");

        // 2) 닉네임 랜덤화: 길동이_a1b2c3d4
        user01.setUserNick("길동이_" + randomId);

            
        // 4) 비밀번호: SHA-256 단방향 해시
        user01.setUserEnpswd(encryptionUtil.hashSha256(rawPassword));

        // 5) 전화번호: AES-256 양방향 암호화 저장 (USER_TELNO length=100 반영)
        user01.setUserTelno(encryptionUtil.encryptTel(rawTel));

        // 6) 나머지 필수 컬럼 세팅
        user01.setUserNm("길동");
        user01.setUserBrdt(19900101);
        user01.setUserGndr("M");

    }

    //@Disabled
    @Test
    @DisplayName("사용자 휴면 전환 테스트")
    void dormantTest() {
        // 1. 저장
        UserEntity saved = userRepository.save(user01);
        
        // 2. 휴면 처리
        saved.processDormant();
        userRepository.save(saved);
        
        // 3. 검증
        UserEntity result = userRepository.findById(saved.getUserNo()).get();
        assertEquals("Y", result.getUserDrmYn());
        assertNotNull(result.getUserDrmDt());
        assertNotNull(result.getUserDrmHm());
        log.info("휴면 날짜: {}, 시간: {}", result.getUserDrmDt(), result.getUserDrmHm());
    }

    //@Disabled
    @Test
    @DisplayName("사용자 연속 탈퇴 시 del숫자 증가 테스트")
    void sequentialWithdrawTest() {
        //userRepository.deleteAll(); // 제약 조건 주의 (자식 테이블 먼저 비울 것)

        // 1. 첫 번째 사용자 탈퇴
        UserEntity firstUser = userRepository.save(user01);
        String email = firstUser.getUserEmlAddr();
        processWithdrawLogic(firstUser, email);

        // 2. 두 번째 사용자 가입 및 탈퇴
        UserEntity secondUser = createNewUser(email); 
        userRepository.save(secondUser);
        processWithdrawLogic(secondUser, email);

        // 3. 검증
        assertTrue(userRepository.findById(firstUser.getUserNo()).get().getUserEmlAddr().endsWith("_del1"));
        assertTrue(userRepository.findById(secondUser.getUserNo()).get().getUserEmlAddr().endsWith("_del2"));
    }

    private void processWithdrawLogic(UserEntity user, String pureEmail) {
        long count = userRepository.countByEmailStartingWithAndUserDelYn(pureEmail);
        user.withdraw(count + 1);
        userRepository.save(user);
    }

    /**
 * 테스트용 새로운 유저 객체 생성 헬퍼 메서드
 */
private UserEntity createNewUser(String email) {
    UserEntity newUser = new UserEntity();
    
    newUser.setUserEmlAddr(email); // 동일한 이메일로 가입 시도
    newUser.setUserNick("신규유저_" + UUID.randomUUID().toString().substring(0, 4));
    newUser.setUserNm("테스트");
    newUser.setUserEnpswd(encryptionUtil.hashSha256("test1234"));
    newUser.setUserTelno(encryptionUtil.encryptTel("010-1111-2222"));
    newUser.setUserBrdt(19950505);
    newUser.setUserGndr("F");
    
    return newUser;
}
    
    // //@Disabled
    // @Test
    // @DisplayName("사용자 연속 탈퇴 시 del숫자 증가 테스트")
    // void sequentialWithdrawTest() {
    //     // [테스트 초기화] 기존 데이터 삭제 (중요: 카운트 꼬임 방지)
    //     userRepository.deleteAll();

    //     // 1. 첫 번째 사용자 저장 및 탈퇴
    //     UserEntity firstUser = userRepository.save(user01);
    //     String originalEmail = firstUser.getUserEmlAddr(); // 변조 전 원본 이메일 보관
    //     processWithdraw(firstUser, originalEmail);

    //     // 2. 두 번째 사용자 생성 (동일 정보)
    //     UserEntity secondUser = new UserEntity();
    //     secondUser.setUserEmlAddr(originalEmail); 
    //     secondUser.setUserNick("길동이_2");
    //     secondUser.setUserNm("길동2");
    //     secondUser.setUserEnpswd("pass2");
    //     secondUser.setUserTelno(encryptionUtil.encryptTel("010-9999-8888"));
    //     secondUser.setUserBrdt(19910101);
    //     secondUser.setUserGndr("M");
    //     secondUser = userRepository.save(secondUser);

    //     // 3. 두 번째 사용자 탈퇴 실행
    //     processWithdraw(secondUser, originalEmail);

    //     // 4. 검증
    //     UserEntity res1 = userRepository.findById(firstUser.getUserNo()).get();
    //     UserEntity res2 = userRepository.findById(secondUser.getUserNo()).get();

    //     log.info("결과1: {}", res1.getUserEmlAddr());
    //     log.info("결과2: {}", res2.getUserEmlAddr());

    //     assertTrue(res1.getUserEmlAddr().endsWith("_del1"), "첫 번째는 _del1로 끝나야 함");
    //     assertTrue(res2.getUserEmlAddr().endsWith("_del2"), "두 번째는 _del2로 끝나야 함");
    // }

    // /**
    //  * 탈퇴 처리 공통 함수
    //  */
    // private void processWithdraw(UserEntity user, String pureEmail) {
    //     // DB에서 해당 이메일로 시작하는 탈퇴자 수 조회
    //     long delCount = userRepository.countByEmailStartingWithAndUserDelYn(pureEmail);
        
    //     // 카운트 + 1을 인자로 전달
    //     user.withdraw(delCount + 1);
    //     userRepository.save(user);
    // }

    // /**
    //  * 실제 서비스 로직을 모사한 탈퇴 처리 함수
    //  */
    // private void processWithdraw(UserEntity user) {
    //     // 1. 해당 사용자의 원본 이메일 기준으로 기존 탈퇴자가 몇 명인지 조회
    //     // (실제로는 이메일에서 _del 부분을 제외한 순수 이메일로 조회해야 함)
    //     String pureEmail = user.getUserEmlAddr();
    //     long delCount = userRepository.countByEmailStartingWithAndUserDelYn(pureEmail);
        
    //     // 2. 새로운 탈퇴 번호 부여 (기존 수 + 1)
    //     user.withdraw(delCount + 1);
    //     userRepository.save(user);
    // }

    @Disabled
    @Test
    @DisplayName("SHA-256 비밀번호 및 전화번호(AES-256) 암호화 저장 테스트")
    void saveAndVerifyEncryption() {
        // 1. 저장
        UserEntity savedUser = userRepository.save(user01);

        // 2. 조회
        UserEntity foundUser = userRepository.findById(savedUser.getUserNo()).get();

        // 3. 비밀번호(SHA-256) 검증
        String expectedHash = encryptionUtil.hashSha256(rawPassword);
        assertEquals(expectedHash, foundUser.getUserEnpswd(), "DB에 저장된 해시값이 일치해야 합니다.");
        assertNotEquals(rawPassword, foundUser.getUserEnpswd(), "비밀번호는 평문이 아니어야 합니다.");

        // 4. 전화번호(AES-256) 검증
        // 저장값은 암호문이어야 함
        assertNotEquals(rawTel, foundUser.getUserTelno(), "전화번호는 평문이 아니어야 합니다.");
        // 복호화하면 원문과 같아야 함
        String decryptedTel = encryptionUtil.decryptTel(foundUser.getUserTelno());
        assertEquals(rawTel, decryptedTel, "복호화된 전화번호가 원본과 일치해야 합니다.");

        // 5. 가입일/가입시간 포맷 검증
        assertNotNull(foundUser.getUserReg());
        assertNotNull(foundUser.getUserRegHm());
        assertEquals(8, foundUser.getUserReg().length(), "USER_REG는 CHAR(8) 이어야 합니다.");
        assertEquals(4, foundUser.getUserRegHm().length(), "USER_REG_HM는 CHAR(4) 이어야 합니다.");
    }

    //@Disabled
    @Test
    @DisplayName("사용자 등록")
    void doSave() {
        long beforeCount = userRepository.count();

        UserEntity saved = userRepository.save(user01);

        assertNotNull(saved.getUserNo(), "저장 후 ID가 생성되어야 합니다.");
        assertEquals(beforeCount + 1, userRepository.count(), "전체 개수가 1 증가해야 합니다.");

        System.out.println("가입된 이메일: " + saved.getUserEmlAddr());
        System.out.println("가입된 닉네임: " + saved.getUserNick());
    }

    //@Disabled
    @Test
    @DisplayName("사용자 조회")
    void doSelect() {
        log.info("┌──────────────────────────┐");
        log.info("│doSelect()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);

        // 2. 단건 조회 (ID로 조회)
        UserEntity foundUser = userRepository.findById(saved.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다."));

        // 3. 검증
        assertEquals(saved.getUserEmlAddr(), foundUser.getUserEmlAddr());
        assertEquals(saved.getUserNick(), foundUser.getUserNick());
    }

    //@Disabled
    @Test
    @DisplayName("사용자 수정")
    void doUpdate() {
        log.info("┌──────────────────────────┐");
        log.info("│doUpdate()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);
        Integer savedNo = saved.getUserNo();

        // 2. 데이터 수정
        String updatedNick = "수정된닉네임";
        saved.setUserNick(updatedNick);

        // 수정일/수정시간도 CHAR(8)/CHAR(4)로 맞춰 저장(선택)
        LocalDateTime now = LocalDateTime.now();
        saved.setUserMod(now.format(YYYYMMDD));
        saved.setUserModHm(now.format(HHMM));

        userRepository.save(saved); // JPA는 save가 Insert와 Update 역할을 겸합니다.

        // 3. 다시 조회해서 확인
        UserEntity updatedUser = userRepository.findById(savedNo).get();
        assertEquals(updatedNick, updatedUser.getUserNick(), "닉네임이 수정되어야 합니다.");
    }

    //@Disabled
    @Test
    @DisplayName("사용자 삭제")
    void doDelete() {
        log.info("┌──────────────────────────┐");
        log.info("│doDelete()                │");
        log.info("└──────────────────────────┘");

        // 1. 데이터 저장
        UserEntity saved = userRepository.save(user01);
        Integer savedNo = saved.getUserNo();

        // 2. 삭제
        userRepository.delete(saved);

        // 3. 삭제 확인
        boolean exists = userRepository.existsById(savedNo);
        assertFalse(exists, "삭제된 데이터는 존재하지 않아야 합니다.");
    }

    @AfterEach
    void tearDown() {
        log.info("┌──────────────────────────┐");
        log.info("│tearDown()                │");
        log.info("└──────────────────────────┘");
        // 데이터를 확인하기 위해 deleteAll() 주석 유지
        // userRepository.deleteAll();
    }
}