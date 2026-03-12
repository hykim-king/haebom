/**
 * [회원가입 페이지 로직 - 최종 통합본]
 * 수정 사항: 
 * 1. 이메일 수정 시 인증 상태 초기화 로직 추가
 * 2. 전화번호 하이픈(-) 자동 완성 로직 복구
 * 3. 닉네임/전화번호 중복 체크 로직 정리
 */

// 1. 전역 설정 및 상태
const THEMES = [
    { id: 'mountain', icon: '⛰️', label: '산' },
    { id: 'waterfall', icon: '🌊', label: '폭포' },
    { id: 'valley', icon: '💦', label: '계곡' },
    { id: 'sea', icon: '🏖️', label: '바다' },
    { id: 'lake', icon: '🚣', label: '호수' },
    { id: 'river', icon: '🏞️', label: '강' },
    { id: 'cave', icon: '🦇', label: '동굴' },
    { id: 'history', icon: '🏯', label: '역사 관광지' },
    { id: 'temple', icon: '🙏', label: '사찰' },
    { id: 'spa', icon: '♨️', label: '온천/스파' },
    { id: 'themepark', icon: '🎡', label: '테마공원' },
    { id: 'experience', icon: '🚜', label: '체험' },
    { id: 'monument', icon: '🗼', label: '기념/전망' },
    { id: 'culture', icon: '🏛️', label: '문화시설' },
    { id: 'leisure', icon: '🚲', label: '레포츠' }
];

let timerInterval;

const signupConfig = {
    endpoints: {
        checkNickname: "/user/check-nickname",
        sendEmailCode: "/api/auth/send-email",
        verifyEmailCode: "/api/auth/verify-email",
        signup: "/user/signup",
        checkPhone: "/user/check-phone"
    }
};

const formState = {
    isEmailVerified: false
};

// --- 유틸리티 함수 ---

function startTimer(duration, display) {
    clearInterval(timerInterval);
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.text(minutes + ":" + seconds);
        display.removeClass('hidden');
        if (--timer < 0) {
            clearInterval(timerInterval);
            display.text("시간 초과").addClass('text-red-500');
            $('#btn-verify-code').prop('disabled', true);
        }
    }, 1000);
}

