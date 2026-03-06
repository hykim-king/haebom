package com.pcwk.ehr.user;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public String generateCode() {
        int n = (int) (Math.random() * 900000) + 100000; // 100000~999999
        return String.valueOf(n);
    }

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("msk924616@gmail.com");
        msg.setTo(to);
        msg.setSubject("[해봄트립] 이메일 인증번호 안내");
        msg.setText("인증번호는 [" + code + "] 입니다. 3분 이내 입력해주세요.");
        mailSender.send(msg);
    }

    // ✅ [추가] 임시 비밀번호 생성 (랜덤)
    public String generateTempPassword(int length) {
        // 숫자+영문(대/소) 혼합
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // ✅ [추가] 임시 비밀번호 메일 발송
    public void sendTempPassword(String to, String tempPassword) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom("msk924616@gmail.com");
        msg.setTo(to);
        msg.setSubject("[해봄트립] 임시 비밀번호 안내");
        msg.setText(
                "임시 비밀번호는 [" + tempPassword + "] 입니다.\n" +
                        "로그인 후 반드시 비밀번호를 변경해주세요.");
        mailSender.send(msg);
    }
}