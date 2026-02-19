package com.pcwk.ehr.comment;

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
public class CommentVO extends DTO {

    private int    cmtNo;        // 댓글 고유번호
    private String cmtCn;        // 댓글 내용
    private int    cmtStarng;    // 댓글 별점
    private int    cmtClsf;      // 댓글 구분
    private String cmtHideYn;    // 댓글 히든처리
    private int    tripCourseNo; // 여행지,코스 고유번호
    private String cmtReg;       // 댓글 등록시간
    private String cmtMod;       // 댓글 수정시간
    private int    regNo;        // 등록자 고유번호
    private int    modNo;        // 수정자 고유번호
}
