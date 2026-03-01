package com.pcwk.ehr.user.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class OAuth2Controller {

    private final UserRepository userRepository;

    @GetMapping("/oauth2/success")
    public String oauth2Success(Authentication authentication, HttpSession session) {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // ✅ 1) provider / providerId 정상 선언 (컴파일 에러 해결)
        String provider = "kakao";
        String providerId = String.valueOf(attributes.get("id")); // 카카오 고유ID

        // (선택) 카카오 이메일/닉네임 꺼내기 (스코프 동의 여부에 따라 null일 수 있음)
        String email = null;
        String nick = null;

        Object kakaoAccountObj = attributes.get("kakao_account");
        if (kakaoAccountObj instanceof Map) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoAccountObj;
            Object emailObj = kakaoAccount.get("email");
            if (emailObj != null)
                email = String.valueOf(emailObj);

            Object profileObj = kakaoAccount.get("profile");
            if (profileObj instanceof Map) {
                Map<String, Object> profile = (Map<String, Object>) profileObj;
                Object nickObj = profile.get("nickname");
                if (nickObj != null)
                    nick = String.valueOf(nickObj);
            }
        }

        // ✅ 2) 기존회원 조회 (USER_PROVIDER / USER_PROVIDER_ID)
        Optional<UserEntity> userOptional = userRepository.findByUserProviderAndUserProviderId(provider, providerId);

        // ✅ 3) 기존회원이면 바로 로그인(세션 저장)
        if (userOptional.isPresent()) {
            session.setAttribute("user", userOptional.get());
            return "redirect:/main/main.do";
        }

        // ✅ 4) 신규회원이면 추가정보 입력 페이지로 (세션에 kakao 정보 저장)
        session.setAttribute("kakaoId", providerId); // SocialSignupController에서 사용
        session.setAttribute("kakaoEmail", email); // 있으면 사용(없으면 null)
        session.setAttribute("kakaoNick", nick); // 있으면 사용(없으면 null)

        return "redirect:/user/social-signup";
    }
}