package com.pcwk.ehr.user;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

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
        msg.setTo(to);
        msg.setSubject("[해봄트립] 이메일 인증번호 안내");
        msg.setText("인증번호는 [" + code + "] 입니다. 3분 이내 입력해주세요.");        
        mailSender.send(msg);
    }
}
