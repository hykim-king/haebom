package com.pcwk.ehr.user;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MailService mailService; // ✅ [추가]
    private final BCryptPasswordEncoder passwordEncoder; // SecurityConfig의 Bean이 주입됨

    public void signUp(UserVO vo) {
        // 비밀번호 8자 이상 검증
        if (vo.getUserEnpswd() == null || vo.getUserEnpswd().length() < 8) {
            throw new RuntimeException("비밀번호는 최소 8자 이상이어야 합니다.");
        }
        UserEntity entity = new UserEntity();
        // BCrypt 암호화 적용
        String encodedPw = passwordEncoder.encode(vo.getUserEnpswd());
        entity.setUserEnpswd(encodedPw);

        // UserEntity entity = new UserEntity();
        entity.setUserEmlAddr(vo.getUserEmlAddr());
        // entity.setUserEnpswd(vo.getUserEnpswd()); // 실제론 암호화 필요
        entity.setUserNick(vo.getUserNick());
        entity.setUserNm(vo.getUserNm());
        entity.setUserBrdt(vo.getUserBrdt());
        entity.setUserTelno(vo.getUserTelno());
        entity.setUserZip(vo.getUserZip());
        entity.setUserAddr(vo.getUserAddr());
        entity.setUserDaddr(vo.getUserDaddr());
        entity.setUserGndr(vo.getUserGndr());

        LocalDateTime now = LocalDateTime.now();
        entity.setUserReg(now.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        entity.setUserRegHm(now.format(DateTimeFormatter.ofPattern("HHmm")));

        entity.setUserDelYn("N");
        entity.setUserDrmYn("N");
        entity.setUserMngrYn("N");

        userRepository.save(entity);
    }

    public boolean login(String email, String password) {
        return userRepository.findByUserEmlAddr(email)
                .map(user -> {
                    if (user.getUserEnpswd().equals(password)) {
                        return "N".equals(user.getUserDelYn());
                    }
                    return false;
                })
                .orElse(false);
    }

    // UserVO 대신 UserEntity를 반환하도록 수정
    public UserEntity loginDetail(String email, String rawPassword) {
        UserEntity user = userRepository.findByUserEmlAddr(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(rawPassword, user.getUserEnpswd())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 💡 VO에 일일이 옮겨 담지 말고, DB에서 가져온 user 객체를 통째로 리턴하세요!
        return user;
    }

    // ✅ [추가] 비밀번호 찾기: 이메일+이름 확인 → 임시 비번 발급/저장/메일 발송
    public void resetPasswordAndSendTemp(String email, String name) {
    UserEntity user = userRepository.findByUserEmlAddr(email)
            .orElseThrow(() -> new RuntimeException("일치하는 사용자가 없습니다."));

    // 이름 일치 확인 (공백 제거 비교)
    String inputName = (name == null) ? "" : name.trim();
    String dbName = (user.getUserNm() == null) ? "" : user.getUserNm().trim();

    if (!dbName.equals(inputName)) {
        throw new RuntimeException("일치하는 사용자가 없습니다.");
    }

    // 1. 임시 비밀번호 생성 (평문)
    String tempPw = mailService.generateTempPassword(10);

    // 2. 중요: 임시 비밀번호를 암호화하여 DB용 변수에 저장
    String encodedTempPw = passwordEncoder.encode(tempPw);
    user.setUserEnpswd(encodedTempPw); // 암호화된 비밀번호를 세팅
    
    userRepository.save(user);

    // 3. 사용자에게는 암호화되지 않은 '평문' 임시 비밀번호를 메일로 발송
    mailService.sendTempPassword(email, tempPw);
}

    // UserService.java 내부에 추가

    // 이메일 중복 확인 (중복이 없으면 true)
    public boolean isEmailAvailable(String email) {
        // userRepository.existsByUserEmlAddr(email)이 true면 중복이 있다는 뜻
        return !userRepository.existsByUserEmlAddr(email);
    }

    // 전화번호 중복 확인 (중복이 없으면 true)
    public boolean isPhoneAvailable(String telno) {
        // userRepository.existsByUserTelno(telno)이 true면 중복이 있다는 뜻
        return !userRepository.existsByUserTelno(telno);
    }

    // 닉네임 중복 확인 (필요시 사용)
    public boolean isNicknameAvailable(String nickname) {
        return !userRepository.existsByUserNick(nickname);
    }

}