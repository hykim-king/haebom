package com.pcwk.ehr.user.controller;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserEntity;
import com.pcwk.ehr.user.UserService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    final Logger log = LogManager.getLogger(getClass());

    private final UserService userService;

    // 1. 화면 이동: 로그인 페이지
    @GetMapping("/login")
    public String loginForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/login";
    }

    // 2. 화면 이동: 회원가입 페이지
    @GetMapping("/signup")
    public String signUpForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/signup";
    }

    // 3. 화면 이동: 비밀번호 찾기
    @GetMapping("/findPw")
    public String findPwForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/find_pw";
    }

    @PostMapping("/login-api")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody UserVO vo, HttpSession session) {
        // 응답용 Map 생성 (자동으로 JSON 변환됨)
        Map<String, Object> response = new HashMap<>();

        try {
            UserEntity loginUser = userService.loginDetail(vo.getUserEmlAddr(), vo.getUserEnpswd());
            if (loginUser != null) {
                // 💡 1. 자바 객체에 이름이 있는지 확인
                log.info("로그인 성공! 유저 이름: {}", loginUser.getUserNm());
                log.info("로그인 성공! 유저 닉네임: {}", loginUser.getUserNick());
                session.setAttribute("user", loginUser);

                // 3. 관리자 권한(userMngrYn) 확인 후 SecurityContext 설정
                if ("Y".equals(loginUser.getUserMngrYn())) {
                    log.info("관리자 접속 감지: ROLE_ADMIN 부여");
                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            loginUser.getUserEmlAddr(),
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    // 세션에 SecurityContext 저장 (다음 요청에서도 인증 유지)
                    session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
                    response.put("redirectUrl", "/admin/users");
                }

                response.put("success", true);
                return ResponseEntity.ok(response); // {"success": true}
            } else {
                response.put("success", false);
                response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "서버 오류: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // 5. 로직: 이메일 중복 체크 (인증번호 전송 전 호출)
    @GetMapping("/check-email")
    @ResponseBody
    public ResponseEntity<Boolean> checkEmail(@RequestParam("email") String email) {
        // userService에서 해당 이메일이 사용 가능하면 true 반환
        boolean isAvailable = userService.isEmailAvailable(email);
        return ResponseEntity.ok(isAvailable);
    }

    // 6. 로직: 전화번호 중복 체크 (입력 시 blur 이벤트로 호출)
    @GetMapping("/check-phone")
    @ResponseBody
    public ResponseEntity<Boolean> checkPhone(@RequestParam("telno") String telno) {
        // 하이픈 제거 후 체크
        String cleanTelno = telno.replaceAll("-", "");
        boolean isAvailable = userService.isPhoneAvailable(cleanTelno);
        return ResponseEntity.ok(isAvailable);
    }

    // 7. 로직: 회원가입 처리
    @PostMapping("/signup")
    @ResponseBody
    public ResponseEntity<?> signUp(@RequestBody UserVO vo) {
        try {
            // 서버 측 최종 중복 검증 (보안 및 데이터 무결성)
            if (!userService.isEmailAvailable(vo.getUserEmlAddr())) {
                return ResponseEntity.status(400).body("{\"success\": false, \"message\": \"이미 사용 중인 이메일입니다.\"}");
            }
            if (!userService.isPhoneAvailable(vo.getUserTelno())) {
                return ResponseEntity.status(400).body("{\"success\": false, \"message\": \"이미 사용 중인 전화번호입니다.\"}");
            }

            userService.signUp(vo);
            return ResponseEntity.ok().body("{\"success\": true}");
        } catch (Exception e) {
            // ORA-00001 등 DB 에러 발생 시 메시지 전달
            return ResponseEntity.status(500).body("{\"success\": false, \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // 8. 로직: 로그아웃
    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/main?logout=true";
    }

    @GetMapping("/")
    public String main(Principal principal) {
        // 1. 비로그인 시 메인 페이지
        if (principal == null) {
            return "main/main";
        }

        // 2. 로그인한 사용자의 이메일(ID)로 조회
        String email = principal.getName();
        UserEntity user = userService.findByEmail(email);

        // 3. 관리자 권한(userMngrYn) 확인 후 분기
        if (user != null && "Y".equals(user.getUserMngrYn())) {
            log.info("관리자 접속 감지: 관리자 페이지로 리다이렉트");
            return "redirect:/admin/users";
        }

        // 4. 일반 회원 메인 페이지
        return "main/main";
    }
}