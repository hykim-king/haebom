package com.pcwk.ehr.support;
import com.pcwk.ehr.cmn.DTO;
import lombok.*;

import java.time.LocalDateTime;

@Data // Getter, Setter, RequiredArgsConstructor, ToString, EqualsAndHashCode를 한 번에 다 만들어줌.
@AllArgsConstructor // 모든 필드(변수)를 파라미터로 받는 생성자를 자동으로 만듬.
@NoArgsConstructor // 파라미터가 없는 기본 생성자를 자동으로 만듬.
@EqualsAndHashCode(callSuper = true)
public class SupportVO extends DTO{

	public int supId;						// 문의사항 고유번호
	public String supContent;				// 문의사항 내용
	public String supAnswer;				// 문의사항 답변 내용
	public LocalDateTime supAnswerReg;		// 문의사항 답변일
	public LocalDateTime regDt;				// 문의사항 등록일
	public int regId;						// 문의사항 등록자
}
