package com.pcwk.ehr.user;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserVO extends DTO {
    
    private int    userId;     // 사용자 고유번호 (PK)
    private String email;      // 이메일
    private String password;   // 비밀번호
    private String userName;   // 사용자 이름
    private int    userBirth;  // 생년월일 (NUMBER 8)
    private String userTel;    // 전화번호
    private String profileImg; // 프로필 이미지
    private String userTag;    // 해시태그
    private String userSex;    // 성별 (CHAR 1)
    private int    userRole;   // 권한 (NUMBER 1)
    private String provider;   // 소셜 제공자
    private String providerId; // 소셜 로그인 아이디
    private String regDt;      // 가입 일시
    private String modDt;      // 수정일
}
