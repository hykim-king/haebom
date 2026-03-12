package com.pcwk.ehr.admin;

import java.util.List;
import java.util.Map;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.UserVO;

public interface AdminService extends WorkDiv<UserVO> {
	
	List<Map<String, Object>> getMemberRegistMonth(Map<String, Object> param);
	
	List<Map<String, Object>> getMemberRegistDay(Map<String, Object> param);

}
