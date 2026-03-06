package com.pcwk.ehr.user.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class SocialSignupController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // 닉네임 중복 체크 API
    @GetMapping("/user/check-nickname")
    @ResponseBody
    public boolean checkNickname(@RequestParam String nickname) {
        return !userRepository.existsByUserNick(nickname);
    }

    @GetMapping("/user/social-signup")
    public String socialSignupPage(HttpSession session, Model model) {
        String kakaoId = (String) session.getAttribute("kakaoId");
        if (kakaoId == null) return "redirect:/user/login";
        
        model.addAttribute("kakaoNick", session.getAttribute("kakaoNick"));
        return "user/social_signup";
    }

    @PostMapping("/user/social-signup")
    public String socialSignup(
            @RequestParam String userNick,
            @RequestParam String userTelno,
            @RequestParam String userZip,
            @RequestParam String userAddr,
            @RequestParam(required = false) String userDaddr,
            @RequestParam Integer userBrdt,
            @RequestParam String userGndr,
            @RequestParam(required = false) String userTag,
            HttpSession session) {

        String kakaoId = (String) session.getAttribute("kakaoId");
        if (kakaoId == null) return "redirect:/user/login";

        // 1) 닉네임 최종 확인 (보안상 한 번 더 체크)
        if (userRepository.existsByUserNick(userNick)) {
            return "redirect:/user/social-signup?error=nick";
        }

        // 2) 전화번호 중복 회피 로직 (+1 씩 증가)
        String finalTelno = userTelno;
        int suffix = 1;
        while (userRepository.existsByUserTelno(finalTelno)) {
            finalTelno = userTelno + suffix;
            suffix++;
        }

        // 3) 가입 정보 세팅
        UserEntity user = new UserEntity();
        user.setUserProvider("kakao");
        user.setUserProviderId(kakaoId);
        user.setUserNick(userNick);
        user.setUserTelno(finalTelno); // 중복이 해결된 번호
        user.setUserZip(userZip);
        user.setUserAddr(userAddr);
        user.setUserDaddr(userDaddr);
        user.setUserBrdt(userBrdt);
        user.setUserGndr(userGndr);
        user.setUserTag(userTag);
        
        // 고정 및 자동 생성 값
        user.setUserEmlAddr("k_" + UUID.randomUUID().toString().substring(0, 8) + "@kakao.user");
        user.setUserEnpswd(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setUserNm((String) session.getAttribute("kakaoNick"));
        user.setUserDelYn("N");
        user.setUserDrmYn("N");
        user.setUserMngrYn("N");
        
        LocalDateTime now = LocalDateTime.now();
        user.setUserReg(now.format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        user.setUserRegHm(now.format(DateTimeFormatter.ofPattern("HHmm")));

        userRepository.save(user);
        session.setAttribute("user", user);

        return "redirect:/main/main.do";
    }
}