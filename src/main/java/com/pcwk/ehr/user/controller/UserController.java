package com.pcwk.ehr.user.controller;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // 메인 페이지 화면 이동 (가입/로그인 성공 후 리다이렉트 될 곳)
    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody UserVO vo, HttpSession session) {
        try {
            UserVO loginUser = userService.loginDetail(vo.getUserEmlAddr(), vo.getUserEnpswd());
            if (loginUser != null) {
                session.setAttribute("user", loginUser);
                System.out.println("로그인 성공: " + loginUser); // 디버깅 로그 추가
                return ResponseEntity.ok().body("{\"success\": true}");
            } else {
                return ResponseEntity.status(401).body("{\"success\": false, \"message\": \"Invalid credentials\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"success\": false, \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // // 메인 페이지 이동 (templates/main/main_Org.html 호출)
    // @GetMapping("/main")
    // public String mainPage() {
    // return "main/main";
    // }

    @GetMapping("/signup")
    public String signUpForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/signup"; // templates/user/signup.html 호출
    }

    // 2. 로그인 페이지 이동 (추가된 부분)
    @GetMapping("/login")
    public String loginForm(Model model) {
        // 폼 객체 바인딩을 위해 빈 UserVO를 넘겨줍니다.
        model.addAttribute("userVO", new UserVO());
        return "user/login";
    }

    @PostMapping("/signup")
    @ResponseBody // AJAX 응답을 위해 추가
    public ResponseEntity<?> signUp(@RequestBody UserVO vo) { // @ModelAttribute 대신 @RequestBody 사용
        try {
            userService.signUp(vo);
            return ResponseEntity.ok().body("{\"success\": true}");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"success\": false, \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // 세션 완전 삭제
        return "redirect:/main/main.do?logout=true";
    }
}
