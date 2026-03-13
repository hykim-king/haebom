package com.pcwk.ehr.user.repository;

import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import com.pcwk.ehr.user.UserEntity;

import java.util.Optional;

@EnableJpaRepositories(basePackages = "com.pcwk.ehr.user.repository")
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByUserEmlAddr(String email);
    boolean existsByUserEmlAddr(String email); // 이메일 중복 체크용
    boolean existsByUserNick(String nickname); // 닉네임 중복 체크용

   // 탈퇴한 사용자 중 특정 이메일로 시작하는 인원 수 조회 (del숫자 계산용)
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userEmlAddr LIKE concat(:email, '%') AND u.userDelYn = 'Y'")
    long countByEmailStartingWithAndUserDelYn(@Param("email") String email);

    
}
