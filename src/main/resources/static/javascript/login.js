$(document).ready(function () {
    // 1. 초기화: Lucide 아이콘 렌더링
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. 비밀번호 가시성 토글 기능
    // 중복 제거: jQuery 방식으로 하나만 남깁니다.
    $('#toggle-password').on('click', function () {
        const passwordInput = $('#userEnpswd');
        const icon = $(this).find('i');

        const isPassword = passwordInput.attr('type') === 'password';
        const newType = isPassword ? 'text' : 'password';

        passwordInput.attr('type', newType);

        // 아이콘 속성 변경 후 Lucide 다시 렌더링
        const iconName = isPassword ? 'eye-off' : 'eye';
        $(this).html(`<i data-lucide="${iconName}" class="h-5 w-5"></i>`);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // 3. 로그인 폼 제출 (유효성 검사 + AJAX 통합)
    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        const email = $('#userEmlAddr').val().trim();
        const password = $('#userEnpswd').val();
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();

        // [유효성 검사] 부분의 if문을 아래와 같이 변경하세요.
        if (password.length < 8 || password.length >= 16) {
            alert("비밀번호는 8자 이상 16자 미만으로 입력해야 합니다.");
            $('#userEnpswd').focus();
            return false;
        }

        // 버튼 로딩 상태 시작
        toggleButtonLoading(submitBtn, true);

        // [AJAX 요청]
        $.ajax({
            url: "/user/login-api",
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userEmlAddr: email,
                userEnpswd: password
            }),
            success: function (res) {
                // 응답이 이미 객체라면 그대로 쓰고, 문자열이라면 파싱을 시도합니다.
                let response;
                try {
                    response = typeof res === "string" ? JSON.parse(res) : res;
                } catch (e) {
                    console.error("서버 응답이 JSON 형식이 아닙니다:", res);
                    alert("서버 응답 오류가 발생했습니다.");
                    return;
                }

                if (response.success) {
                    window.location.href = "/main";
                } else {
                    alert(response.message || "로그인 실패");
                }
            }
        });
    });

    // UI 유틸리티: 버튼 로딩 상태 처리
    function toggleButtonLoading(btn, isLoading, originalText = '') {
        if (isLoading) {
            btn.prop('disabled', true);
            btn.html(`<span class="inline-block animate-spin mr-2">⏳</span> 로그인 중...`);
            btn.addClass('opacity-75 cursor-not-allowed');
        } else {
            btn.prop('disabled', false);
            btn.text(originalText);
            btn.removeClass('opacity-75 cursor-not-allowed');
        }
    }
});