package com.pcwk.ehr.config;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {

		String requestedWith = request.getHeader("X-Requested-With");

		if ("XMLHttpRequest".equals(requestedWith)) {
			// AJAX 요청 → JSON 응답
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType("application/json;charset=UTF-8");
			response.getWriter().write("{\"status\":\"fail\", \"msg\":\"로그인이 필요합니다.\"}");
		} else {
			// 일반 페이지 요청 → alert 후 로그인 페이지 이동
			response.setContentType("text/html;charset=UTF-8");
			response.getWriter().write(
				"<script>" +
				"alert('로그인이 필요한 서비스입니다.');" +
				"location.href='/user/login';" +
				"</script>"
			);
		}
	}
}
