package com.pcwk.ehr.admin;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.trip.TripMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
	
	private final AdminMapper adminMapper;
	
	@Override
	public List<UserVO> doRetrieve(DTO param) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int doUpdate(UserVO param) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int doDelete(UserVO param) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public UserVO doSelectOne(UserVO param) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int doSave(UserVO param) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public List<Map<String, Object>> getMemberRegistMonth(Map<String, Object> param) {
		List<Map<String, Object>> list = adminMapper.getMemberRegistMonth(param);
	    return list;
	}

	@Override
	public List<Map<String, Object>> getMemberRegistDay(Map<String, Object> param) {
		List<Map<String, Object>> list = adminMapper.getMemberRegistDay(param);
	    return list;
	}

}
