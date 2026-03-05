package com.pcwk.ehr.user;

import com.pcwk.ehr.user.UserEntity;
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

    public void signUp(UserVO vo) {
        UserEntity entity = new UserEntity();
        // VO -> Entity 데이터 복사 (생년월일 등)
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

        // 가입 날짜/시간 설정 (CHAR 8, 4)
        LocalDateTime now = LocalDateTime.now();
        entity.setUserReg(now.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        entity.setUserRegHm(now.format(DateTimeFormatter.ofPattern("HHmm")));
        
        // 기본값 설정
        entity.setUserDelYn("N");
        entity.setUserDrmYn("N");
        entity.setUserMngrYn("N");

        //자바 객체를 생성하고 save() 메섣,에 던지기만 하면, JPA가 알아서 INSERT 쿼리를 생성
        userRepository.save(entity);

    }

    // UserService.java에 추가
    public boolean login(String email, String password) {
        // 1. 이메일로 사용자 조회
        return userRepository.findByUserEmlAddr(email)
                .map(user -> {
                    // 2. 비밀번호 일치 확인 (실제 운영시 암호화 필요)
                    if (user.getUserEnpswd().equals(password)) {
                        // 3. 탈퇴 여부 등 추가 검증 가능
                        return "N".equals(user.getUserDelYn());
                    }
                    return false;
                })
                .orElse(false);
    }

    // 닉네임 등을 세션에 담기 위해 사용자 정보를 통째로 가져오는 메서드도 유용합니다.
    public UserVO loginDetail(String email, String password) {
        UserEntity user = userRepository.findByUserEmlAddr(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
                
        if(!user.getUserEnpswd().equals(password)) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }
        
        // Entity를 VO로 변환해서 반환
        UserVO vo = new UserVO();
        vo.setUserNick(user.getUserNick());
        vo.setUserEmlAddr(user.getUserEmlAddr());
        vo.setUserNo(user.getUserNo());
        vo.setUserNm(user.getUserNm());
        return vo;
    }
}
