package com.pcwk.ehr.trip;

public class TripDTO {
	/*
	 * 이전 존재 유무: boolean (o)
	 * 
	 * 다음 존재 유무: boolean (o)
	 * 
	 * 시작 페이지 번호( 1,11...) :int(o) 끝 페이지 번호 (10,20...) :int(o)
	 * 
	 * 총글수:X 페이지 묶음 크기: 10 (o)
	 */
	private int no;// 글번호

	private String searchDiv;// 검색구분
	private String searchWord;// 검색어
	
	private String myPageYn;//Y / N
	private String loginUserId;//로그인 사용자ID
	// ---Paging-----------------------------

	private int pageNo; // 페이지 번호
	private int pageSize;// 페이지 사이즈
	private int totalCnt;// 총 글수

	private int startNo; // 시작 페이지 번호( 1,11...)
	private int endNo; // 끝 페이지 번호 (10,20...)

	private boolean pre; // 이전 존재 유무
	private boolean next;// 다음 존재 유무

	public TripDTO() {
		super();
	}

	public TripDTO(int pageNo, int pageSize, int totalCnt) {
		super();
		this.pageNo = pageNo;
		this.pageSize = pageSize;
		this.totalCnt = totalCnt;

		int blockSize = 10;// 페이지 묶음 크기

		// 끝 페이지 번호 (10,20...): Math.ceil(4.2) -> 5
		this.endNo = (int) Math.ceil(pageNo / (double) blockSize) * blockSize;

		// 시작 페이지 번호( 1,11...)
		this.startNo = endNo - blockSize + 1;

		// 실제 페이지 번호
		int realEnd = (int) Math.ceil(totalCnt / (double) pageSize);

		if (endNo > realEnd) {
			endNo = realEnd;
		}

		// 이전 존재 유무
		this.pre = startNo > 1;

		// 다음 존재 유무
		this.next = endNo < realEnd;

	}

	public int getStartNo() {
		return startNo;
	}

	public void setStartNo(int startNo) {
		this.startNo = startNo;
	}

	public int getEndNo() {
		return endNo;
	}

	public void setEndNo(int endNo) {
		this.endNo = endNo;
	}

	public boolean isPre() {
		return pre;
	}

	public void setPre(boolean pre) {
		this.pre = pre;
	}

	public boolean isNext() {
		return next;
	}

	public void setNext(boolean next) {
		this.next = next;
	}

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

	public int getPageSize() {
		return pageSize;
	}

	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	public int getPageNo() {
		return pageNo;
	}

	public void setPageNo(int pageNo) {
		this.pageNo = pageNo;
	}

	public int getNo() {
		return no;
	}

	public void setNo(int no) {
		this.no = no;
	}

	public int getTotalCnt() {
		return totalCnt;
	}

	public void setTotalCnt(int totalCnt) {
		this.totalCnt = totalCnt;
	}

	
	public String getMyPageYn() {
		return myPageYn;
	}

	public void setMyPageYn(String myPageYn) {
		this.myPageYn = myPageYn;
	}

	public String getLoginUserId() {
		return loginUserId;
	}

	public void setLoginUserId(String loginUserId) {
		this.loginUserId = loginUserId;
	}

	@Override
	public String toString() {
		return "DTO [no=" + no + ", searchDiv=" + searchDiv + ", searchWord=" + searchWord + ", myPageYn=" + myPageYn
				+ ", loginUserId=" + loginUserId + ", pageNo=" + pageNo + ", pageSize=" + pageSize + ", totalCnt="
				+ totalCnt + ", startNo=" + startNo + ", endNo=" + endNo + ", pre=" + pre + ", next=" + next + "]";
	}





}
