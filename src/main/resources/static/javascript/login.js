/**
 * [로그인 페이지 로직]
 * 스프링 부트 서버(UserController)와 AJAX 통신을 통해 로그인을 처리합니다.
 */

$(document).ready(function () {
    
    // 1. 초기화: Lucide 아이콘 렌더링
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. 비밀번호 가시성 토글 기능 (눈 모양 아이콘)
    // th:field="*{userEnpswd}"를 사용하면 id는 'userEnpswd'가 됩니다.
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('userEnpswd'); 

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            const newType = isPassword ? 'text' : 'password';
            passwordInput.setAttribute('type', newType);
            
            // 아이콘 변경
            const iconName = isPassword ? 'eye' : 'eye-off'; 
            this.innerHTML = `<i data-lucide="${iconName}" class="h-5 w-5"></i>`;
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    // 3. 로그인 폼 제출 (AJAX 연동)
    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        // 버튼 로딩 상태 시작
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();
        toggleButtonLoading(submitBtn, true);

        // [데이터 수집] th:field로 생성된 id를 사용하여 UserVO와 필드명을 일치시킴
        const loginData = {
            userEmlAddr: $('#userEmlAddr').val().trim(),
            userEnpswd: $('#userEnpswd').val()
        };

        // [AJAX 요청] 컨트롤러의 @PostMapping("/user/login") 호출
        $.ajax({
            url: "/user/login",
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function (res) {
                // 서버에서 String 형태로 {"success": true}를 보내므로 
                // 만약 res가 객체가 아니라면 JSON.parse가 필요할 수 있으나 
                // 최근 스프링은 자동으로 JSON 객체로 변환해줍니다.
                const response = typeof res === "string" ? JSON.parse(res) : res;

                if (response.success) {
                    window.location.href = "/user/main?loginSuccess=true";
                }else {
                    alert(response.message || "로그인 정보를 확인해주세요.");
                    toggleButtonLoading(submitBtn, false, originalText);
                }
            },
            error: function (xhr) {
                // 401 Unauthorized 또는 서버 에러 발생 시
                let errorMsg = "이메일 또는 비밀번호가 일치하지 않습니다.";
                try {
                    const errRes = JSON.parse(xhr.responseText);
                    if(errRes.message) errorMsg = errRes.message;
                } catch(e) { }
                
                alert(errorMsg);
                toggleButtonLoading(submitBtn, false, originalText);
            }
        });
    });

    /**
     * [UI 유틸리티] 버튼 로딩 상태 처리 함수
     */
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