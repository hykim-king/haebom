package com.pcwk.ehr.cmn;

import java.util.List;
import java.util.Map;

public interface WorkDiv<T> {

	/**
	 * 
	 * Description :
	 * 회원목록 조회 
	 * @param Map<String,String> 검색조건
	 * @return List<MemberVO>
	 * @throws
	 */
	List<T> doRetrieve(Map<String, String> param);

	/**
	 * 
	 * Description :
	 * 단건수정
	 * @param  T 
	 * @return 성공(1)/실패(0)
	 * @throws
	 */
	int doUpdate(T param);

	/**
	 * 
	 * Description :
	 * 단건 삭제 
	 * @param T
	 * @return 성공(1)/실패(0)
	 * @throws
	 */
	int doDelete(T param);

	/**
	 * 
	 * Description : 단건조회
	 * @param T
     * 
	 */
	T doSelectOne(T param);

	/**
	 * 단건 등록
	 * @param param
	 * @return 성공(1)/실패(0)
	 */
	int doSave(T param);

}