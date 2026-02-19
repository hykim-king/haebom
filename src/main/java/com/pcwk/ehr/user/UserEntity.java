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
    @Column(name = "user_no")
    private Integer userNo;

    @Column(name = "user_eml_addr", length = 200)
    private String userEmlAddr;

    @Column(name = "user_enpswd", length = 200)
    private String userEnpswd;

    @Column(name = "user_nm", length = 100)
    private String userNm;

    @Column(name = "user_brdt")
    private Integer userBrdt;

    @Column(name = "user_telno", length = 50)
    private String userTelno;

    @Column(name = "user_path_nm")
    private String userPathNm;

    @Column(name = "user_tag")
    private String userTag;

    @Column(name = "user_gndr", length = 10)
    private String userGndr;

    @Column(name = "user_mngr_yn", length = 1)
    private String userMngrYn;

    @Column(name = "user_provider")
    private String userProvider;

    @Column(name = "user_provider_id")
    private String userProviderId;

    @Column(name = "user_reg")
    private String userReg; // DB 타입에 따라 LocalDateTime으로 변경 가능

    @Column(name = "user_mod")
    private String userMod;

    @Column(name = "user_zip")
    private String userZip;

    @Column(name = "user_addr")
    private String userAddr;

    @Column(name = "user_daddr")
    private String userDaddr;

    @Column(name = "user_del_yn", length = 1)
    private String userDelYn;

    @Column(name = "user_del_tm")
    private String userDelTm;
}
