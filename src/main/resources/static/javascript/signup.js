/**
 * [회원가입 페이지 로직]
 *
 * - jQuery를 사용하여 DOM 조작 및 AJAX 비동기 통신 처리
 * - 여행 테마 렌더링, 닉네임 중복 확인, 이메일 인증, 회원가입 제출 기능 포함
 */

// =========================================================================
// [전역 변수 및 설정 정의]
// =========================================================================

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
  useRealApi: false, // 닉네임/회원가입 API는 아직 false 유지(이메일만 실제 호출해도 됨)

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
  existingNicknames: ["해봄이", "관리자", "여행왕", "admin", "test"],
  verificationCode: "123456"
};

// =========================================================================
// [핵심 함수 정의]
// =========================================================================

function renderThemes() {
  console.log("Rendering themes...", THEMES.length, "items");

  const $container = $('#theme-container');
  if ($container.length === 0) {
    console.error("Error: #theme-container element not found in DOM.");
    return;
  }

  try {
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

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// =========================================================================
// [DOM 로드 후 실행 로직]
// =========================================================================

$(document).ready(function () {
  console.log("Signup Page Script Loaded (jQuery Ready)");

  // 1) 테마 렌더링
  renderThemes();

  // 2) Lucide 초기 렌더링
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // =========================================================================
  // 1. 이메일 인증 - 인증번호 전송
  // =========================================================================
  $('#btn-send-code').on('click', function () {
    const email = $('#email').val().trim();
    const $msg = $('#email-message');
    const $btn = $(this);

    if (!email) {
      $msg.removeClass('hidden text-green-600').addClass('text-red-500')
        .text("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail(email)) {
      $msg.removeClass('hidden text-green-600').addClass('text-red-500')
        .text("이메일 형식이 올바르지 않습니다. (예: test@haebom.com)");
      return;
    }

    const originalText = $btn.text();
    $btn.prop('disabled', true).text('전송 중...');

    $.ajax({
      url: signupConfig.endpoints.sendEmailCode,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email }),
      success: function (res) {
        if (res.success) {
          $msg.removeClass('hidden text-red-500').addClass('text-green-600')
            .text(res.message);

          $('#email-verify-area').removeClass('hidden');
          $('#verify-code').focus();
        } else {
          $msg.removeClass('hidden text-green-600').addClass('text-red-500')
            .text(res.message);
        }
      },
      error: function () {
        $msg.removeClass('hidden text-green-600').addClass('text-red-500')
          .text("메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      },
      complete: function () {
        $btn.prop('disabled', false).text(originalText);
      }
    });
  });

  // =========================================================================
  // 2. 이메일 인증 - 인증번호 확인
  // =========================================================================
  $('#btn-verify-code').on('click', function () {
    const code = $('#verify-code').val().trim();
    const $vmsg = $('#email-verify-message');

    if (!code) {
      $vmsg.removeClass('hidden text-green-600').addClass('text-red-500')
        .text("인증번호를 입력해주세요.");
      return;
    }

    $.ajax({
      url: signupConfig.endpoints.verifyEmailCode,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email: $('#email').val().trim(), code }),
      success: function (res) {
        if (res.success) {
          $vmsg.removeClass('hidden text-red-500').addClass('text-green-600')
            .text(res.message);

          $('#email').prop('disabled', true);
          $('#verify-code').prop('disabled', true);
          $('#btn-send-code').prop('disabled', true).text('인증완료');

          formState.isEmailVerified = true;
        } else {
          $vmsg.removeClass('hidden text-green-600').addClass('text-red-500')
            .text(res.message);
        }
      },
      error: function () {
        $vmsg.removeClass('hidden text-green-600').addClass('text-red-500')
          .text("인증 확인 중 오류가 발생했습니다.");
      }
    });
  });

  // =========================================================================
  // 3. 닉네임 중복 확인 기능
  // =========================================================================
  $('#btn-check-nickname').on('click', function () {
    const nickname = $('#nickname').val().trim();
    const $msg = $('#nickname-message');
    const $btn = $(this);
    const $input = $('#nickname');

    if (!nickname) {
      alert("닉네임을 입력해주세요.");
      $input.focus();
      return;
    }

    if (nickname.length < 2) {
      $msg.removeClass('hidden text-green-600').addClass('text-red-500')
        .text("닉네임은 2글자 이상이어야 합니다.");
      $msg.show();
      $input.removeClass('border-green-500 ring-1 ring-green-500')
        .addClass('border-red-500 ring-1 ring-red-500');
      return;
    }

    const originalText = $btn.text();
    $btn.prop('disabled', true).text('확인 중...');

    if (signupConfig.useRealApi) {
      $.ajax({
        url: signupConfig.endpoints.checkNickname,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ nickname }),
        success: function () {
          handleNicknameSuccess(nickname);
        },
        error: function () {
          handleNicknameFailure("이미 사용 중인 닉네임입니다.");
        },
        complete: function () {
          $btn.prop('disabled', false).text(originalText);
        }
      });
    } else {
      setTimeout(function () {
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

    $msg.removeClass('hidden text-red-500').addClass('text-green-600')
      .text("사용 가능한 닉네임입니다.");
    $msg.show();

    formState.isNicknameChecked = true;
    formState.checkedNickname = nickname;

    $input.removeClass('border-red-500 ring-1 ring-red-500')
      .addClass('border-green-500 ring-1 ring-green-500');
  }

  function handleNicknameFailure(message) {
    const $msg = $('#nickname-message');
    const $input = $('#nickname');

    $msg.removeClass('hidden text-green-600').addClass('text-red-500')
      .text(message);
    $msg.show();

    formState.isNicknameChecked = false;

    $input.removeClass('border-green-500 ring-1 ring-green-500')
      .addClass('border-red-500 ring-1 ring-red-500');
  }

  $('#nickname').on('input', function () {
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
  $('#password, #password-confirm').on('keyup', function () {
    const pw = $('#password').val();
    const confirmPw = $('#password-confirm').val();
    const $msg = $('#password-message');

    if (confirmPw === "") {
      $msg.addClass('hidden');
      return;
    }

    if (pw === confirmPw) {
      $msg.removeClass('hidden text-red-500').addClass('text-green-600')
        .text("비밀번호가 일치합니다.");
    } else {
      $msg.removeClass('hidden text-green-600').addClass('text-red-500')
        .text("비밀번호가 일치하지 않습니다.");
    }
  });

  // =========================================================================
  // 5. 전화번호 자동 하이픈
  // =========================================================================
  $('#phone').on('input', function () {
    let number = $(this).val().replace(/[^0-9]/g, "");
    let phone = "";

    if (number.length < 4) {
      phone = number;
    } else if (number.length < 7) {
      phone = number.substr(0, 3) + "-" + number.substr(3);
    } else if (number.length < 11) {
      phone = number.substr(0, 3) + "-" + number.substr(3, 3) + "-" + number.substr(6);
    } else {
      phone = number.substr(0, 3) + "-" + number.substr(3, 4) + "-" + number.substr(7, 4);
    }

    if (phone.length > 13) phone = phone.substring(0, 13);
    $(this).val(phone);
  });

  // =========================================================================
  // 6. 주소 검색 (Mock)
  // =========================================================================
  $('button:contains("주소 검색")').on('click', function () {
    alert("[테스트] 주소 검색 팝업이 열립니다. \n서울시 강남구 테헤란로 123으로 자동 입력됩니다.");
    $('#zipcode').val('06123');
    $('#addr-basic').val('서울 강남구 테헤란로 123');
    $('#addr-detail').focus();
  });

  // =========================================================================
  // 7. 회원가입 폼 제출 처리
  // =========================================================================
  $('#signup-form').on('submit', function (e) {
    e.preventDefault();

    // ✅ 이메일 인증 완료 필수 체크 (여기로 이동!)
    if (!formState.isEmailVerified) {
      alert("이메일 인증을 완료해주세요.");
      $('#verify-code').focus();
      return;
    }

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

    const checkedThemes = $('input[name="themes"]:checked').length;
    if (checkedThemes < 3) {
      alert("여행 테마를 3개 이상 선택해주세요.");
      return;
    }

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
      themes: $('input[name="themes"]:checked').map(function () { return this.value; }).get()
    };

    console.log("전송할 회원가입 데이터:", formData);

    if (signupConfig.useRealApi) {
      $.ajax({
        url: signupConfig.endpoints.signup,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function () {
          alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
          window.location.href = signupConfig.redirectUrl;
        },
        error: function (xhr) {
          const msg = xhr.responseJSON ? xhr.responseJSON.message : "회원가입 중 오류가 발생했습니다.";
          alert(msg);
        }
      });
    } else {
      setTimeout(function () {
        alert("회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.");
        window.location.href = signupConfig.redirectUrl;
      }, 1000);
    }
  });

});