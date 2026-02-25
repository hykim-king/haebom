package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class RelationVO extends DTO {

    private int relNo; // 관계 고유 번호
    private int relClsf; // 관계 분류 (10: 찜한 여행지, 20: 여행 완료한 여행지)
    private int userNo; // 사용자 고유번호
    private Integer courseNo; // 여행코스 고유번호
    private Integer tripContsId; // 여행지 콘텐츠아이디
}
