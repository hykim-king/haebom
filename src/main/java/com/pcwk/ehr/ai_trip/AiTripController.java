package com.pcwk.ehr.ai_trip;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.pcwk.ehr.domain.TripVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/ai_trip")
@RequiredArgsConstructor // 생성자 주입을 위해 필수
public class AiTripController {
    
    private final Logger log = LogManager.getLogger(getClass());

    private final AiTripService aiTripService; // 우리가 만든 AI 전용 서비스
    // private final GptService gptService;    // 곧 만들 파이썬 연동 서비스

    @GetMapping("/recommend")
    public String aiRecommend(@RequestParam(value = "userInput", required = false) String userInput, Model model) {
        log.info("┌──────────────────────────────────┐");
        log.info("│ AI Recommendation Start          │");
        log.info("│ Input: {}                        ", userInput);
        
        List<String> recommendedNames = null;

        // 1. 사용자 입력이 있는 경우 (AI 서버 연동 지점)
        if (userInput != null && !userInput.trim().isEmpty()) {
            
        }

        // 2. DB에서 데이터 조회 
        // recommendedNames가 null이면 Mapper에서 랜덤으로 3개를 가져옴
        List<TripVO> list = aiTripService.getSpotsByNames(recommendedNames);

        // 3. 뷰(Thymeleaf)로 전달
        model.addAttribute("list", list);
        model.addAttribute("userInput", userInput);
        model.addAttribute("totalCnt", (list != null) ? list.size() : 0);
        
        log.info("│ Result Count: {}                 ", (list != null ? list.size() : 0));
        log.info("└──────────────────────────────────┘");

        return "ai/ai_trip";
    }
}