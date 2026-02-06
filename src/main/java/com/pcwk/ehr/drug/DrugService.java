/**
 * 
 */
package com.pcwk.ehr.drug;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <pre>
 * Class Name : drugService
 * Description :
 *
 * Modification Information
 * 수정일        수정자     수정내용
 * ----------  --------  ---------------------------
 * 2026. 2. 6.  user   최초 생성
 * </pre>
 *
 * @author user
 * @since 2026. 2. 6.
 */
@Service
public class DrugService {

	@Autowired
	private DrugMapper drugMapper;



	// 주말 운영 여부를 텍스트로 변환하는 로직 예시
	public String getHolidayStatus(String holidayCode) {
		if ("Y".equals(holidayCode)) {
			return "주말/공휴일 운영함";
		} else {
			return "주말/공휴일 휴무";
		}
	}
}
