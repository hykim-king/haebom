package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
public class TripCourseVO extends DTO {

    /** DB 컬럼 */
    private int courseNo;
    private String courseNm;
    private String courseInfo;
    private String coursePathNm;
    private String courseDstnc;
    private String courseReqTm;

    /** 조회 결과/화면 제어용 */
    private int totalCnt; // COUNT(*) OVER / CROSS JOIN COUNT 결과 수신용
    private String hashTag; // 추후 해시태그 필터용
    private String orderType; // 최신순용
    private int courseInqCnt;

    
    /** 코스 소속 여행지 목록 (지도 핀 / th:each 사용) */
    private List<CourseTripVO> courseItems;

    private int tripContsId; // 여행지 콘텐츠 ID
    private String tripdtlInfo; // 여행지 상세 정보
    private String tripdtlDyoffYmd; // 휴무일
    private String tripdtlPrkPsblty; // 주차 가능 여부
    private String tripdtlOperHr; // 운영 시간
    private String tripdtlTel; // 전화번호
    private String tripdtlStroller; // 유모차 대여 여부
    private String tripdtlPet; // 반려동물 동반 여부
    private String tripdtlCrg; // 이용 요금
    private String tripdtlHmpg; // 홈페이지 주소
    private String tripdtlReg; // 등록일
    private String tripdtlMod; // 수정일
}