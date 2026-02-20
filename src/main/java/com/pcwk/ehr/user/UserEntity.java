package com.pcwk.ehr.user;

import java.time.LocalDateTime;
import org.hibernate.annotations.DynamicInsert;
import jakarta.persistence.*;
import lombok.*;

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
    @Column(name = "user_no", precision = 10)
    private Integer userNo; // NUMBER(10)

    // ⭐ 누락된 닉네임 컬럼 추가
    @Column(name = "user_nick", nullable = false, length = 30)
    private String userNick; // VARCHAR2(30), N-N

    @Column(name = "user_eml_addr", nullable = false, length = 320)
    private String userEmlAddr; // VARCHAR2(320), N-N

    @Column(name = "user_enpswd", nullable = false, length = 256)
    private String userEnpswd; // VARCHAR2(256), N-N

    @Column(name = "user_nm", nullable = false, length = 7)
    private String userNm; // NVARCHAR2(7), N-N

    @Column(name = "user_brdt", nullable = false, precision = 8)
    private Integer userBrdt; // NUMBER(8), N-N

    @Column(name = "user_telno", nullable = false, length = 13)
    private String userTelno; // VARCHAR2(13), N-N

    @Column(name = "user_path_nm", length = 300)
    private String userPathNm; // VARCHAR2(300)

    @Column(name = "user_tag", length = 300)
    private String userTag; // VARCHAR2(300)

    @Column(name = "user_gndr", nullable = false, length = 1)
    private String userGndr; // CHAR(1), N-N

    @Column(name = "user_mngr_yn", nullable = false, length = 1)
    private String userMngrYn; // CHAR(1), N-N

    @Column(name = "user_provider", length = 20)
    private String userProvider; // VARCHAR2(20)

    @Column(name = "user_provider_id", length = 100)
    private String userProviderId; // VARCHAR2(100)

    // ⭐ String에서 LocalDateTime으로 변경 (DB: DATE)
    @Column(name = "user_reg", nullable = false)
    private LocalDateTime userReg; // DATE, N-N

    @Column(name = "user_mod")
    private LocalDateTime userMod; // DATE

    // ⭐ 누락된 시도지역 컬럼 추가
    @Column(name = "user_ctpv", precision = 2)
    private Integer userCtpv; // NUMBER(2)

    @Column(name = "user_zip", length = 5)
    private String userZip; // CHAR(5)

    @Column(name = "user_addr", length = 200) // 테이블 명세 기준 크기 조정 가능
    private String userAddr; 

    @Column(name = "user_daddr", length = 200)
    private String userDaddr; // VARCHAR2(200)

    @Column(name = "user_del_yn", nullable = false, length = 1)
    private String userDelYn; // CHAR(1), N-N

    @Column(name = "user_del_tm")
    private LocalDateTime userDelTm; // DATE
}