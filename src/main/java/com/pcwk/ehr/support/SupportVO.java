package com.pcwk.ehr.support;
import com.pcwk.ehr.cmn.DTO;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class SupportVO extends DTO{

	public int sup_id;					// 문의사항 고유번호
	public String sup_content;			// 문의사항 내용
	public LocalDateTime sup_reg;		// 문의사항 등록일
	public String answer;				// 문의사항 답변 내용
	public LocalDateTime answer_dt; 	// 문의사항 답변 시간
	public int user_sid;				// 사용자 고유번호

}
