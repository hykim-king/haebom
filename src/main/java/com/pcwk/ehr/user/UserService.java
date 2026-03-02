package com.pcwk.ehr.user;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MailService mailService; // ✅ [추가]

    public void signUp(UserVO vo) {
        UserEntity entity = new UserEntity();
        entity.setUserEmlAddr(vo.getUserEmlAddr());
        entity.setUserEnpswd(vo.getUserEnpswd()); // 실제론 암호화 필요
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

    public UserVO loginDetail(String email, String password) {
        UserEntity user = userRepository.findByUserEmlAddr(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!user.getUserEnpswd().equals(password)) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        UserVO vo = new UserVO();
        vo.setUserNick(user.getUserNick());
        vo.setUserEmlAddr(user.getUserEmlAddr());
        vo.setUserNm(user.getUserNm());
        return vo;
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

        // 임시 비밀번호 생성
        String tempPw = mailService.generateTempPassword(10);

        // ✅ 현재 로그인 로직이 equals 비교이므로, 일단 평문 저장(기존 코드 유지)
        user.setUserEnpswd(tempPw);
        userRepository.save(user);

        // 이메일 발송
        mailService.sendTempPassword(email, tempPw);
    }
}