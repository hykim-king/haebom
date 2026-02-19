package com.pcwk.ehr.user;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class UserVO extends DTO {

    private int    userNo;         // 사용자 고유번호
    private String userEmlAddr;    // 유저이메일주소
    private String userEnpswd;     // 유저 암호화 비밀번호
    private String userNm;         // 사용자 이름
    private int    userBrdt;       // 사용자 생년월일
    private String userTelno;      // 전화 번호
    private String userPathNm;     // 프로필 경로 명
    private String userTag;        // 해시태그
    private String userGndr;       // 성별
    private String userMngrYn;     // 관리자 권한 확인
    private String userProvider;   // 소셜제공자
    private String userProviderId; // 소셜 로그인 아이디
    private String userReg;        // 사용자 가입 일시
    private String userMod;        // 수정일
    private String userZip;        // 사용자 우편번호
    private String userAddr;       // 사용자 기본주소
    private String userDaddr;      // 사용자 상세주소
    private String userDelYn;      // 유저 탈퇴 여부
    private String userDelTm;      // 유저 탈퇴 시간
}
