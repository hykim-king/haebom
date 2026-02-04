/**
 * 
 */
package com.pcwk.ehr.config;

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
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;



/**
 * <pre>
 * Class Name : SecurityConfig
 * Description : 단방향 암호화
 *
 * Modification Information
 * 수정일        수정자     수정내용
 * ----------  --------  ---------------------------
 * 2026. 1. 21.  user   최초 생성
 * </pre>
 *
 * @author user
 * @since 2026. 1. 21.
 */
@Configuration
@EnableWebSecurity //모든 요청 URL이 시큐리티의 제어를 받도록 설정

public class SecurityConfig {

	final Logger log = LogManager.getLogger(getClass());

	

	//id비번 hard 코딩
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

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
		log.info("┌──────────────────────────┐");
		log.info("│filterChain()             │");
		log.info("└──────────────────────────┘");		

		http
			.authorizeHttpRequests((auth)-> auth
				.requestMatchers(
					"/assets/**",
					"/login/**"
				).permitAll() //로그인 화면 허용
				.anyRequest().authenticated()//나머지는 로그인 필수
			)
			.formLogin(form -> form
				.loginPage("/login/login") //GET 로그인 화면 
				.loginProcessingUrl("/login/login") //POST 로그인 처리 
				.defaultSuccessUrl("/", true) //성공url
				.failureUrl("/login/login?error") //로그인실패 
				.usernameParameter("userId") //아이디 변수
				.passwordParameter("password")  //비밀번호 변수
				.permitAll() 
			)
			//로그아웃
			.logout( logout -> logout 
				.logoutUrl("/logout/logout")  // 로그아웃 요청url
				.logoutSuccessUrl("/login/login?logout") //로그아웃 성공 이후 URL
				.invalidateHttpSession(true)             //세션 무효화 
				.clearAuthentication(true)               //인증 정보 제거 
				.deleteCookies("JSESSIONID")             //쿠기삭제
			)
			
			;

		return http.build();
	} 

	/**
	 * 
	 * Description : 
	 *   단방향 암호화 
         10 : default
         12 : 강화
         14 : 매우 강화(접속 속도 저하)
	 * @param 
	 * @return BCryptPasswordEncoder
	 * @throws
	 */
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		
		return new BCryptPasswordEncoder(10);
	}
}
