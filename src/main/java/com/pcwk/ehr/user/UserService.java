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
}
