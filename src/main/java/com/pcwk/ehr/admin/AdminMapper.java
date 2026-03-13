package com.pcwk.ehr.admin;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminMapper {

	List<Map<String, Object>> getMemberRegistMonth(Map<String, Object> param);

	List<Map<String, Object>> getMemberRegistDay(Map<String, Object> param);

	List<Map<String, Object>> getReportCount(Map<String, Object> param);

}
