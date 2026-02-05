package com.pcwk.ehr.notice;
import com.pcwk.ehr.cmn.DTO;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class NoticeVO extends DTO{

	public int notice_sid;					// 공지사항 고유번호
	public int notice_title;				// 공지사항 제목
	public String notice_content;			// 공지사항 내용
	public LocalDateTime notice_reg;		// 공지사항 등록일
	public LocalDateTime notice_mog;		// 공지사항 수정일
	public int user_sid;					// 사용자 고유번호
}
