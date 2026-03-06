package com.pcwk.ehr.thema;

import com.pcwk.ehr.domain.TripVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping("/thema")
public class ThemaController {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private ThemaService themaService;

    @GetMapping("")
    public String thema(){
        return "thema/thema";
    }

    private TripVO defaultSetting(TripVO searchVO) {
        if (searchVO == null) {
            searchVO = new TripVO();
        }
        // tripTag가 null이거나 비어있으면 "0"으로 세팅
        if (searchVO.getTripTag() == null || searchVO.getTripTag().trim().isEmpty()) {
            searchVO.setTripTag("0");
        }
        if (searchVO.getPageNo() <= 0) {
            searchVO.setPageNo(1);
        }
        if (searchVO.getPageSize() <= 0) {
            searchVO.setPageSize(12);
        }
        
        if (searchVO.getSearchWord() == null || searchVO.getSearchWord().trim().isEmpty()) {
            searchVO.setSearchWord("default");
        }
        
        return searchVO;
    }

    @PostMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripVO> doRetrievePost(@RequestBody(required = false) TripVO searchVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doRetrievePost() (JSON)  │");
        log.info("└──────────────────────────┘");
        searchVO = defaultSetting(searchVO);
        
        log.info("검색조건(정렬포함): {}", searchVO);

        List<TripVO> list = themaService.doRetrieve(searchVO);
        if (list == null) return Collections.emptyList();
        
        log.info("조회된 목록 개수: {}", list.size());
        return list;
    }

    @GetMapping(value = "/doRetrieve.do", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<TripVO> doRetrieveGet(TripVO searchVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doRetrieveGet() (Query)  │");
        log.info("└──────────────────────────┘");
        searchVO = defaultSetting(searchVO);
        
        log.info("검색조건(정렬포함): {}", searchVO);

        List<TripVO> list = null;
        try {
            list = themaService.doRetrieve(searchVO);
        } catch (Exception e) {
            log.error("Service 호출 중 에러 발생: {}", e.getMessage());
            e.printStackTrace(); 
        }

        if (list == null) return Collections.emptyList();
        
        log.info("조회된 목록 개수: {}", list.size());
        return list;
    }
}