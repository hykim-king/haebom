/**
 * [로그인 페이지 로직]
 * 이 스크립트는 로그인 폼의 동작, 입력 값 검증, 그리고 백엔드 API와의 통신을 담당합니다.
 * 현재는 백엔드 없이 테스트할 수 있도록 '가상 사용자 데이터(Mock Data)'를 사용하여 로그인을 시뮬레이션합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * [설정 영역]
     * 백엔드 API 연동 시 이 객체의 값을 실제 서버 정보로 수정하세요.
     */
    const loginConfig = {
        // 실제 백엔드 API 사용 여부 (true: API 호출, false: 가상 데이터 사용)
        useRealApi: false, 

        // 로그인 API 엔드포인트 (예: 'https://api.haebomtrip.com/v1/auth/login')
        apiEndpoint: "/api/auth/login",
        
        // 로그인 성공 후 이동할 페이지 경로
        redirectUrl: "http://127.0.0.1:5500/html/main_Org.html",
        
        // 토큰 저장 방식 선택 ('localStorage' 또는 'sessionStorage')
        tokenStorageType: "localStorage",
        
        // 토큰 키 이름 (백엔드에서 사용하는 키 이름과 일치시켜야 함)
        tokenKeyName: "accessToken"
    };

    /**
     * [가상 사용자 데이터 (Mock Data)]
     * 백엔드 API가 준비되지 않았을 때 테스트용으로 사용할 사용자 정보입니다.
     * useRealApi가 false일 때 이 데이터와 비교하여 로그인을 처리합니다.
     */
    const mockUsers = [
        {
            email: "test",        // 테스트용 아이디
            password: "1234",     // 테스트용 비밀번호
            name: "해봄이",       // 사용자 이름
            token: "mock_token_abc123" // 로그인 성공 시 발급받았다고 가정할 토큰
        },
        {
            email: "user@example.com",
            password: "password",
            name: "여행자",
            token: "mock_token_xyz789"
        }
    ];

    // =========================================================================
    // 1. 초기화 및 유틸리티 함수
    // =========================================================================

    // Lucide 아이콘 초기화 (아이콘이 렌더링되지 않는 문제 방지)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /**
     * [UI 유틸리티] 버튼의 로딩 상태를 토글하는 함수
     * @param {HTMLElement} btn - 대상 버튼 요소
     * @param {boolean} isLoading - 로딩 상태 여부 (true: 로딩 중, false: 복귀)
     * @param {string} originalText - 로딩 전 원래 버튼 텍스트
     */
    function toggleButtonLoading(btn, isLoading, originalText = '') {
        if (isLoading) {
            btn.disabled = true;
            // 로딩 스피너 아이콘과 '로그인 중...' 텍스트 표시
            btn.innerHTML = `<span class="inline-block animate-spin mr-2">⏳</span> 로그인 중...`;
            btn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            btn.disabled = false;
            // 원래 텍스트로 복구
            btn.innerText = originalText;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    /**
     * [알림 유틸리티] 사용자에게 메시지를 표시하는 함수
     * 현재는 브라우저 기본 alert를 사용하지만, 추후 모달이나 토스트 UI로 교체할 수 있습니다.
     * @param {string} message - 표시할 메시지
     */
    function showNotification(message) {
        // 실제 서비스에서는 예쁜 디자인의 Toast 메시지나 Modal을 사용하는 것을 권장합니다.
        alert(message);
    }

    // =========================================================================
    // 2. 비밀번호 가시성 토글 기능 (눈 모양 아이콘)
    // =========================================================================
    
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            // 현재 입력 타입이 password인지 확인
            const isPassword = passwordInput.getAttribute('type') === 'password';
            
            // 타입 전환 (password <-> text)
            const newType = isPassword ? 'text' : 'password';
            passwordInput.setAttribute('type', newType);
            
            // 아이콘 변경 (eye: 보임, eye-off: 숨김)
            // Lucide 아이콘을 다시 렌더링하기 위해 innerHTML을 수정합니다.
            // isPassword가 true(비밀번호 상태)였다면 클릭 후 텍스트가 보이므로 'eye-off'(숨기기) 아이콘을 보여줄 수도 있지만,
            // 여기서는 직관적으로 '현재 상태'를 나타내는 아이콘을 사용합니다.
            const iconName = isPassword ? 'eye' : 'eye-off'; 
            
            this.innerHTML = `<i data-lucide="${iconName}" class="h-5 w-5"></i>`;
            
            // 동적으로 변경된 아이콘을 다시 렌더링
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    // =========================================================================
    // 3. 로그인 폼 제출 처리 (핵심 비즈니스 로직)
    // =========================================================================

    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
            
            // 3-1. 입력 값 가져오기
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            // 버튼의 원래 텍스트 저장 (로딩 후 복구용)
            const originalBtnText = submitBtn.innerText;

            // 3-2. 클라이언트 유효성 검사 (빈 값 체크)
            if (!email || !password) {
                showNotification('아이디와 비밀번호를 모두 입력해주세요.');
                return;
            }

            // 3-3. 로딩 상태 시작 (UI 비활성화)
            toggleButtonLoading(submitBtn, true);

            try {
                let loginResult;

                // [분기 처리] 실제 API 사용 여부에 따라 로직이 나뉩니다.
                if (loginConfig.useRealApi) {
                    // =================================================================
                    // (A) 실제 백엔드 API 호출 로직
                    // =================================================================
                    loginResult = await loginWithApi(email, password);
                } else {
                    // =================================================================
                    // (B) 가상 데이터(Mock) 검증 로직 (테스트용)
                    // =================================================================
                    loginResult = await loginWithMockData(email, password);
                }

                // 3-4. 로그인 성공 처리
                handleLoginSuccess(loginResult);

            } catch (error) {
                // 3-5. 로그인 실패 처리
                console.error('로그인 실패:', error);
                showNotification(error.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
                
                // 에러 발생 시에만 버튼을 다시 활성화 (성공 시엔 페이지 이동하므로 불필요할 수 있음)
                toggleButtonLoading(submitBtn, false, originalBtnText);
            }
        });
    }

    // =========================================================================
    // 4. 로그인 처리 함수들 (API 호출 vs Mock 데이터)
    // =========================================================================

    /**
     * (A) 실제 백엔드 API를 호출하여 로그인을 수행하는 함수
     */
    async function loginWithApi(email, password) {
        // API 요청 보내기
        const response = await fetch(loginConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,       // 백엔드 명세에 맞게 키 이름 수정 필요 (예: userId, username 등)
                password: password
            })
        });

        const data = await response.json();

        // 응답 상태 코드가 200번대가 아니면 에러 발생
        if (!response.ok) {
            throw new Error(data.message || '서버 오류가 발생했습니다.');
        }

        // 성공 시 데이터 반환 (토큰, 사용자 정보 등)
        return data;
    }

    /**
     * (B) 가상 데이터(Mock Data)와 입력값을 비교하여 로그인을 수행하는 함수
     * 백엔드 API가 없을 때 프론트엔드 테스트를 위해 사용합니다.
     */
    async function loginWithMockData(email, password) {
        // 네트워크 지연 효과 시뮬레이션 (1초 대기)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 입력된 이메일과 일치하는 사용자 찾기
        const user = mockUsers.find(u => u.email === email);

        // 사용자가 존재하고 비밀번호가 일치하는지 확인
        if (user && user.password === password) {
            // 로그인 성공 시 반환할 가짜 데이터 구조
            return {
                success: true,
                message: "로그인 성공",
                accessToken: user.token,
                user: {
                    name: user.name,
                    email: user.email
                }
            };
        } else {
            // 로그인 실패 시 에러 발생
            throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");
        }
    }

    /**
     * 로그인 성공 시 후처리를 담당하는 함수
     * - 토큰 저장
     * - 알림 표시
     * - 페이지 이동
     */
    function handleLoginSuccess(data) {
        // 1. 토큰 저장 (localStorage 또는 sessionStorage)
        const storage = loginConfig.tokenStorageType === 'sessionStorage' ? sessionStorage : localStorage;
        
        // 백엔드에서 받은 토큰 키 이름에 맞춰 저장 (예: data.accessToken)
        if (data.accessToken) {
            storage.setItem(loginConfig.tokenKeyName, data.accessToken);
        }
        
        // (선택 사항) 사용자 정보를 저장해두면 다른 페이지에서 활용하기 좋습니다.
        if (data.user) {
            storage.setItem('userInfo', JSON.stringify(data.user));
            console.log("사용자 정보 저장 완료:", data.user);
        }

        // 2. 성공 알림
        // 실제 서비스에서는 알림 없이 바로 넘어가는 경우가 많지만, 테스트를 위해 표시합니다.
        const userName = data.user ? data.user.name : "사용자";
        alert(`${userName}님 환영합니다! \n메인 페이지로 이동합니다.`);

        // 3. 페이지 이동 (리다이렉트)
        window.location.href = loginConfig.redirectUrl;
    }

});
