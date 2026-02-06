package com.pcwk.ehr.course;

import com.pcwk.ehr.cmn.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseVO extends DTO {
    
    private int    courseId;       // 여행코스 고유번호 (PK)
    private String courseName;     // 여행코스 이름
    private String courseOverview; // 여행코스 정보
    private String courseImg;      // 여행코스 이미지
    private String courseDistance; // 여행코스 거리
    private String courseTasktime; // 여행코스 소요시간
    private int    tripId;         // 여행지 고유번호 (FK)
    
}