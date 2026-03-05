package com.pcwk.ehr.trip;

import java.util.List;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;

import lombok.RequiredArgsConstructor;
import com.pcwk.ehr.domain.TripVO;

import jakarta.servlet.http.HttpSession;

import com.pcwk.ehr.area.AreaService; 
import com.pcwk.ehr.domain.AreaVO;
import com.pcwk.ehr.domain.TripDetailVO;


@Controller
@RequestMapping("/trip")
@RequiredArgsConstructor
public class TripController {
    final Logger log = LogManager.getLogger(getClass());

    private final TripService tripService;
    private final AreaService areaService; 
    private final TripDetailService tripDetailService;

    /**
     * 1. 여행지 목록 화면 (초기 로딩용)
     */
    @GetMapping("/trip")
    public String tripList(TripVO tripVO, Model model) {
        // 초기 로딩 시 기본값 설정
        if (tripVO.getPageNo() == 0) tripVO.setPageNo(1);
        if (tripVO.getPageSize() == 0) tripVO.setPageSize(10);

        // 초기 리스트 조회
        List<TripVO> list = tripService.doRetrieve(tripVO);
        
        // 데이터가 없을 경우를 대비한 totalCnt 처리
        int totalCnt = (list != null && !list.isEmpty()) ? list.get(0).getTotalCnt() : 0;

        model.addAttribute("list", list);
        model.addAttribute("totalCnt", totalCnt);
        model.addAttribute("vo", tripVO);

        return "trip/trip";
    }

/**
 * 2. 여행지 상세 화면
 */
@GetMapping("/trip_view")
public String tripView(TripVO tripVO, Model model, HttpSession session) {
    
    Integer userNo = (Integer) session.getAttribute("userNo");
    
    // 1. 기본 정보 조회 (제목, 주소, 이미지 경로 등)
    TripVO outVO = tripService.upDoSelectOne(tripVO);
    
    // 2. 상세 정보 조회 (전화번호, 상세소개 등)
    // TripDetailVO 객체를 생성하고 ID를 세팅하여 조회합니다.
    TripDetailVO detailSearch = new TripDetailVO();
    detailSearch.setTripContsId(tripVO.getTripContsId());
    
    // TripDetailService에서 doSelectOne을 호출
    TripDetailVO detailVO = tripDetailService.doSelectOne(detailSearch);

    if (outVO != null) {
        model.addAttribute("vo", outVO);           // 기본 정보는 "vo"로 전달
    }
    
    if (detailVO != null) {
        model.addAttribute("detailVo", detailVO); // 상세 정보는 "detailVo"로 전달
    }
    model.addAttribute("userNo", userNo);

    return "trip/trip_view";
}

    /**
     * 3. 여행지 목록 API (JS fetch 연동용)
     */
    @GetMapping("/doRetrieveJson.do")
    @ResponseBody 
    public List<TripVO> doRetrieveJson(TripVO tripVO) {
        if (tripVO.getPageNo() == 0) tripVO.setPageNo(1);
        if (tripVO.getPageSize() == 0) tripVO.setPageSize(10);

        return tripService.doRetrieve(tripVO);
    }

    /**
     * 4. 시도 목록 API
     * trip.js의 fetchAreaTags()에서 호출
     */
    @GetMapping("/getCtpvList.do")
    @ResponseBody
    public List<AreaVO> getCtpvList() {
        return areaService.getCtpvList();
    }

    /**
     * 5. 특정 시도의 시군구 목록 API
     * trip.js의 handleCityClick()에서 호출
     */
    @GetMapping("/getGnguList.do")
    @ResponseBody
    public List<AreaVO> getGnguList(AreaVO areaVO) {
        // areaVO에 담긴 tripCtpv 값을 사용하여 조회
        return areaService.getGnguList(areaVO);
    }

    /**
 * 6. 실제 사용 중인 테마 태그 목록 조회 (중복 제거)
 */
    @GetMapping("/getTripTags.do")
    @ResponseBody
    public List<String> getTripTags() {

    return tripService.getDistinctTags(); 
    }

}