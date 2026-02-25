/**
 * [회원가입 페이지 로직]
 */

// 1. 전역 설정 및 상태
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

const signupConfig = {
  useRealApi: true, 
  endpoints: {
    checkNickname: "/api/auth/check-nickname",
    sendEmailCode: "/api/auth/send-email",
    verifyEmailCode: "/api/auth/verify-email",
    signup: "/api/auth/signup"
  },
  redirectUrl: "../html/login.html"
};

const formState = {
  isNicknameChecked: false,
  isEmailVerified: false,
  checkedNickname: ""
};

const mockData = {
  existingNicknames: ["해봄이", "관리자", "여행왕", "admin", "test"]
};

// 2. 핵심 유틸리티 함수
function renderThemes() {
  const $container = $('#theme-container');
  if ($container.length === 0) return;
  const html = THEMES.map(theme => `
    <label class="cursor-pointer group block w-full select-none">
      <input type="checkbox" name="themes" value="${theme.id}" class="theme-checkbox hidden peer">
      <div class="border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/50 transition-all h-24 relative w-full bg-white">
        <span class="text-2xl mb-1">${theme.icon}</span>
        <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900">${theme.label}</span>
        <div class="check-icon absolute top-2 right-2 opacity-0 transform scale-50 transition-all text-orange-500">
          <i data-lucide="check-circle" class="w-4 h-4 fill-orange-100"></i>
        </div>
      </div>
    </label>
  `).join('');
  $container.html(html);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 닉네임 결과 처리 함수들
function handleNicknameSuccess(nickname) {
  const $msg = $('#nickname-message');
  const $input = $('#nickname');
  $msg.removeClass('hidden text-red-500').addClass('text-green-600').text("사용 가능한 닉네임입니다.");
  $msg.show();
  formState.isNicknameChecked = true;
  formState.checkedNickname = nickname;
  $input.removeClass('border-red-500 ring-red-500').addClass('border-green-500 ring-1 ring-green-500');
}

function handleNicknameFailure(message) {
  const $msg = $('#nickname-message');
  const $input = $('#nickname');
  $msg.removeClass('hidden text-green-600').addClass('text-red-500').text(message);
  $msg.show();
  formState.isNicknameChecked = false;
  $input.removeClass('border-green-500 ring-green-500').addClass('border-red-500 ring-1 ring-red-500');
}

// 3. 실행 로직 (DOM Ready)
$(document).ready(function () {
  renderThemes();

  // [이메일 전송]
  $('#btn-send-code').on('click', function () {
    const email = $('#email').val().trim();
    if (!isValidEmail(email)) {
      alert("올바른 이메일을 입력해주세요.");
      return;
    }
    $(this).prop('disabled', true).text('전송 중...');
    $.ajax({
      url: signupConfig.endpoints.sendEmailCode,
      type: 'POST',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email }),
      success: (res) => {
        if (res.success) {
          $('#email-message').removeClass('hidden text-red-500').addClass('text-green-600').text(res.message);
          $('#email-verify-area').removeClass('hidden');
        } else {
          $('#email-message').removeClass('hidden text-green-600').addClass('text-red-500').text(res.message);
        }
      },
      complete: () => { $(this).prop('disabled', false).text('인증번호 받기'); }
    });
  });

  // [이메일 확인]
  $('#btn-verify-code').on('click', function () {
    const code = $('#verify-code').val().trim();
    $.ajax({
      url: signupConfig.endpoints.verifyEmailCode,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: $('#email').val().trim(), code }),
      success: (res) => {
        if (res.success) {
          $('#email-verify-message').removeClass('hidden text-red-500').addClass('text-green-600').text(res.message);
          formState.isEmailVerified = true;
          $('#email, #verify-code, #btn-send-code, #btn-verify-code').prop('disabled', true);
        } else {
          $('#email-verify-message').removeClass('hidden text-green-600').addClass('text-red-500').text(res.message);
        }
      }
    });
  });

  // [비밀번호 실시간 확인] - 중복 제거 및 문구 통일
  $('#password, #password-confirm').on('keyup', function () {
    const pw = $('#password').val();
    const confirmPw = $('#password-confirm').val();
    const $msg = $('#password-message');

    if (pw === "" || confirmPw === "") {
      $msg.addClass('hidden');
      return;
    }

    if (pw === confirmPw) {
      $msg.removeClass('hidden text-red-500').addClass('text-green-600').text("비밀번호가 확인되었습니다.");
    } else {
      $msg.removeClass('hidden text-green-600').addClass('text-red-500').text("비밀번호가 틀렸습니다. 다시 입력 해주세요.");
    }
  });

  // [닉네임 중복 확인]
  $('#btn-check-nickname').on('click', function () {
    const nickname = $('#nickname').val().trim();
    if (!nickname) { alert("닉네임을 입력해주세요."); return; }
    
    if (mockData.existingNicknames.includes(nickname)) {
      handleNicknameFailure("이미 사용 중인 닉네임입니다.");
    } else {
      handleNicknameSuccess(nickname);
    }
  });

  // 닉네임 수정 시 인증상태 리셋
  $('#nickname').on('input', function () {
    if (formState.isNicknameChecked) {
      formState.isNicknameChecked = false;
      $('#nickname-message').addClass('hidden');
      $(this).removeClass('border-green-500 ring-1 ring-green-500 border-red-500 ring-red-500');
    }
  });

  // [전화번호 하이픈]
  $('#phone').on('input', function () {
    let num = $(this).val().replace(/[^0-9]/g, "");
    if (num.length > 11) num = num.substr(0, 11);
    let res = num.length < 4 ? num : num.length < 8 ? num.substr(0, 3)+"-"+num.substr(3) : num.substr(0, 3)+"-"+num.substr(3, 4)+"-"+num.substr(7);
    $(this).val(res);
  });

 // =========================================================================
