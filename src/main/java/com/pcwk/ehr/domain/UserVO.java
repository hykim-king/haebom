package com.pcwk.ehr.domain;

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

    // 기본 정보
    private Integer userNo;       // 사용자 번호 (Entity의 userNo 대응)
    private String  userNick;     // 닉네임
    private String  userEmlAddr;  // 이메일 주소
    private String  userEnpswd;   // 암호화된 비밀번호
    private String  userEnpswdConfirm; // 비밀번호 확인 (화면 검증용 추가)
    private String  userNm;       // 이름
    private Integer userBrdt;     // 생년월일 (YYYYMMDD)
    private String  userTelno;    // 전화번호
    private String  userGndr;     // 성별 (M/F)

    // 주소 정보
    private String  userZip;      // 우편번호
    private String  userAddr;     // 기본 주소
    private String  userDaddr;    // 상세 주소

    // 부가 정보
    private String  userPathNm;   // 가입 경로
    private String  userTag;      // 유저 태그 (선호 테마 등)
    private String  userMngrYn;   // 관리자 여부 (기본 'N')
    private String  userProvider; // 소셜 가입 제공자
    private String  userProviderId; // 소셜 가입 ID

    // 상태 및 날짜 정보 (String으로 관리하여 포맷 유지)
    private String  userReg;      // 등록일 (YYYYMMDD)
    private String  userRegHm;    // 등록시간 (HHMM)
    private String  userMod;      // 수정일
    private String  userModHm;    // 수정시간
    private String  userDelYn;    // 탈퇴여부 ('N')
    private String  userDelDt;    // 탈퇴일
    private String  userDelHm;    // 탈퇴시간
    private String  userDrmYn;    // 휴면여부 ('N')
    private String  userDrmDt;    // 휴면일
    private String  userDrmHm;    // 휴면시간
}
