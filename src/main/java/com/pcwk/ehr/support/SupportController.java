package com.pcwk.ehr.support;

import com.pcwk.ehr.attachfile.AttachFileMapper;
import com.pcwk.ehr.domain.AttachFileVO;
import com.pcwk.ehr.domain.SupportVO;
import com.pcwk.ehr.domain.UserVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Log4j2
@Controller
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final AttachFileMapper attachFileMapper;

    @GetMapping("")
    public String support(@RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                          Model model, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        String userMngrYn = "N";

        if (loginUser != null) {
            userMngrYn = (loginUser.getUserMngrYn() != null) ? loginUser.getUserMngrYn().trim().toUpperCase() : "N";
            if ("N".equals(userMngrYn) && "ss@s".equals(loginUser.getUserEmlAddr())) {
                userMngrYn = "Y";
            }
        }

        int pageSize = 10;
        SupportVO searchVO = new SupportVO();
        searchVO.setPageNo(pageNo);
        searchVO.setPageSize(pageSize);

        if (loginUser == null) {
            searchVO.setFilterRegNo(-1);
        } else if ("N".equals(userMngrYn)) {
            if (loginUser.getUserNo() == null) {
                int recoveredNo = supportService.getUserIdByEmail(loginUser.getUserEmlAddr());
                if (recoveredNo > 0) loginUser.setUserNo(recoveredNo);
            }
            searchVO.setFilterRegNo(loginUser.getUserNo());
        }

        List<SupportVO> list = supportService.doRetrieve(searchVO);

        // 첨부파일 Map 조회
        Map<Integer, List<AttachFileVO>> fileMap = new HashMap<>();
        if (list != null) {
            for (SupportVO item : list) {
                AttachFileVO fileSearchVO = new AttachFileVO();
                fileSearchVO.setBoardClsf("support");
                fileSearchVO.setBoardId(item.getSupNo());
                List<AttachFileVO> fileList = attachFileMapper.getFileList(fileSearchVO);
                if (fileList != null && !fileList.isEmpty()) {
                    fileMap.put(item.getSupNo(), fileList);
                }
            }
        }

        int totalCount = (list != null && !list.isEmpty()) ? list.get(0).getTotalCnt() : 0;
        int totalPages = (int) Math.ceil((double) totalCount / pageSize);
        int startPage  = ((pageNo - 1) / 5) * 5 + 1;
        int endPage    = Math.min(startPage + 4, totalPages);

        model.addAttribute("list", list);
        model.addAttribute("fileMap", fileMap);
        model.addAttribute("loginUser", loginUser);
        model.addAttribute("userMngrYn", userMngrYn);
        model.addAttribute("currentPage", pageNo);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("totalPages", totalPages);

        log.info("지원 페이지 접속 - 유저: {}, 권한: {}, 리스트: {}건",
                (loginUser != null ? loginUser.getUserEmlAddr() : "비로그인"), userMngrYn, totalCount);

        return "support/support";
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("filePathNm") String filePathNm,
                                             @RequestParam("fileNm") String fileNm) {
        try {
            File file = new File(filePathNm);
            if (!file.exists()) return ResponseEntity.notFound().build();

            Resource resource = new FileSystemResource(file);
            String encodedName = URLEncoder.encode(fileNm, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename*=UTF-8''" + encodedName)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ 파일 처리를 ServiceImpl에 위임 (Notice와 동일한 구조)
    @PostMapping("/doSave.do")
    @ResponseBody
    public String doSave(@RequestParam("supCn") String supCn,
                         @RequestParam(value = "files", required = false) List<MultipartFile> files,
                         HttpSession session) {

        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null) return "로그인 정보가 없습니다.";

        if ("Y".equals(loginUser.getUserMngrYn()) || "ss@s".equals(loginUser.getUserEmlAddr())) {
            return "관리자 계정으로는 문의글 작성이 불가능합니다.";
        }

        if (loginUser.getUserNo() == null) {
            int recoveredNo = supportService.getUserIdByEmail(loginUser.getUserEmlAddr());
            if (recoveredNo > 0) loginUser.setUserNo(recoveredNo);
            else return "유저 정보를 찾을 수 없습니다.";
        }

        SupportVO inVO = new SupportVO();
        inVO.setSupCn(supCn);
        inVO.setRegNo(loginUser.getUserNo());

        // ✅ 파일 처리를 ServiceImpl에 위임
        int result = ((SupportServiceImpl) supportService).doSave(inVO, files);
        return String.valueOf(result);
    }

    @PostMapping("/doUpdate.do")
    @ResponseBody
    public String doUpdate(@RequestBody SupportVO inVO, HttpSession session) {
        UserVO loginUser = (UserVO) session.getAttribute("user");
        if (loginUser == null || (!"Y".equals(loginUser.getUserMngrYn()) && !"ss@s".equals(loginUser.getUserEmlAddr()))) {
            return "관리자만 답변 등록이 가능합니다.";
        }
        return String.valueOf(supportService.doUpdate(inVO));
    }

    @PostMapping("/doDelete.do")
    @ResponseBody
    public String doDelete(SupportVO inVO) {
        return String.valueOf(supportService.doDelete(inVO));
    }

    @PostMapping("/doSelectOne.do")
    @ResponseBody
    public SupportVO doSelectOne(@RequestBody SupportVO inVO) {
        return supportService.doSelectOne(inVO);
    }
}