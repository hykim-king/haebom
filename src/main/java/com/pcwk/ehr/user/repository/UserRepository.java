package com.pcwk.ehr.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pcwk.ehr.user.UserEntity;

import java.util.Optional;

@Repository // @EnableJpaRepositories는 보통 설정 클래스에 작성하므로 여기서는 Repository 어노테이션을 권장합니다.
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    
    Optional<UserEntity> findByUserEmlAddr(String email);
    
    // [중복 체크용 메서드들]
    boolean existsByUserEmlAddr(String email); // 이메일 중복 체크
    boolean existsByUserNick(String nickname); // 닉네임 중복 체크
    boolean existsByUserTelno(String telno);   // 전화번호 중복 체크 (추가됨)

    // 탈퇴한 사용자 중 특정 이메일로 시작하는 인원 수 조회 (del숫자 계산용)
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userEmlAddr LIKE concat(:email, '%') AND u.userDelYn = 'Y'")
    long countByEmailStartingWithAndUserDelYn(@Param("email") String email);

    // 소셜 로그인 정보로 사용자 찾기
    Optional<UserEntity> findByUserProviderAndUserProviderId(String userProvider, String userProviderId);
}