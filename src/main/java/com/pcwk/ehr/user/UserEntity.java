package com.pcwk.ehr.user;

import org.hibernate.annotations.DynamicInsert;

import jakarta.persistence.*;
import lombok.*;

/**
 * ss_user 테이블 엔티티
 *
 * DB 컬럼 스펙(첨부 이미지 기준):
 * - 날짜: CHAR(8) (예: 20260222)
 * - 시간: CHAR(4) (예: 1830)
 */
@DynamicInsert
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ss_user")
@SequenceGenerator(name = "SEQ_USER_NO_GEN", sequenceName = "SEQ_USER_NO", allocationSize = 1)
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_USER_NO_GEN")
    @Column(name = "user_no", precision = 10, nullable = false)
    private Integer userNo; // NUMBER(10), N-N

    @Column(name = "user_nick", nullable = false, length = 30)
    private String userNick; // VARCHAR2(30), N-N

    @Column(name = "user_eml_addr", nullable = false, length = 320)
    private String userEmlAddr; // VARCHAR2(320), N-N

    @Column(name = "user_enpswd", nullable = false, length = 256)
    private String userEnpswd; // VARCHAR2(256), N-N

    @Column(name = "user_nm", nullable = false, length = 7)
    private String userNm; // NVARCHAR2(7), N-N

    @Column(name = "user_brdt", nullable = false, precision = 8)
    private Integer userBrdt; // NUMBER(8), N-N (생년월일 yyyymmdd)

    @Column(name = "user_telno", nullable = false, length = 200)
    private String userTelno; // VARCHAR2(13), N-N

    @Column(name = "user_path_nm", length = 300)
    private String userPathNm; // VARCHAR2(300), NULL

    @Column(name = "user_tag", length = 300)
    private String userTag; // VARCHAR2(300), NULL

    @Column(name = "user_gndr", nullable = false, length = 1)
    private String userGndr; // CHAR(1), N-N

    @Column(name = "user_mngr_yn", nullable = false, length = 1)
    private String userMngrYn; // CHAR(1), N-N

    @Column(name = "user_provider", length = 20)
    private String userProvider; // VARCHAR2(20), NULL

    @Column(name = "user_provider_id", length = 100)
    private String userProviderId; // VARCHAR2(100), NULL

    @Column(name = "user_reg", nullable = false, length = 8)
    private String userReg; // CHAR(8), N-N (가입일 yyyymmdd)

    @Column(name = "user_reg_hm", nullable = false, length = 4)
    private String userRegHm; // CHAR(4), N-N (가입시간 HHmm)

    @Column(name = "user_mod", length = 8)
    private String userMod; // CHAR(8), NULL (수정일 yyyymmdd)

    @Column(name = "user_mod_hm", length = 4)
    private String userModHm; // CHAR(4), NULL (수정시간 HHmm)

    @Column(name = "user_zip", length = 5)
    private String userZip; // CHAR(5), NULL

    @Column(name = "user_addr", length = 200)
    private String userAddr; // VARCHAR2(200 BYTE), NULL

    @Column(name = "user_daddr", length = 200)
    private String userDaddr; // VARCHAR2(200), NULL

    @Column(name = "user_del_yn", nullable = false, length = 1)
    private String userDelYn; // CHAR(1), N-N (탈퇴여부)

    @Column(name = "user_del_dt", length = 8)
    private String userDelDt; // CHAR(8), NULL (탈퇴일 yyyymmdd)

    @Column(name = "user_del_hm", length = 4)
    private String userDelHm; // CHAR(4), NULL (탈퇴시간 HHmm)

    @Column(name = "user_drm_yn", nullable = false, length = 1)
    private String userDrmYn; // CHAR(1), N-N (휴면여부)

    @Column(name = "user_drm_dt", length = 8)
    private String userDrmDt; // CHAR(8), NULL (휴면일 yyyymmdd)

    @Column(name = "user_drm_hm", length = 4)
    private String userDrmHm; // CHAR(4), NULL (휴면시간 HHmm)
}