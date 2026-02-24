package com.pcwk.ehr.cmn;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Component;

@Component
public class EncryptionUtil {

    // 1. SHA-256 단방향 암호화 (비밀번호용)
    public String hashSha256(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 알고리즘을 찾을 수 없습니다.", e);
        }
    }

    // 2. AES-256 양방향 암호화 (전화번호용)
    // 보안을 위해 실제 운영 환경에서는 별도의 설정 파일에서 불러와야 합니다.
    private final String secretKey = "pcwk_secret_key_123"; 
    private final String salt = "deadbeef"; // 16진수 문자열
    private final TextEncryptor aesEncryptor = Encryptors.text(secretKey, salt);

    public String encryptTel(String plainTel) {
        return aesEncryptor.encrypt(plainTel);
    }

    public String decryptTel(String encryptedTel) {
        return aesEncryptor.decrypt(encryptedTel);
    }
}
