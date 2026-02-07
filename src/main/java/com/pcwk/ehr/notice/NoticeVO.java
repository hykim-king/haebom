package com.pcwk.ehr.notice;
import com.pcwk.ehr.cmn.DTO;
import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Data // Getter, Setter, RequiredArgsConstructor, ToString, EqualsAndHashCode를 한 번에 다 만들어줌.
@AllArgsConstructor // 모든 필드(변수)를 파라미터로 받는 생성자를 자동으로 만듬.
@NoArgsConstructor // 파라미터가 없는 기본 생성자를 자동으로 만듬.
@EqualsAndHashCode(callSuper = true)
public class NoticeVO extends DTO{

	public int noticeId;					// 공지사항 고유번호
	public String noticeTitle;				// 공지사항 제목
	public String noticeContent;			// 공지사항 내용
	public LocalDateTime regDt;				// 공지사항 등록일
	public int regId;						// 공지사항 등록자
	public LocalDateTime modDt;				// 공지사항 수정일

}
