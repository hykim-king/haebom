package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NoticeVO extends DTO {

    private int ntcNo;         // NTC_NO (NUMBER) : 공지사항 고유번호
    private String ntcTtl;     // NTC_TTL (NVARCHAR2) : 제목
    private String ntcCn;      // NTC_CN (NVARCHAR2) : 내용
    private String ntcReg;     // NTC_REG (CHAR) : 등록일 (YYYYMMDD)
    private String ntcRegHm;   // NTC_REG_HM (CHAR) : 등록시간 (HH24MI)
    private String ntcMod;     // NTC_MOD (CHAR) : 수정일 (YYYYMMDD)
    private String ntcModHm;   // NTC_MOD_HM (CHAR) : 수정시간 (HH24MI)
    private int regNo;         // REG_NO (NUMBER) : 등록자 번호
    private int modNo;         // MOD_NO (NUMBER) : 수정자 번호
}