package com.pcwk.ehr.user.controller;

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

        // 화면 표시용(없을 수도 있음)
        model.addAttribute("kakaoEmail", session.getAttribute("kakaoEmail"));
        model.addAttribute("kakaoNick", session.getAttribute("kakaoNick"));

        return "user/social_signup";
    }

    /**
     * ✅ 혼합 설계 (추가정보 페이지 유지 + 닉네임만 필수)
     * - userNick만 받는다.
     * - 나머지 ss_user NOT NULL 컬럼은 "컬럼 형식에 맞춰" 자동 생성한다.
     */
    @PostMapping("/user/social-signup")
    public String socialSignup(
            @RequestParam String userNick,
            HttpSession session,
            Model model) {

        String kakaoId = (String) session.getAttribute("kakaoId");
        if (kakaoId == null) {
            return "redirect:/user/login";
        }

        String provider = "kakao";
        String providerId = kakaoId;

        // 1) 이미 가입된 카카오 회원인지 체크(중복가입 방지)
        Optional<UserEntity> already = userRepository.findByUserProviderAndUserProviderId(provider, providerId);
        if (already.isPresent()) {
            session.setAttribute("user", already.get());
            return "redirect:/main/main.do";
        }

        // 2) 닉네임 필수 + 공백 제거
        userNick = userNick == null ? "" : userNick.trim();
        if (userNick.isEmpty()) {
            // 같은 페이지로 돌려보내며 메시지 표출(필요시 화면에서 th로 표시)
            model.addAttribute("error", "닉네임은 필수입니다.");
            model.addAttribute("kakaoEmail", session.getAttribute("kakaoEmail"));
            model.addAttribute("kakaoNick", session.getAttribute("kakaoNick"));
            return "user/social_signup";
        }

        // 3) 닉네임 중복 체크
        if (userRepository.existsByUserNick(userNick)) {
            model.addAttribute("error", "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.");
            model.addAttribute("kakaoEmail", session.getAttribute("kakaoEmail"));
            model.addAttribute("kakaoNick", session.getAttribute("kakaoNick"));
            return "user/social_signup";
        }

        // 4) 카카오에서 받을 수 있는 값(없을 수 있음)
        String sessionEmail = (String) session.getAttribute("kakaoEmail");
        String sessionNick = (String) session.getAttribute("kakaoNick");

        // 5) ss_user NOT NULL 컬럼 자동 생성(형식 맞춤)
        // - 이메일: 있으면 사용, 없으면 임시 이메일 생성
        String userEmlAddr = (sessionEmail != null && !sessionEmail.isBlank())
                ? sessionEmail.trim()
                : ("kakao_" + providerId + "@social.local");

        // - 이름: 카카오 닉네임이 있으면 활용, 없으면 기본값
        String userNm = (sessionNick != null && !sessionNick.isBlank())
                ? sessionNick.trim()
                : "카카오회원";

        // - 생년월일(정수 yyyymmdd): 기본값 20000101
        Integer userBrdt = 20000101;

        // - 전화번호(문자열): 기본값(11자리 숫자 문자열)
        String userTelno = "01000000000";

        // - 성별(CHAR(1) NOT NULL): 기본값
        // ⚠️ DB에 CHECK 제약으로 M/F만 허용이면 'M' 또는 'F' 중 하나만 써야 함.
        // 대표님 DB가 M/F만 받는 구조로 보이므로 기본값 'M'으로 둠.
        String userGndr = "M";

        // - 비밀번호(소셜은 폼로그인에 안 쓰더라도 NOT NULL): UUID 생성 후 BCrypt 저장
        String encPw = passwordEncoder.encode(UUID.randomUUID().toString());

        // 6) 엔티티 저장
        UserEntity user = new UserEntity();
        user.setUserProvider(provider);
        user.setUserProviderId(providerId);

        user.setUserNick(userNick);
        user.setUserEmlAddr(userEmlAddr);
        user.setUserEnpswd(encPw);

        user.setUserNm(userNm);
        user.setUserBrdt(userBrdt);
        user.setUserTelno(userTelno);
        user.setUserGndr(userGndr);

        userRepository.save(user);

        // 7) 로그인 처리(세션 저장)
        session.setAttribute("user", user);

        return "redirect:/main/main.do";
    }
}