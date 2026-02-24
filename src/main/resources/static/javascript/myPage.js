document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- 1. 닉네임 관리 ---
    const nickEditBtn = document.getElementById('btn-nick-edit-toggle');
    const nickFields = document.getElementById('nick-edit-fields');
    
    if (nickEditBtn) {
        nickEditBtn.addEventListener('click', () => {
            const isHidden = nickFields.classList.toggle('d-none');
            nickEditBtn.textContent = isHidden ? '변경하기' : '취소';
        });
    }

    document.getElementById('btn-nick-save')?.addEventListener('click', () => {
        const val = document.getElementById('new-nickname').value;
        if(!val.trim()) return alert("닉네임을 입력하세요.");
        document.getElementById('display-nickname').textContent = val;
        document.getElementById('sidebar-nickname').textContent = val;
        alert("변경되었습니다.");
        nickFields.classList.add('d-none');
        nickEditBtn.textContent = '변경하기';
    });

    // --- 2. 비밀번호 관리 ---
    const pwEditBtn = document.getElementById('btn-pw-edit-toggle');
    const pwFields = document.getElementById('pw-edit-fields');
    const newPw = document.getElementById('new-pw');
    const confirmPw = document.getElementById('confirm-pw');
    const feedback = document.getElementById('pw-match-feedback');

    if (pwEditBtn) {
        pwEditBtn.addEventListener('click', () => {
            const isHidden = pwFields.classList.toggle('d-none');
            pwEditBtn.textContent = isHidden ? '변경하기' : '취소';
        });
    }

    function validatePw() {
        if (!confirmPw.value) { feedback.textContent = ""; return; }
        if (newPw.value === confirmPw.value) {
            feedback.textContent = "일치함"; feedback.style.color = "#22c55e";
        } else {
            feedback.textContent = "불일치"; feedback.style.color = "#ef4444";
        }
    }
    
    newPw?.addEventListener('input', validatePw);
    confirmPw?.addEventListener('input', validatePw);

    document.getElementById('btn-pw-save')?.addEventListener('click', () => {
        if (newPw.value && newPw.value === confirmPw.value) {
            alert("성공적으로 변경되었습니다.");
            pwFields.classList.add('d-none');
            pwEditBtn.textContent = '변경하기';
        } else {
            alert("비밀번호를 확인해 주세요.");
        }
    });

    // --- 3. 주소지 관리 ---
    const addrEditBtn = document.getElementById('btn-addr-edit-toggle');
    const addrFields = document.getElementById('addr-edit-fields');
    const addrText = document.getElementById('current-addr-text');

    if (addrEditBtn) {
        addrEditBtn.addEventListener('click', () => {
            const isHidden = addrFields.classList.toggle('d-none');
            addrEditBtn.textContent = isHidden ? '수정하기' : '취소';
        });
    }

    document.getElementById('btn-addr-save')?.addEventListener('click', () => {
        const post = document.getElementById('postcode').value;
        const base = document.getElementById('address-base').value;
        const detail = document.getElementById('address-detail').value;
        if (!post || !base) return alert("주소를 검색해 주세요.");
        addrText.textContent = `(${post}) ${base} ${detail}`;
        addrText.className = "small fw-bold text-primary mb-0";
        alert("주소가 저장되었습니다.");
        addrFields.classList.add('d-none');
        addrEditBtn.textContent = '수정하기';
    });

    // --- 4. 해시태그 시스템 ---
    const hashtagData = {
        "자연": ["산", "폭포", "계곡", "바다", "해안절경", "해수욕장", "항구/포구", "등대", "호수", "강", "동굴"],
        "역사/문화": ["고궁", "성", "문", "민속마을", "유적지/사적지", "사찰", "박물관", "기념관", "전시관", "미술관/화랑", "영화관"],
        "휴식/체험": ["온천/욕장/스파", "테마공원", "농.산.어촌체험", "전통체험", "산사체험", "기념탑", "전망대"],
        "레포츠": ["경기장", "인라인", "자전거하이킹", "카트", "골프", "경륜", "승마", "윈드서핑", "제트스키", "카약/카누", "요트", "스노쿨링", "스킨스쿠버", "낚시", "수영", "래프팅", "스카이다이빙", "페러글라이딩"]
    };

    const groupContainer = document.getElementById('hashtag-selection-groups');
    if (groupContainer) {
        for (const [category, tags] of Object.entries(hashtagData)) {
            let html = `<div class="category-title">${category}</div><div class="d-flex flex-wrap gap-2">`;
            tags.forEach(tag => {
                html += `
                    <input type="checkbox" id="tag-${tag}" class="tag-checkbox" value="${tag}">
                    <label for="tag-${tag}" class="tag-label">${tag}</label>
                `;
            });
            html += `</div>`;
            groupContainer.innerHTML += html;
        }
    }

    document.getElementById('btn-save-hashtags')?.addEventListener('click', function() {
        const checkedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        if (checkedTags.length === 0) return alert("최소 하나 이상의 키워드를 선택해주세요.");

        const badges = checkedTags.map(tag => `<span class="badge bg-primary-subtle rounded-pill px-3 py-2">#${tag}</span>`).join('');
        document.getElementById('hashtag-container').innerHTML = badges;
        document.getElementById('selected-hashtags-display').innerHTML = badges;

        const modalElement = document.getElementById('hashtagModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        alert("성공적으로 저장되었습니다.");
    });
});

// 카카오 주소 API 함수 (글로벌 스코프 유지)
function execPostCode() {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById('postcode').value = data.zonecode;
            document.getElementById('address-base').value = data.address;
            document.getElementById('address-detail').focus();
        }
    }).open();
}