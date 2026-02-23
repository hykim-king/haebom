/**
 * [회원가입 페이지 로직]
 * 
 * - jQuery를 사용하여 DOM 조작 및 AJAX 비동기 통신 처리
 * - 여행 테마 렌더링, 닉네임 중복 확인, 이메일 인증, 회원가입 제출 기능 포함
 */

// =========================================================================
// [전역 변수 및 설정 정의]
// =========================================================================

/**
 * [여행 테마 데이터]
 * 사용자가 선택할 수 있는 여행 테마 목록입니다.
 * 이 데이터는 스크립트 로드 즉시 정의됩니다.
 */
const THEMES = [
    { id: 'healing', icon: '🌿', label: '힐링/휴식' },
    { id: 'activity', icon: '🏃', label: '액티비티' },
    { id: 'food', icon: '🥘', label: '맛집탐방' },
    { id: 'photo', icon: '📸', label: '인생샷' },
    { id: 'history', icon: '🏯', label: '역사/문화' },
    { id: 'sea', icon: '🌊', label: '바다여행' },
    { id: 'mountain', icon: '⛰️', label: '등산/트레킹' },
    { id: 'camping', icon: '⛺', label: '캠핑/글램핑' },
    { id: 'festival', icon: '🎉', label: '지역축제' },
    { id: 'cafe', icon: '☕', label: '카페투어' },
    { id: 'family', icon: '👨‍👩‍👧‍👦', label: '가족여행' },
    { id: 'friend', icon: '👯', label: '우정여행' }
];

/**
 * [설정 객체]
 * 백엔드 API 연동 시 이 객체의 값을 실제 서버 정보로 수정하세요.
 */
const signupConfig = {
    // 실제 백엔드 API 사용 여부 (true: API 호출, false: 가상 데이터 사용)
    useRealApi: false, 

    // API 엔드포인트 목록
    endpoints: {
        checkNickname: "/api/auth/check-nickname", // 닉네임 중복 확인
        sendEmailCode: "/api/auth/send-email",    // 이메일 인증번호 전송
        verifyEmailCode: "/api/auth/verify-email", // 이메일 인증번호 확인
        signup: "/api/auth/signup"                // 회원가입 요청
    },
    
    // 회원가입 성공 후 이동할 페이지
    redirectUrl: "../html/login.html"
};

/**
 * [상태 관리 객체]
 * 현재 폼의 유효성 검사 상태를 저장합니다.
 */
const formState = {
    isNicknameChecked: false, // 닉네임 중복 확인 완료 여부
    isEmailVerified: false,   // 이메일 인증 완료 여부
    checkedNickname: ""       // 중복 확인을 통과한 닉네임 (변경 감지용)
};

/**
 * [가상 데이터 (Mock Data)]
 * 백엔드 없이 테스트하기 위한 가상의 중복 데이터입니다.
 */
const mockData = {
    existingNicknames: ["해봄이", "관리자", "여행왕", "admin", "test"], // 이미 존재하는 닉네임들
    verificationCode: "123456" // 테스트용 이메일 인증번호
};

// =========================================================================
// [핵심 함수 정의]
// =========================================================================

/**
 * 여행 테마 목록을 화면에 렌더링하는 함수
 * 이 함수는 DOM이 준비된 후 호출됩니다.
 */
function renderThemes() {
    console.log("Rendering themes...", THEMES.length, "items");
    
    const $container = $('#theme-container');
    
    // 컨테이너가 없으면 에러 로그 출력 후 중단
    if ($container.length === 0) {
        console.error("Error: #theme-container element not found in DOM.");
        return;
    }

    try {
        // 테마 데이터를 HTML 문자열로 변환
        const html = THEMES.map(theme => `
            <label class="cursor-pointer group block w-full select-none">
                <input type="checkbox" name="themes" value="${theme.id}" class="theme-checkbox hidden peer">
                <div class="border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/50 transition-all h-24 relative w-full bg-white">
                    <span class="text-2xl mb-1">${theme.icon}</span>
                    <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900">${theme.label}</span>
                    
                    <!-- 체크 표시 아이콘 (선택 시 보임) -->
                    <div class="check-icon absolute top-2 right-2 opacity-0 transform scale-50 transition-all text-orange-500">
                        <i data-lucide="check-circle" class="w-4 h-4 fill-orange-100"></i>
                    </div>
                </div>
            </label>
        `).join('');

        // 컨테이너에 HTML 주입
        $container.html(html);
        
        // 동적으로 추가된 요소에 대해 Lucide 아이콘 다시 렌더링
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        } else {
            console.warn("Lucide library not loaded yet.");
        }

        console.log("Themes rendered successfully.");

    } catch (error) {
        console.error("Error rendering themes:", error);
        $container.html('<div class="col-span-full text-red-500 text-center">테마를 불러오는데 실패했습니다.</div>');
    }
}


