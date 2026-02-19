package com.pcwk.ehr.support;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // Getter, Setter, RequiredArgsConstructor, ToString, EqualsAndHashCode를 한 번에 다 만들어줌.
@AllArgsConstructor // 모든 필드(변수)를 파라미터로 받는 생성자를 자동으로 만듬.
@NoArgsConstructor // 파라미터가 없는 기본 생성자를 자동으로 만듬.
@EqualsAndHashCode(callSuper = true)
public class SupportVO extends DTO {

    public int supNo;                        // 문의사항 고유번호
    public String supCn;                    // 문의사항 내용
    public String supAnsCn;                    // 문의사항 답변 내용
    public LocalDateTime supReg;            // 문의사항 등록일
    public LocalDateTime supAnsReg;            // 문의사항 답변일
    public int regNo;                        // 등록자 고유번호
    public String supYn;                    // 문의사항 처리상태
}
