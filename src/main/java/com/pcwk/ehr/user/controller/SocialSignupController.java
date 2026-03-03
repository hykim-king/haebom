package com.pcwk.ehr.user.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class SocialSignupController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/user/social-signup")
    public String socialSignupPage(HttpSession session, Model model) {

        String kakaoId = (String) session.getAttribute("kakaoId");
        if (kakaoId == null) {
            return "redirect:/user/login";
        }

        // 화면 표시용(카카오에서 받은 기본 닉네임 등을 전달)
        model.addAttribute("kakaoEmail", session.getAttribute("kakaoEmail"));
        model.addAttribute("kakaoNick", session.getAttribute("kakaoNick"));

        return "user/social_signup";
    }

    /**
     * 카카오 소셜 가입 추가 정보 처리
     * - signup.html의 항목들(전화번호, 주소, 생년월일, 성별, 여행테마)을 추가로 받음
     * - 이메일은 유니크 제약 조건을 피하기 위해 랜덤값으로 생성
     */
    @PostMapping("/user/social-signup")
    public String socialSignup(
            @RequestParam String userNick,
            @RequestParam String userTelno,
            @RequestParam String userZip,
            @RequestParam String userAddr,
            @RequestParam(required = false) String userDaddr,
            @RequestParam Integer userBrdt,
            @RequestParam String userGndr,
            @RequestParam(required = false) String userTag, // 여행 테마 (#힐링,#액티비티 형태)
            HttpSession session,
            Model model) {

        String kakaoId = (String) session.getAttribute("kakaoId");
        if (kakaoId == null) {
            return "redirect:/user/login";
        }

        String provider = "kakao";
        String providerId = kakaoId;

        // 1) 기존 소셜 계정 가입 여부 확인
        Optional<UserEntity> already = userRepository.findByUserProviderAndUserProviderId(provider, providerId);
        if (already.isPresent()) {
            session.setAttribute("user", already.get());
            return "redirect:/main/main.do";
        }

        // 2) 닉네임 중복 체크 (DB 유니크 제약 조건 대비)
        if (userRepository.existsByUserNick(userNick)) {
            model.addAttribute("error", "이미 사용 중인 닉네임입니다.");
            model.addAttribute("kakaoNick", userNick);
            return "user/social_signup";
        }

        // 3) 이메일 랜덤 생성 (유니크 제약 조건 ORA-00001 방지)
        // 형식: k_랜덤8자리@kakao.user
        String uniqueEmail = "k_" + UUID.randomUUID().toString().substring(0, 8) + "@kakao.user";

        // 4) 가입 일시 데이터 생성 (DB 스키마 N-N 제약 조건 반영)
        LocalDateTime now = LocalDateTime.now();
        String regDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String regTime = now.format(DateTimeFormatter.ofPattern("HHmm"));

        // 5) 엔티티 생성 및 데이터 세팅
        UserEntity user = new UserEntity();
        
        // 소셜 정보
        user.setUserProvider(provider);
        user.setUserProviderId(providerId);
        
        // 입력 받은 정보
        user.setUserNick(userNick);
        user.setUserTelno(userTelno);
        user.setUserZip(userZip);
        user.setUserAddr(userAddr);
        user.setUserDaddr(userDaddr);
        user.setUserBrdt(userBrdt);
        user.setUserGndr(userGndr);
        user.setUserTag(userTag); // 여행 테마 저장
        
        // 자동 생성 및 기본값 정보
        user.setUserEmlAddr(uniqueEmail); // 랜덤 이메일
        user.setUserEnpswd(passwordEncoder.encode(UUID.randomUUID().toString())); // 임시 비번
        user.setUserNm((String) session.getAttribute("kakaoNick") != null ? 
                       (String) session.getAttribute("kakaoNick") : "카카오회원");
        
        // DB 상태값 및 가입일시 설정
        user.setUserDelYn("N");
        user.setUserDrmYn("N");
        user.setUserMngrYn("N");
        user.setUserReg(regDate);
        user.setUserRegHm(regTime);

        // 6) DB 저장
        userRepository.save(user);

        // 7) 세션에 사용자 정보 저장 후 로그인 처리
        session.setAttribute("user", user);

        return "redirect:/main/main.do";
    }
}