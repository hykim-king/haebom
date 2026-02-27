package com.pcwk.ehr.trip;
import java.util.List;


import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.ui.Model;

import lombok.RequiredArgsConstructor;
import com.pcwk.ehr.domain.TripVO;


@Controller
@RequestMapping("/trip")
@RequiredArgsConstructor
public class TripController {
    final Logger log = LogManager.getLogger(getClass());

    private final TripService tripService;
    /* 여행지 목록 조회 */
    @GetMapping("/trip_list")
    public String tripList( TripVO tripVO, Model model) {

        int pageGroup = 10;

        // 값이 0(초기값)일 때만 1과 10으로 세팅하고, 값이 넘어오면 그 값을 유지합니다.
        if (tripVO.getPageNo() == 0) tripVO.setPageNo(1);
        if (tripVO.getPageSize() == 0) tripVO.setPageSize(10);

        List<TripVO> list = tripService.doRetrieve(tripVO);

        int pageNo = tripVO.getPageNo();
        int pageSize = tripVO.getPageSize();

        String viewName = "trip/trip_list";

        model.addAttribute("list", list);

        // 총글수
        int totalCnt = (list.size() > 0) ? list.get(0).getTotalCnt() : 0;

        // 전체페이지 (int)Math.ceil((double)1004/10)
        int totalPage = (int) Math.ceil((double) totalCnt / pageSize);

        // 시작페이지
        int startPage = ((pageNo - 1) / pageGroup) * pageGroup + 1;

        // 종료페이지
        int endPage = Math.min(startPage + pageGroup - 1, totalPage);

        model.addAttribute("list", list);
        model.addAttribute("vo", tripVO); // 검색어와 현재 페이지 정보가 들어있음
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("totalPage", totalPage);

        return viewName;
    }
    /* 여행지 상세조회 */
    @GetMapping("/trip_view")
    public String tripView(TripVO tripVO, Model model) {

        // 1. 단건 조회 서비스 호출 및 조회수 1 증가(보통 doSelectOne 또는 doSelect)
        TripVO outVO = tripService.upDoSelectOne(tripVO);

        // 2. 조회 결과가 있을 경우 화면에 전달
        if (outVO != null) {
            model.addAttribute("vo", outVO);
        }

        // 3. 이동할 뷰 이름 (상세보기 페이지)
        return "trip/trip_view";
    }



}
