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
public class AttachFileVO extends DTO {

    private int fileNo; // 파일 고유번호
    private String fileClsf; // 파일 분류 (1: exel, 2: img, 3: hwp, 4 : 기타 )
    private String filePathNm; // 파일 경로명
    private String fileNm; // 파일명
    private String fileReg; // 파일 등록날짜
    private String fileRegHm; // 파일 등록시간
    private String boardClsf; // 게시판 분류 (comment : 댓글, notice : 공지사항, 여행지 상세 : trip, 문의사항 : support)
    private int boardId; // 게시판 고유번호
}
