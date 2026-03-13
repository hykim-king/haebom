package com.pcwk.ehr.admin;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final AdminMapper adminMapper;

	@Override
	public List<Map<String, Object>> getMemberRegistMonth(Map<String, Object> param) {
		return adminMapper.getMemberRegistMonth(param);
	}

	@Override
	public List<Map<String, Object>> getMemberRegistDay(Map<String, Object> param) {
		return adminMapper.getMemberRegistDay(param);
	}

	@Override
	public List<Map<String, Object>> getReportCount(Map<String, Object> param) {
		return adminMapper.getReportCount(param);
	}

}
