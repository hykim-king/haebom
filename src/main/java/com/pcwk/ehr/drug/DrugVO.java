
package com.pcwk.ehr.drug;
import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * <pre>
 * Class Name : drugVO
 * Description : 약국 VO
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
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class DrugVO extends DTO {

    private Long    dsId;      //약국 고유번호
    private String dsName;    //약국명
    private String dsAdd;     //약국 주소
    private String dsTel;     //약국 전화번호
    private double dsMapx;    //약국 위도
    private double dsMapy;    //약국 경도
    private String dsOpen;    //평일 오픈시간
    private String dsClose;   //평일 닫는 시간
    private String dsHoliday; //주말 운영 여부
	
	
}