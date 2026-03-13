/**
 * 
 */
package com.pcwk.ehr.course;

import com.pcwk.ehr.course.AiCourseReq;
import com.pcwk.ehr.course.AiCourseRes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class AiCourseService {

    private final WebClient fastApiWebClient;

    public AiCourseRes recommendCourse(AiCourseReq req) {
        try {
            AiCourseRes response = fastApiWebClient.post()
                    .uri("/course/recommend")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(AiCourseRes.class)
                    .block();

            if (response == null) {
                throw new RuntimeException("FastAPI 응답이 null 입니다.");
            }

            applyRandomFood(response);
            
            return response;

        } catch (Exception e) {
            throw new RuntimeException("AI 여행 코스 추천 호출 실패: " + e.getMessage(), e);
        }
    }
    
    
    
    //음식점 랜덤 선택 로직
    private void applyRandomFood(AiCourseRes res){

        Random random = new Random();

        for(AiCourseItemDto item : res.getCourse()){

            List<FoodCandidateDTO> foods = item.getFood_candidates();

            if(foods == null || foods.isEmpty()){
                continue;
            }

            FoodCandidateDTO selected =
                    foods.get(random.nextInt(foods.size()));

            item.setSelected_food(selected);
        }

    }
    
}