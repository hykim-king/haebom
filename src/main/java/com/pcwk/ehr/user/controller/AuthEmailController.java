package com.pcwk.ehr.user.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import com.pcwk.ehr.user.MailService;
import com.pcwk.ehr.user.UserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthEmailController {

    private final MailService mailService;
    private final UserService userService;

    // ✅ [추가] 비밀번호 찾기(임시 비밀번호 발송)
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");

        // 1) 이메일 형식 검증
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return Map.of("success", false, "message", "이메일 형식이 올바르지 않습니다.");
        }
        if (name == null || name.trim().isEmpty()) {
            return Map.of("success", false, "message", "이름을 입력해주세요.");
        }

        try {
            // 2) 사용자 확인 + 임시 비번 저장 + 메일 발송
            userService.resetPasswordAndSendTemp(email.trim(), name.trim());

            // 3) 프론트 alert 용 성공 메시지
            return Map.of("success", true, "message", "이메일로 임시 비밀번호를 발송 하였습니다!");
        } catch (Exception e) {
            // 보안상 상세 원인 숨기고 동일 메시지 처리(계정 존재 여부 노출 방지)
            return Map.of("success", false, "message", "일치하는 사용자가 없습니다.");
        }
    }

    @PostMapping("/send-email")
    public Map<String, Object> sendEmail(@RequestBody Map<String, String> body,
            HttpSession session) {
        String email = body.get("email");

        // 1) 서버에서도 이메일 형식 검증(프론트 검증은 우회 가능)
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return Map.of("success", false, "message", "이메일 형식이 올바르지 않습니다.");
        }

        // 2) 인증번호 생성 + 메일 발송
        String code = mailService.generateCode();
        mailService.sendVerificationCode(email, code);

        // 3) 세션 저장 (유효시간도 같이)
        session.setAttribute("EMAIL_TARGET", email);
        session.setAttribute("EMAIL_CODE", code);
        session.setAttribute("EMAIL_CODE_TIME", System.currentTimeMillis());

        return Map.of("success", true, "message", "인증번호를 발송하였습니다.");
    }

    @PostMapping("/verify-email")
    public Map<String, Object> verifyEmail(@RequestBody Map<String, String> body,
            HttpSession session) {
        String email = body.get("email");
        String code = body.get("code");

        String savedEmail = (String) session.getAttribute("EMAIL_TARGET");
        String savedCode = (String) session.getAttribute("EMAIL_CODE");
        Long savedTime = (Long) session.getAttribute("EMAIL_CODE_TIME");

        if (savedEmail == null || savedCode == null || savedTime == null) {
            return Map.of("success", false, "message", "먼저 인증번호를 전송해주세요.");
        }

        // ✅ 유효시간 예시: 3분
        if (System.currentTimeMillis() - savedTime > 3 * 60 * 1000) {
            return Map.of("success", false, "message", "인증번호가 만료되었습니다. 다시 전송해주세요.");
        }

        if (savedEmail.equals(email) && savedCode.equals(code)) {
            session.setAttribute("EMAIL_VERIFIED", true);
            return Map.of("success", true, "message", "인증번호가 확인되었습니다.");
        }

        return Map.of("success", false, "message", "인증번호가 올바르지 않습니다.");
    }
}
