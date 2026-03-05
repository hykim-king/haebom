/**
 * [해봄트립 소셜 가입 전용 로직 - social_signup.js]
 */
const THEMES = [
    { id: 'mountain', icon: '⛰️', label: '산' }, { id: 'waterfall', icon: '🌊', label: '폭포' },
    { id: 'valley', icon: '💦', label: '계곡' }, { id: 'sea', icon: '🏖️', label: '바다' },
    { id: 'lake', icon: '🚣', label: '호수' }, { id: 'river', icon: '🏞️', label: '강' },
    { id: 'cave', icon: '🦇', label: '동굴' }, { id: 'history', icon: '🏯', label: '역사 관광지' },
    { id: 'temple', icon: '🙏', label: '사찰' }, { id: 'spa', icon: '♨️', label: '온천/스파' },
    { id: 'themepark', icon: '🎡', label: '테마공원' }, { id: 'experience', icon: '🚜', label: '체험' },
    { id: 'monument', icon: '🗼', label: '기념/전망' }, { id: 'culture', icon: '🏛️', label: '문화시설' },
    { id: 'leisure', icon: '🚲', label: '레포츠' }
];

$(document).ready(function() {
    renderThemes();

    // [1] 생년월일: 오늘 이후 날짜 선택 방지
    const today = new Date().toISOString().split('T')[0];
    $('#birth_picker').attr('max', today);

    // [2] 전화번호 자동 하이픈 (기존 signup.js의 유틸리티 로직 유지)
    $('input[name="userTelno"]').on('input', function() {
        let val = $(this).val().replace(/[^0-9]/g, '');
        if (val.length > 3 && val.length <= 7) {
            val = val.slice(0, 3) + '-' + val.slice(3);
        } else if (val.length > 7) {
            val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
        }
        $(this).val(val);
    });

    // [3] 닉네임 중복 확인
    $('#btn-check-nick').on('click', function() {
        const nickname = $('#nickname').val().trim();
        if (!nickname) { alert("닉네임을 입력해주세요."); return; }

        $.get('/user/check-nickname', { nickname: nickname }, function(isAvailable) {
            if (isAvailable) {
                if (confirm("사용 가능한 닉네임입니다. 사용하시겠습니까?")) {
                    $('#nickCheckDone').val('Y');
                    $('#nickname').prop('readonly', true);
                    $('#btn-check-nick').text('확인 완료').prop('disabled', true).addClass('bg-gray-400 text-white');
                }
            } else {
                alert("이미 사용 중인 닉네임입니다.");
                $('#nickCheckDone').val('N');
            }
        });
    });

    // [4] 주소 검색
    $('#btn-search-address').click(function(e) {
        e.preventDefault();
        new daum.Postcode({
            oncomplete: function(data) {
                $('#zipcode').val(data.zonecode);
                $('#addr-basic').val(data.address);
                $('#addr-detail').focus();
            }
        }).open();
    });

    // [5] 폼 제출 최종 검증
    $('#signupForm').on('submit', function() {
        if ($('#nickCheckDone').val() !== 'Y') {
            alert("닉네임 중복 확인을 먼저 완료해주세요.");
            return false;
        }

        const telno = $('input[name="userTelno"]').val().trim();
        const telReg = /^(01[016789]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
        if (!telReg.test(telno)) {
            alert("올바른 전화번호 형식이 아닙니다.");
            return false;
        }

        const birthVal = $('#birth_picker').val();
        if (!birthVal) {
            alert("생년월일을 선택해주세요.");
            return false;
        }
        $('#userBrdt').val(birthVal.replace(/-/g, ''));

        const checkedThemes = $('#theme-container input[type="checkbox"]:checked');
        if (checkedThemes.length < 3) {
            alert("여행 테마를 3개 이상 선택해주세요.");
            return false;
        }

        const tags = checkedThemes.map(function() { return $(this).val(); }).get().join(',');
        $('#userTag').val(tags);

        alert("가입을 환영합니다!");
        return true; 
    });
});

function renderThemes() {
    const container = $('#theme-container');
    container.empty();
    THEMES.forEach(theme => {
        container.append(`
            <label class="cursor-pointer group block">
                <input type="checkbox" value="${theme.label}" class="hidden peer">
                <div class="border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:border-orange-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 relative h-24 bg-white">
                    <span class="text-2xl">${theme.icon}</span>
                    <span class="text-xs font-bold text-slate-600">${theme.label}</span>
                    <div class="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </label>`);
    });
}