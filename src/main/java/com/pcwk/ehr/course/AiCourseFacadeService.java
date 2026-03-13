/**
 * 
 */
package com.pcwk.ehr.course;

import com.pcwk.ehr.domain.TripCourseDetailVO;
import com.pcwk.ehr.course.AiCourseItemDto;
import com.pcwk.ehr.course.AiCourseReq;
import com.pcwk.ehr.course.AiCourseRes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiCourseFacadeService {

    private final AiCourseService aiCourseService;
    private final AiTripCourseMapper tripCourseMapper;

    public Map<String, Object> getAiCoursePageData(AiCourseReq req) {

        AiCourseRes aiRes = aiCourseService.recommendCourse(req);

        List<Integer> tripIds = aiRes.getTripIds();
        if (tripIds == null || tripIds.isEmpty()) {
            throw new RuntimeException("AI가 추천한 여행지 코드가 없습니다.");
        }

        List<TripCourseDetailVO> dbTrips = tripCourseMapper.findTripsByContsIds(tripIds);

        Map<Integer, TripCourseDetailVO> dbTripMap = dbTrips.stream()
                .collect(Collectors.toMap(
                        TripCourseDetailVO::getTripContsId,
                        vo -> vo,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        List<TripCourseDetailVO> orderedCourseItems = new ArrayList<>();

        List<AiCourseItemDto> aiCourse = aiRes.getCourse();
        for (int i = 0; i < aiCourse.size(); i++) {
            AiCourseItemDto aiItem = aiCourse.get(i);

            TripCourseDetailVO dbVo = dbTripMap.get(aiItem.getTripContsId());
            if (dbVo == null) {
                continue;
            }

            dbVo.setCourseOrder(i + 1);
            dbVo.setDay(aiItem.getDay());
            dbVo.setTime(aiItem.getTime());
            dbVo.setReason(aiItem.getReason());

            dbVo.setSelectedFood(aiItem.getSelected_food());
            
            orderedCourseItems.add(dbVo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("aiRes", aiRes);
        result.put("courseItems", orderedCourseItems);

        return result;
    }
}