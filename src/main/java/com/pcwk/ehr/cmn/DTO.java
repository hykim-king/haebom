package com.pcwk.ehr.cmn;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.NoArgsConstructor;

@Getter
@Setter
@ToString
@NoArgsConstructor

public class DTO {
    private int no; // 글 번호
    private int totalCnt;// 총 글수
    private int pageNo;      // 페이지 번호
    private int pageSize;    // 페이지 크기
    private String loginUserId;// sessionId
    private String htmlContent;
    private String searchDiv; // 검색 구분
    private String searchWord; // 검색어
}