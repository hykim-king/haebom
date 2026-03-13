package com.pcwk.ehr.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.pcwk.ehr.user.OAuth2UserServiceImpl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // ✅ final 필드 생성자 주입 자동 생성
public class SecurityConfig {

	final Logger log = LogManager.getLogger(getClass());

	// ✅ 생성자 주입 대상(final) - 오류 해결됨
	private final OAuth2UserServiceImpl oAuth2UserService;

	// ✅ 소셜 가입에서 BCryptPasswordEncoder 주입 쓰므로 Bean 유지(필수)
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(10);
	}

	// id비번 hard 코딩(테스트용)
	@Bean
	public UserDetailsService userDetailsService() {
		log.info("┌──────────────────────────┐");
		log.info("│userDetailsService        │");
		log.info("└──────────────────────────┘");

		UserDetails admin = User.builder()
				.username("admin")
				.password(passwordEncoder().encode("1234"))
				.roles("ADMIN")
				.build();

		return new InMemoryUserDetailsManager(admin);
	}

	/**
	 * ✅ [추가] 카카오 OAuth2 인증 요청에 prompt 파라미터 주입
	 * - select_account: 계정 선택 화면(권장)
	 * - login: 매번 로그인 강제(더 강함)
	 */
	@Bean
	public OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver(
			ClientRegistrationRepository clientRegistrationRepository) {
		DefaultOAuth2AuthorizationRequestResolver defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
				clientRegistrationRepository,
				"/oauth2/authorization");

		return new OAuth2AuthorizationRequestResolver() {
			@Override
			public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
				OAuth2AuthorizationRequest authRequest = defaultResolver.resolve(request);
				return customize(request, authRequest);
			}

			@Override
			public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
				OAuth2AuthorizationRequest authRequest = defaultResolver.resolve(request, clientRegistrationId);
				return customize(request, authRequest);
			}

			private OAuth2AuthorizationRequest customize(HttpServletRequest request,
					OAuth2AuthorizationRequest authRequest) {
				if (authRequest == null)
					return null;

				// ✅ 카카오에만 적용하고 싶으면 아래처럼 registrationId 체크
				// (URI가 /oauth2/authorization/kakao 형태일 때 동작)
				String uri = request.getRequestURI();
				String regId = uri.substring(uri.lastIndexOf("/") + 1);
				if (!"kakao".equals(regId)) {
					return authRequest;
				}

				Map<String, Object> extraParams = new HashMap<>(authRequest.getAdditionalParameters());
				extraParams.put("prompt", "select_account"); // ✅ 여기만 바꾸면 됨 (또는 "login")

				return OAuth2AuthorizationRequest.from(authRequest)
						.additionalParameters(extraParams)
						.build();
			}
		};
	}

	@Bean
	SecurityFilterChain filterChain(
			HttpSecurity http,
			OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver) throws Exception {
		log.info("┌──────────────────────────┐");
		log.info("│filterChain()             │");
		log.info("└──────────────────────────┘");

		http
				// ✅ 개발 단계: 필요한 URL만 CSRF 제외
				.csrf(csrf -> csrf.ignoringRequestMatchers(
						"/user/login-api",
						"/api/auth/**",
						"/user/signup",
						"/user/signup/**",
						"/user/login",
						"/user/main",
						"/user/social-signup",
						"/admin/users/api",
						"/admin/**",
						"/support/**"
				))

				.authorizeHttpRequests(auth -> auth
						// 방식1: 기본 차단 + 허용 목록 (보안상 안전)
						// .requestMatchers(
						// "/css/**",
						// "/img/**",
						// "/javascript/**",
						// "/html/**",
						// "/login/**",
						// "/user/**",
						// "/api/auth/**"
						// ).permitAll()
						// .anyRequest().authenticated()

						// 방식2: 전체 허용 + 차단 목록 (임시적 허용)
						.requestMatchers("/admin/**").hasRole("ADMIN")
						.anyRequest().permitAll())

				.formLogin(form -> form
						.loginPage("/user/login") // GET 로그인 화면
						.loginProcessingUrl("/user/login") // POST 로그인 처리
						.defaultSuccessUrl("/", true) // 성공url
						.failureUrl("/user/login?error") // 로그인실패
						.usernameParameter("userId") // 아이디 변수
						.passwordParameter("password") // 비밀번호 변수
						.permitAll())
				// 로그아웃

				.logout(logout -> logout
						.logoutUrl("/user/logout") // 로그아웃 요청url
						.logoutSuccessUrl("/user/login?logout") // 로그아웃 성공 이후 URL
						.invalidateHttpSession(true) // 세션 무효화
						.clearAuthentication(true) // 인증 정보 제거
						.deleteCookies("JSESSIONID") // 쿠기삭제)
				)

				// ✅ OAuth2(카카오) 로그인
				.oauth2Login(oauth2 -> oauth2
						.loginPage("/user/login")
						// ✅ [추가] authorizationEndpoint에 resolver 연결
						.authorizationEndpoint(auth -> auth
								.authorizationRequestResolver(customAuthorizationRequestResolver))
						.userInfoEndpoint(userInfo -> userInfo
								.userService(oAuth2UserService))
						.defaultSuccessUrl("/oauth2/success", true));

		return http.build();
	}

}