// =========================================================================
// [DOM 로드 후 실행 로직]
// =========================================================================

$(document).ready(function() {
    console.log("Signup Page Script Loaded (jQuery Ready)");

    // 1. 초기화: 여행 테마 렌더링 실행
    renderThemes();

    // 2. 초기화: Lucide 아이콘 렌더링 (이미 로드된 아이콘들)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // =========================================================================
    // 3. 닉네임 중복 확인 기능
    // =========================================================================

    $('#btn-check-nickname').on('click', function() {
        const nickname = $('#nickname').val().trim();
        const $msg = $('#nickname-message');
        const $btn = $(this);
        const $input = $('#nickname');

        // 입력 값 검증
        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            $input.focus();
            return;
        }

        // 닉네임 길이 검사 (2자 이상)
        if (nickname.length < 2) {
            $msg.removeClass('hidden text-green-600').addClass('text-red-500').text("닉네임은 2글자 이상이어야 합니다.");
            $msg.show();
            $input.removeClass('border-green-500 ring-1 ring-green-500').addClass('border-red-500 ring-1 ring-red-500');
            return;
        }

        // 로딩 상태 표시
        const originalText = $btn.text();
        $btn.prop('disabled', true).text('확인 중...');

        // 중복 확인 요청 (AJAX)
        if (signupConfig.useRealApi) {
            // [실제 API 호출]
            $.ajax({
                url: signupConfig.endpoints.checkNickname,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ nickname: nickname }),
                success: function(response) {
                    handleNicknameSuccess(nickname);
                },
                error: function(xhr) {
                    handleNicknameFailure("이미 사용 중인 닉네임입니다.");
                },
                complete: function() {
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        } else {
            // [가상 데이터 검증]
            setTimeout(function() {
                if (mockData.existingNicknames.includes(nickname)) {
                    handleNicknameFailure("이미 사용 중인 닉네임입니다.");
                } else {
                    handleNicknameSuccess(nickname);
                }
                $btn.prop('disabled', false).text(originalText);
            }, 500);
        }
    });

    function handleNicknameSuccess(nickname) {
        const $msg = $('#nickname-message');
        const $input = $('#nickname');
        
        $msg.removeClass('hidden text-red-500').addClass('text-green-600').text("사용 가능한 닉네임입니다.");
        $msg.show();
        
        formState.isNicknameChecked = true;
        formState.checkedNickname = nickname;
        
        $input.removeClass('border-red-500 ring-1 ring-red-500').addClass('border-green-500 ring-1 ring-green-500');
    }

    function handleNicknameFailure(message) {
        const $msg = $('#nickname-message');
        const $input = $('#nickname');
        
        $msg.removeClass('hidden text-green-600').addClass('text-red-500').text(message);
        $msg.show();
        
        formState.isNicknameChecked = false;
        $input.removeClass('border-green-500 ring-1 ring-green-500').addClass('border-red-500 ring-1 ring-red-500');
    }

    // 닉네임 입력 변경 감지 -> 재검증 요구
    $('#nickname').on('input', function() {
        const currentVal = $(this).val().trim();
        if (formState.isNicknameChecked && currentVal !== formState.checkedNickname) {
            formState.isNicknameChecked = false;
            $('#nickname-message').addClass('hidden');
            $(this).removeClass('border-green-500 ring-1 ring-green-500 border-red-500 ring-red-500');
        }
    });

    // =========================================================================
    // 4. 비밀번호 확인 (실시간 감지)
    // =========================================================================

    $('#password, #password-confirm').on('keyup', function() {
        const pw = $('#password').val();
        const confirmPw = $('#password-confirm').val();
        const $msg = $('#password-message');

        if (confirmPw === "") {
            $msg.addClass('hidden');
            return;
        }

        if (pw === confirmPw) {
            $msg.removeClass('hidden text-red-500').addClass('text-green-600').text("비밀번호가 일치합니다.");
        } else {
            $msg.removeClass('hidden text-green-600').addClass('text-red-500').text("비밀번호가 일치하지 않습니다.");
        }
    });

    // =========================================================================
    // 5. 이메일 인증 기능 (Mock)
    // =========================================================================

    $('#btn-send-code').on('click', function() {
        const email = $('#email').val().trim();
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }
        alert(`[전송 완료] ${email}로 인증번호가 발송되었습니다.\n(테스트용 인증번호: ${mockData.verificationCode})`);
        $('#email-verify-area').removeClass('hidden');
        $('#verify-code').focus();
    });

    $('#btn-verify-code').on('click', function() {
        const inputCode = $('#verify-code').val().trim();
        if (inputCode === mockData.verificationCode) {
            alert("인증이 완료되었습니다.");
            $('#email').prop('disabled', true);
            $('#verify-code').prop('disabled', true);
            $('#btn-send-code').prop('disabled', true).text('인증완료');
            $('#email-verify-area').addClass('hidden');
            formState.isEmailVerified = true;
        } else {
            alert("인증번호가 올바르지 않습니다.");
        }
    });

    // =========================================================================
    // 6. 전화번호 자동 하이픈 (Auto Format)
    // =========================================================================
    
    $('#phone').on('input', function() {
        let number = $(this).val().replace(/[^0-9]/g, "");
        let phone = "";
        
        if (number.length < 4) {
            phone = number;
        } else if (number.length < 7) {
            phone += number.substr(0, 3);
            phone += "-";
            phone += number.substr(3);
        } else if (number.length < 11) {
            phone += number.substr(0, 3);
            phone += "-";
            phone += number.substr(3, 3);
            phone += "-";
            phone += number.substr(6);
        } else {
            phone += number.substr(0, 3);
            phone += "-";
            phone += number.substr(3, 4);
            phone += "-";
            phone += number.substr(7, 4);
        }
        
        // 최대 길이 제한 (010-1234-5678 = 13자)
        if (phone.length > 13) {
            phone = phone.substring(0, 13);
        }
        
        $(this).val(phone);
    });

    // =========================================================================
    // 7. 주소 검색 (Mock)
    // =========================================================================
    
    $('button:contains("주소 검색")').on('click', function() {
        alert("[테스트] 주소 검색 팝업이 열립니다. \n서울시 강남구 테헤란로 123으로 자동 입력됩니다.");
        $('#zipcode').val('06123');
        $('#addr-basic').val('서울 강남구 테헤란로 123');
        $('#addr-detail').focus();
    });

    // =========================================================================
    // 7. 회원가입 폼 제출 처리
    // =========================================================================

    $('#signup-form').on('submit', function(e) {
        e.preventDefault();

        // 유효성 검사
        if (!formState.isNicknameChecked) {
            alert("닉네임 중복 확인을 해주세요.");
            $('#nickname').focus();
            return;
        }

        if ($('#password').val() !== $('#password-confirm').val()) {
            alert("비밀번호가 일치하지 않습니다.");
            $('#password-confirm').focus();
            return;
        }

        // 테마 선택 개수 확인
        const checkedThemes = $('input[name="themes"]:checked').length;
        if (checkedThemes < 3) {
            alert("여행 테마를 3개 이상 선택해주세요.");
            return;
        }

        // 데이터 수집
        const formData = {
            username: $('#username').val(),
            nickname: $('#nickname').val(),
            password: $('#password').val(),
            email: $('#email').val(),
            address: {
                zipcode: $('#zipcode').val(),
                basic: $('#addr-basic').val(),
                detail: $('#addr-detail').val()
            },
            name: $('#fullname').val(),
            phone: $('#phone').val(),
            birthdate: $('#birthdate').val(),
            gender: $('input[name="gender"]:checked').val(),
            themes: $('input[name="themes"]:checked').map(function() { return this.value; }).get()
        };

        console.log("전송할 회원가입 데이터:", formData);

        // 회원가입 요청
        if (signupConfig.useRealApi) {
            $.ajax({
                url: signupConfig.endpoints.signup,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                    alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
                    window.location.href = signupConfig.redirectUrl;
                },
                error: function(xhr) {
                    const msg = xhr.responseJSON ? xhr.responseJSON.message : "회원가입 중 오류가 발생했습니다.";
                    alert(msg);
                }
            });
        } else {
            setTimeout(function() {
                alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
                window.location.href = signupConfig.redirectUrl;
            }, 1000);
        }
    });

});
