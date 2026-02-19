package com.pcwk.ehr.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import com.pcwk.ehr.user.UserEntity;

import java.util.Optional;

@EnableJpaRepositories(basePackages = "com.pcwk.ehr.user.repository")
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    Optional<UserEntity> findByUserEmlAddr(String email);
}
