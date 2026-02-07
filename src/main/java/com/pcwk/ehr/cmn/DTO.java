package com.pcwk.ehr.cmn;

public class DTO {

    private int no; // 글 번호
    private int totalCnt;// 총 글수

    private int pageNo; // 페이지 번호

    private int pageSize; // 페즈지 사이

    private String searchDiv;
    private String searchWord;

    private String loginUserId;// sessionId

    private String htmlContent;

    public String getSearchDiv() {
        return searchDiv;
    }

    public void setSearchDiv(String searchDiv) {
        this.searchDiv = searchDiv;
    }

    public String getSearchWord() {
        return searchWord;
    }

    public void setSearchWord(String searchWord) {
        this.searchWord = searchWord;
    }

    public int getPageNo() {
        return pageNo;
    }

    public void setPageNo(int pageNo) {
        this.pageNo = pageNo;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    /**
     * @return the htmlContent
     */
    public String getHtmlContent() {
        return htmlContent;
    }

    /**
     * @param htmlContent the htmlContent to set
     */
    public void setHtmlContent(String htmlContent) {
        this.htmlContent = htmlContent;
    }

    /**
     * @return the loginUserId
     */
    public String getLoginUserId() {
        return loginUserId;
    }

    /**
     * @param loginUserId the loginUserId to set
     */
    public void setLoginUserId(String loginUserId) {
        this.loginUserId = loginUserId;
    }

    /**
     * Constructor
     *
     * @param
     */
    public DTO() {
        super();
    }

    /**
     * @return the no
     */
    public int getNo() {
        return no;
    }

    /**
     * @param no the no to set
     */
    public void setNo(int no) {
        this.no = no;
    }

    /**
     * @return the totalCnt
     */
    public int getTotalCnt() {
        return totalCnt;
    }

    /**
     * @param totalCnt the totalCnt to set
     */
    public void setTotalCnt(int totalCnt) {
        this.totalCnt = totalCnt;
    }

    @Override
    public String toString() {
        return "DTO{" +
                "no=" + no +
                ", totalCnt=" + totalCnt +
                ", pageNo=" + pageNo +
                ", pageSize=" + pageSize +
                ", searchDiv='" + searchDiv + '\'' +
                ", searchWord='" + searchWord + '\'' +
                ", loginUserId='" + loginUserId + '\'' +
                ", htmlContent='" + htmlContent + '\'' +
                '}';
    }
}