// 6. 주소 검색 (Kakao Postcode API)
// =========================================================================
// .off('click')을 추가하여 이벤트가 중복으로 쌓여서 안 열리는 현상을 방지합니다.
$('#btn-search-address').off('click').on('click', function (e) {
    // 폼 제출이나 페이지 리로드 방지
    e.preventDefault(); 

    // 카카오 API 로드 여부 확인
    if (typeof daum === 'undefined') {
        alert("주소 서비스가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    new daum.Postcode({
        oncomplete: function(data) {
            // 각 주소의 노출 규칙에 따라 주소를 조합한다.
            let addr = ''; // 주소 변수
            let extraAddr = ''; // 참고항목 변수

            // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
            if (data.userSelectedType === 'R') { // 도로명 주소
                addr = data.roadAddress;
            } else { // 지번 주소
                addr = data.jibunAddress;
            }

            // 도로명 주소일 때 참고항목(동 이름, 건물명) 조합
            if(data.userSelectedType === 'R'){
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                    extraAddr += data.bname;
                }
                if(data.buildingName !== '' && data.apartment === 'Y'){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if(extraAddr !== ''){
                    extraAddr = ' (' + extraAddr + ')';
                }
                // 주소 뒤에 참고항목 추가
                addr += extraAddr;
            }

            // 우편번호와 주소 정보를 해당 input 필드에 넣는다.
            $('#zipcode').val(data.zonecode);
            $('#addr-basic').val(addr);
            
            // 상세주소 칸으로 포커스 이동하여 바로 입력 가능하게 함
            $('#addr-detail').focus();
        }
    }).open();
});

    // [회원가입 제출]
  $('#signup-form').on('submit', function (e) {
      e.preventDefault(); // 기본 폼 제출 방지

      // 1. 유효성 검사
      if (!formState.isEmailVerified) { alert("이메일 인증을 완료해주세요."); return; }
      if (!formState.isNicknameChecked) { alert("닉네임 중복 확인을 해주세요."); return; }
      if ($('#password').val() !== $('#password-confirm').val()) { alert("비밀번호가 일치하지 않습니다."); return; }
      
      const checkedThemes = $('input[name="themes"]:checked');
      if (checkedThemes.length < 3) { alert("여행 테마를 3개 이상 선택해주세요."); return; }

      // 2. 데이터 가공 (UserEntity/UserVO 필드명과 일치시켜야 함)
      const formData = {
          userEmlAddr: $('#email').val().trim(),
          userEnpswd:  $('#password').val(),
          userNick:    $('#nickname').val().trim(),
          userZip:     $('#zipcode').val(),
          userAddr:    $('#addr-basic').val(),
          userDaddr:   $('#addr-detail').val(),
          userNm:      $('input[name="userNm"]').val(),
          userTelno:   $('input[name="userTelno"]').val(),
          userBrdt:    parseInt($('#userBrdt').val()), 
          userGndr:    $('input[name="userGndr"]:checked').val(),
          // 테마 리스트를 콤마로 구분된 문자열로 변환 (user_tag 컬럼용)
          userTag:     checkedThemes.map(function() { return this.value; }).get().join(',')
      };

      // 3. 서버 전송
      $.ajax({
          url: "/user/signup", // UserController의 @PostMapping("/signup")과 일치
          method: 'POST',
          contentType: 'application/json', // JSON 형태로 전송
          data: JSON.stringify(formData),
          success: function (res) {
              // 서버에서 성공 응답이 오면 로그인 페이지로 이동
              alert("해봄트립의 가족이 되신 것을 환영합니다!");
              window.location.href = "/user/login"; // 또는 signupConfig.redirectUrl
          },
          error: function (xhr) {
              console.error("에러 발생:", xhr);
              alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
          }
      });
  });
});