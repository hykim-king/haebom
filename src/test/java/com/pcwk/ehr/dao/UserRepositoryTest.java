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

        // 3) 가입일/가입시간 (CHAR(8)/CHAR(4))
        LocalDateTime now = LocalDateTime.now();
        user01.setUserReg(now.format(YYYYMMDD)); // 예: 20260222
        user01.setUserRegHm(now.format(HHMM)); // 예: 1830

        // 4) 비밀번호: SHA-256 단방향 해시
        user01.setUserEnpswd(encryptionUtil.hashSha256(rawPassword));

        // 5) 전화번호: AES-256 양방향 암호화 저장 (USER_TELNO length=100 반영)
        user01.setUserTelno(encryptionUtil.encryptTel(rawTel));

        // 6) 나머지 필수 컬럼 세팅
        user01.setUserNm("길동");
        user01.setUserBrdt(19900101);
        user01.setUserGndr("M");
        user01.setUserMngrYn("N");
        user01.setUserDelYn("N");

        // 휴면여부 NOT NULL이므로 기본값 세팅
        user01.setUserDrmYn("N");
    }

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

    @Disabled
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

    @Disabled
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

    @Disabled
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

    @Disabled
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