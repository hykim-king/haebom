package com.pcwk.ehr.user;

import com.pcwk.ehr.domain.UserVO;
import com.pcwk.ehr.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/signup")
    public String signUpForm(Model model) {
        model.addAttribute("userVO", new UserVO());
        return "user/signup"; // templates/user/signup.html 호출
    }

    @PostMapping("/signup")
    public String signUp(@ModelAttribute("userVO") UserVO vo) {
        userService.signUp(vo);
        return "redirect:/user/login"; // 가입 후 로그인 페이지로
    }
}
