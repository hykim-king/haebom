package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SupportVO extends DTO {

    private int supNo; // SUP_NO (NUMBER) : 문의사항 고유번호
    private String supCn; // SUP_CN (NVARCHAR2) : 문의사항 내용
    private String supAnsCn; // SUP_ANS_CN (NVARCHAR2) : 문의사항 답변 내용
    private String supReg; // SUP_REG (CHAR(8)) : 문의사항 등록일 (YYYYMMDD)
    private String supRegHm; // SUP_REG_HM (CHAR(4)) : 문의사항 등록시간 (HH24MI)
    private String supAnsReg; // SUP_ANS_REG (CHAR(8)) : 문의사항 답변일 (YYYYMMDD)
    private String supAnsRegHm; // SUP_ANS_REG_HM (CHAR(4)) : 문의사항 답변시간 (HH24MI)
    private int regNo; // REG_NO (NUMBER) : 등록자 고유번호
    private String supYn; // SUP_YN (CHAR) : 문의사항 처리상태 (기본값 'N')
}