package com.pcwk.ehr.support;
import com.pcwk.ehr.cmn.DTO;
import lombok.*;

import java.time.LocalDateTime;

@Data // Getter, Setter, RequiredArgsConstructor, ToString, EqualsAndHashCode를 한 번에 다 만들어줌.
@AllArgsConstructor // 모든 필드(변수)를 파라미터로 받는 생성자를 자동으로 만듬.
@NoArgsConstructor // 파라미터가 없는 기본 생성자를 자동으로 만듬.
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class SupportVO extends DTO{

	public int sup_id;					// 문의사항 고유번호
	public String sup_content;			// 문의사항 내용
	public LocalDateTime sup_reg;		// 문의사항 등록일
	public String answer;				// 문의사항 답변 내용
	public LocalDateTime answer_dt; 	// 문의사항 답변 시간
	// public int user_sid;				// 사용자 고유번호
}