// signup.js의 renderThemes 함수를 아래 내용으로 교체하세요.
function renderThemes() {
    const $container = $('#theme-container');
    if ($container.length === 0) return;
    
    // 소셜 가입 페이지와 동일한 3열 디자인용 클래스 적용
    const html = THEMES.map(theme => `
        <label class="cursor-pointer group block w-full select-none">
            <input type="checkbox" name="themes" value="${theme.id}" class="theme-checkbox hidden peer">
            <div class="border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/50 transition-all h-24 relative w-full bg-white peer-checked:border-orange-500 peer-checked:bg-orange-50">
                <span class="text-2xl mb-1">${theme.icon}</span>
                <span class="text-xs font-bold text-slate-600 group-hover:text-slate-900">${theme.label}</span>
                <div class="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-orange-500 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </label>
    `).join('');
    
    $container.html(html);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- 메인 로직 ---
$(document).ready(function () {
    const today = new Date().toISOString().split('T')[0];
    $('#birth_picker').attr('max', today);
    renderThemes();

    // 2. 이메일 로직 (수정 시 초기화 포함)
    $('#email').on('input', function () {
        // 메시지를 띄우는 대신, 새로운 인증을 위해 상태만 조용히 초기화합니다.
        formState.isEmailVerified = false;

        // 버튼 상태 복구 (다시 인증번호를 받을 수 있게 함)
        $('#btn-send-code').prop('disabled', false).text('인증번호 받기');

        // 인증번호 입력칸 숨기기 및 초기화
        $('#email-verify-area').hide();
        $('#verify-code').val('').prop('disabled', false);
        $('#btn-verify-code').prop('disabled', false);

        // 기존에 떠있던 이메일 관련 메시지들을 모두 숨깁니다.
        $('#email-message').addClass('hidden').text('');
        $('#email-verify-message').addClass('hidden');

        // 타이머 중지
        clearInterval(timerInterval);
        $('#email-timer').addClass('hidden');
    });

    $('#btn-send-code').on('click', function () {
        const email = $('#email').val().trim();
        if (!isValidEmail(email)) { alert("올바른 이메일을 입력해주세요."); return; }
        const $btn = $(this);
        $btn.prop('disabled', true).text('전송 중...');
        $.ajax({
            url: signupConfig.endpoints.sendEmailCode,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email }),
            success: (res) => {
                if (res.success) {
                    $('#email-message').removeClass('hidden text-red-500').addClass('text-green-600').text("인증번호가 발송되었습니다.");
                    $('#email-verify-area').show();
                    startTimer(180, $('#email-timer'));
                } else {
                    $('#email-message').removeClass('hidden text-red-500').addClass('text-green-600').text(res.message);
                }
            },
            complete: () => { $btn.prop('disabled', false).text('재전송'); }
        });
    });

    $('#btn-verify-code').on('click', function () {
        const code = $('#verify-code').val().trim();
        const email = $('#email').val().trim();
        if (!code) { alert("인증번호를 입력해주세요."); return; }
        $.ajax({
            url: signupConfig.endpoints.verifyEmailCode,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, code }),
            success: (res) => {
                if (res.success) {
                    clearInterval(timerInterval);
                    $('#email-timer').addClass('hidden');
                    $('#email-verify-message').removeClass('hidden text-red-500').addClass('text-green-600').text("이메일 인증이 완료되었습니다.");
                    formState.isEmailVerified = true;
                    $('#verify-code, #btn-send-code, #btn-verify-code').prop('disabled', true);
                    $('#btn-send-code').text('인증 완료');
                } else {
                    $('#email-verify-message').removeClass('hidden text-green-600').addClass('text-red-500').text("인증번호가 일치하지 않습니다.");
                }
            }
        });
    });

    // 3. 비밀번호 확인
    $('#password, #password-confirm').on('keyup', function () {
        const pw = $('#password').val();
        const confirmPw = $('#password-confirm').val();
        const $msg = $('#password-message');
        if (pw === "" || confirmPw === "") { $msg.addClass('hidden'); return; }
        if (pw === confirmPw) {
            $msg.removeClass('hidden text-red-500').addClass('text-green-600').text("✓ 비밀번호가 일치합니다.");
        } else {
            $msg.removeClass('hidden text-green-600').addClass('text-red-500').text("비밀번호가 일치하지 않습니다.");
        }
    });

    // --- [4. 닉네임 로직 통합 수정본] ---

    // 1. 입력 시 상태 초기화 (사용자가 내용을 바꾸면 다시 중복 확인을 유도)
    $('#nickname').on('input', function () {
        $('#nickCheckDone').val('N');
        // 확인 완료 상태였다면 다시 기본 스타일로 복구
        $('#btn-check-nickname')
            .text('중복 확인')
            .removeClass('bg-green-100 text-green-700')
            .addClass('bg-slate-100');
    });

    // 2. 중복 확인 버튼 클릭 시 (형식 검증 후 통과 시에만 AJAX 실행)
    $('#btn-check-nickname').on('click', function () {
        const nickname = $('#nickname').val().trim();
        
        // [검증 1] 빈 값 체크
        if (!nickname) { 
            alert("닉네임을 입력해주세요."); 
            $('#nickname').focus(); 
            return; 
        }

        // [검증 2] 한글 초성/모음 포함 여부 검증
        const hasIncompleteKorean = /[ㄱ-ㅎㅏ-ㅣ]/.test(nickname);
        if (hasIncompleteKorean) {
            alert("닉네임 형식이 올바르지 않습니다.\n'ㄱㄴㄷ'이나 'ㅏㅑㅓ' 같은 초성/모음은 사용할 수 없습니다.");
            
            // 잘못된 입력 시 상태 초기화 및 포커스
            $('#nickCheckDone').val('N');
            $('#nickname').val('').focus(); // 입력창을 비우고 포커스
            return; // 🛑 여기서 중단되므로 아래 AJAX가 실행되지 않음
        }

        // [검증 3] 글자 수 체크 (2~10자)
        if (nickname.length < 2 || nickname.length > 10) {
            alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
            $('#nickname').focus();
            return;
        }

        // [검증 통과 시 AJAX 실행]
        const $btn = $(this);
        $.ajax({
            url: signupConfig.endpoints.checkNickname,
            type: 'GET',
            data: { nickname: nickname },
            success: function (isAvailable) {
                if (isAvailable === true || isAvailable === "true") {
                    alert("사용 가능한 닉네임입니다.");
                    $('#nickCheckDone').val('Y');
                    $btn.text('확인 완료')
                        .removeClass('bg-slate-100')
                        .addClass('bg-green-100 text-green-700');
                } else {
                    alert("이미 사용 중인 닉네임입니다.");
                    $('#nickCheckDone').val('N');
                    $('#nickname').focus();
                }
            },
            error: function() {
                alert("중복 확인 중 오류가 발생했습니다.");
            }
        });
    });
    // 5. 전화번호 로직 (복구됨!)
    $('#phone').on('input', function () {
        let num = $(this).val().replace(/[^0-9]/g, "");
        let res = num.length < 4 ? num : num.length < 8 ? num.substr(0, 3) + "-" + num.substr(3) : num.substr(0, 3) + "-" + num.substr(3, 4) + "-" + num.substr(7);
        $(this).val(res.substr(0, 13));
    });

    $('#phone').on('blur', function () {
        const phone = $(this).val().replace(/-/g, '').trim();
        if (!phone || phone.length < 10) return;
        $.ajax({
            url: signupConfig.endpoints.checkPhone,
            type: 'GET',
            data: { telno: phone },
            success: function (isAvailable) {
                if (isAvailable === true || isAvailable === "true") {
                    $('#phone-error').addClass('hidden');
                    $('#phone-success').removeClass('hidden');
                    $('#phoneCheckDone').val('Y');
                } else {
                    $('#phone-error').removeClass('hidden');
                    $('#phone-success').addClass('hidden');
                    $('#phoneCheckDone').val('N');
                }
            }
        });
    });

    // 6. 주소 및 최종 제출
    $('#btn-search-address').on('click', function (e) {
        e.preventDefault();
        new daum.Postcode({
            oncomplete: function (data) {
                $('#zipcode').val(data.zonecode);
                $('#addr-basic').val(data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress);
                $('#addr-detail').focus();
            }
        }).open();
    });

    $('#signup-form').on('submit', function (e) {
        e.preventDefault();
        if (!formState.isEmailVerified) { alert("이메일 인증을 완료해주세요."); return; }
        if ($('#nickCheckDone').val() !== 'Y') { alert("닉네임 중복 확인을 해주세요."); return; }
        if ($('#phoneCheckDone').val() !== 'Y') { alert("전화번호 중복 확인을 해주세요."); return; }
        if ($('#password').val() !== $('#password-confirm').val()) { alert("비밀번호가 일치하지 않습니다."); return; }

        const checkedThemes = $('input[name="themes"]:checked');
        if (checkedThemes.length < 3) { alert("여행 테마를 3개 이상 선택해주세요."); return; }

        const formData = {
            userEmlAddr: $('#email').val().trim(),
            userEnpswd: $('#password').val(),
            userNick: $('#nickname').val().trim(),
            userZip: $('#zipcode').val(),
            userAddr: $('#addr-basic').val(),
            userDaddr: $('#addr-detail').val(),
            userNm: $('input[name=\"userNm\"]').val(),
            userTelno: $('#phone').val().replace(/-/g, ''),
            userBrdt: $('#birth_picker').val().replace(/-/g, ''),
            userGndr: $('input[name=\"userGndr\"]:checked').val(),
            userTag: checkedThemes.map(function () { return this.value; }).get().join(',')
        };

        $.ajax({
            url: signupConfig.endpoints.signup,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert("해봄트립의 가족이 되신 것을 환영합니다!");
                window.location.href = "/user/login";
            },
            error: function (xhr) {
                try {
                    const res = JSON.parse(xhr.responseText);
                    alert("실패: " + res.message);
                } catch (e) {
                    alert("서버 오류가 발생했습니다.");
                }
            }
        });
    });
});