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
public class ReportVO extends DTO {

    private int    repNo;       // 신고 고유번호
    private String repCn;       // 신고 내용
    private int    repClsf;     // 신고 사유
    private int    cmtNo;       // 댓글 고유번호
    private String repReg;      // 신고 등록일
    private String repRegHm;    // 신고 등록 시간
    private int    regNo;       // 신고자 고유번호
    private String repProcDt;   // 처리 완료 날짜
    private String repProcHm;   // 처리 완료 시간
    private String repStatYn;   // 처리 여부
}
