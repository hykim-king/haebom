package com.pcwk.ehr.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.pcwk.ehr.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OAuth2UserServiceImpl implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate =
                new DefaultOAuth2UserService();

        OAuth2User oAuth2User = delegate.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String provider = userRequest.getClientRegistration().getRegistrationId(); // kakao
        String providerId = String.valueOf(attributes.get("id"));

        Optional<UserEntity> userOptional =
                userRepository.findByUserProviderAndUserProviderId(provider, providerId);

        List<GrantedAuthority> authorities = new ArrayList<>();

        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();

            // 관리자 여부에 따라 권한 부여
            if ("Y".equalsIgnoreCase(user.getUserMngrYn())) {
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            } else {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }
        } else {
            // 신규 사용자 기본 권한
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        // 카카오는 보통 식별 키로 "id" 사용
        return new DefaultOAuth2User(authorities, attributes, "id");
    }
}
