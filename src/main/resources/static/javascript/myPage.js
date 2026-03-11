/* ===================================
   1. CSRF 토큰 및 전역 설정
=================================== */
const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

const THEMES = [
    { id: 'mountain', icon: '⛰️', label: '산' }, { id: 'waterfall', icon: '🌊', label: '폭포' },
    { id: 'valley', icon: '💦', label: '계곡' }, { id: 'sea', icon: '🏖️', label: '바다' },
    { id: 'lake', icon: '🚣', label: '호수' }, { id: 'river', icon: '🏞️', label: '강' },
    { id: 'cave', icon: '🦇', label: '동굴' }, { id: 'history', icon: '🏯', label: '역사 관광지' },
    { id: 'temple', icon: '🙏', label: '사찰' }, { id: 'spa', icon: '♨️', label: '온천/스파' },
    { id: 'themepark', icon: '🎡', label: '테마공원' }, { id: 'experience', icon: '🚜', label: '체험' },
    { id: 'view', icon: '🗼', label: '기념/전망' }, { id: 'culture', icon: '🏛️', label: '문화시설' },
    { id: 'leisure', icon: '🚲', label: '레포츠' }
];

let wishListData = [];
let finishedListData = [];
const pageSize = 6;







/* ===================================
    1. 초기화 및 이벤트 리스너 
=================================== */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadUserInfo();

    // 페이지 로드 시 찜 목록과 완료 목록 데이터 미리 확보
    loadRelationData(10);
    loadRelationData(20);

    // 메뉴 전환 및 탭 데이터 연동 로직
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', async function () {
            const target = this.dataset.menu; // 'info', 'wish', 'completed'

            // 1. 모든 메뉴에서 active 제거 후 클릭한 메뉴에 추가
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            // 2. 모든 컨텐츠 패널 숨김 후 타겟 패널 표시
            document.querySelectorAll('.content-pane').forEach(pane => pane.style.display = 'none');
            const targetPane = document.getElementById(`content-${target}`);
            if (targetPane) targetPane.style.display = 'block';

            // 3. 탭 클릭 시 실시간 데이터 로드 (relClsf 값 전달)
            if (target === 'wish') {
                // 찜 목록(10) 데이터 새로 불러오고 렌더링
                await loadRelationData(10);
                renderListPage(1, 10);
            } else if (target === 'completed') {
                // 여행 완료(20) 데이터 새로 불러오고 렌더링
                await loadFinishedData();    
                renderFinishedListPage(1);
            }

            lucide.createIcons(); // 동적 생성된 아이콘 재생성
        });
    });

    // 부드러운 애니메이션 토글로 변경
    const setupToggle = (btnId, panelId) => {
        document.getElementById(btnId)?.addEventListener('click', () => {
            const target = document.getElementById(panelId);
            // 기존에 d-none이 있다면 제거
            target.classList.remove('d-none');
            target.classList.toggle('is-open');
        });
    };

    setupToggle('btn-nick-edit-toggle', 'nick-edit-fields');
    setupToggle('btn-pw-edit-toggle', 'pw-edit-fields');

    // 해시태그 편집 버튼 이벤트 유지
    document.getElementById('btn-tag-edit-toggle')?.addEventListener('click', openTagEditor);


    // [비밀번호 일치 실시간 체크] - DOMContentLoaded 내부에 추가
    const newPw = document.getElementById('new-pw');
    const confirmPw = document.getElementById('confirm-pw');
    const pwMsg = document.getElementById('pw-match-msg');

    const checkMatch = () => {
        if (!newPw.value || !confirmPw.value) {
            pwMsg.innerText = "";
            return;
        }
        if (newPw.value === confirmPw.value) {
            pwMsg.innerText = "비밀번호가 일치합니다.";
            pwMsg.style.color = "green";
        } else {
            pwMsg.innerText = "비밀번호가 일치하지 않습니다.";
            pwMsg.style.color = "red";
        }
    };

    newPw?.addEventListener('input', checkMatch);
    confirmPw?.addEventListener('input', checkMatch);



});

/* ===================================
   2. 태그 편집기 열기 (모달 내용 생성)
=================================== */
function openTagEditor() {
    const wrapper = document.getElementById('theme-list-wrapper');
    if (!wrapper) {
        console.error("theme-list-wrapper를 찾을 수 없습니다.");
        return;
    }

    // 현재 화면(사이드바나 본문)에 표시된 태그들을 가져와서 선택 상태로 만듭니다.
    const currentTags = Array.from(document.querySelectorAll('#hashtag-container span'))
        .map(span => span.innerText.replace('#', '').trim());

    // THEMES 배열을 바탕으로 버튼 생성
    wrapper.innerHTML = THEMES.map(t => {
        const isSelected = currentTags.includes(t.label);
        const btnClass = isSelected ? 'btn-warning text-white' : 'btn-outline-secondary';
        return `
            <button type="button" class="btn ${btnClass} btn-sm m-1 tag-select-btn" 
                    data-label="${t.label}" onclick="toggleTagSelection(this)">
                ${t.icon} ${t.label}
            </button>
        `;
    }).join('');
}

// 태그 선택/해제 토글 함수도 함께 있어야 합니다.
function toggleTagSelection(btn) {
    btn.classList.toggle('btn-warning');
    btn.classList.toggle('text-white');
    btn.classList.toggle('btn-outline-secondary');
}




/* ===================================
   3. 공통 전송 함수
=================================== */
async function secureFetch(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData,
        headers: { [csrfHeader]: csrfToken }
    });
}

/* ===================================
   4. 데이터 로드 및 렌더링
=================================== */
async function loadUserInfo() {
    try {
        const res = await fetch('/mypage/getUserInfo.do');
        const data = await res.json();
        if (!data) return;

        document.getElementById('sidebar-nickname').innerText = data.userNick || '여행자';
        document.getElementById('sidebar-email').innerText = data.userEmlAddr || '';
        document.getElementById('display-nickname').innerText = data.userNick || '여행자';
        document.getElementById('info-name').innerText = data.userNm || '-';
        document.getElementById('info-phone').innerText = data.userTelno || '-';

        const fullAddr = `${data.userAddr || ''} ${data.userDaddr || ''}`.trim();
        document.getElementById('current-addr-text').innerText = fullAddr || '주소를 등록해 주세요.';

        if (data.userTag) renderTags(data.userTag);
    } catch (e) { console.error("정보 로드 실패", e); }
}

function renderTags(tagStr) {
    if (!tagStr) {
        document.getElementById('selected-hashtags-display').innerHTML = '태그를 선택해 주세요.';
        return;
    };

    const tags = tagStr.split(',');
    const container = document.getElementById('hashtag-container'); // 사이드바
    const display = document.getElementById('selected-hashtags-display'); // 본문

    // 사이드바용 (작은 배지)
    const sidebarHtml = tags.map(tagName => {
        const theme = THEMES.find(t => t.label === tagName.trim());
        const icon = theme ? theme.icon : '#';
        return `<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2 py-1 me-1" style="font-size:0.75rem;">${icon} ${tagName.trim()}</span>`;
    }).join('');

    // 본문용 (왼쪽 밀착 & 아이콘 포함)
    const mainHtml = tags.map(tagName => {
        const theme = THEMES.find(t => t.label === tagName.trim());
        const icon = theme ? theme.icon : '#';
        return `<span class="badge bg-warning text-white rounded-pill px-3 py-2 me-2 mb-2 d-inline-flex align-items-center gap-1">
                    <span>${icon}</span> ${tagName.trim()}
                </span>`;
    }).join('');

    if (container) container.innerHTML = sidebarHtml;
    if (display) {
        display.style.textAlign = 'left'; // 왼쪽 밀착 보장
        display.innerHTML = mainHtml;
    }
}

/* ===================================
   5. 수정 기능 (POST 요청들)
=================================== */

// [주소] 카카오 우편번호 서비스
function execPostCode() {
    new daum.Postcode({
        oncomplete: function (data) {
            // 1. 주소 수정 폼 영역 가져오기
            const addrPanel = document.getElementById('addr-edit-fields');

            // 2. d-none 제거 및 부드러운 애니메이션 클래스 추가
            addrPanel.classList.remove('d-none');
            // 브라우저가 d-none 제거를 인식한 후 애니메이션이 실행되도록 약간의 지연 부여
            setTimeout(() => {
                addrPanel.classList.add('is-open');
            }, 10);

            // 3. API로부터 받은 데이터를 각 입력 필드에 세팅
            document.getElementById('postcode').value = data.zonecode;     // 우편번호
            document.getElementById('address-base').value = data.roadAddress; // 도로명 주소

            // 4. 상세주소 입력 필드로 포커스 이동 (사용자가 바로 입력할 수 있게)
            document.getElementById('address-detail').focus();
        }
    }).open();
}
function validateNickname(nickname) {
    // 한글(가-힣), 영문, 숫자만 허용 (초성/모음 단독 사용 불가)
    //const regex = /^[a-zA-Z0-9가-힣]+$/;  필요시 정규식 수정가능

    // 한글 초성/모음 범위를 직접 체크하여 포함 여부 확인
    const jaumMoumRegex = /[ㄱ-ㅎㅏ-ㅣ]/;

    if (jaumMoumRegex.test(nickname)) {
        alert("닉네임에 초성이나 모음을 단독으로 사용할 수 없습니다. (예: 'ㅋㅋ', 'ㅠㅠ' 불가)");
        return false;
    }
    /*
    if (!regex.test(nickname)) {
        alert("닉네임은 한글, 영문, 숫자만 가능합니다.");
        return false;
    }*/

    if (nickname.length < 2 || nickname.length > 10) {
        alert("닉네임은 2~10자 사이여야 합니다.");
        return false;
    }

    return true;
}

// [주소] 저장
document.getElementById('btn-addr-save')?.addEventListener('click', async () => {
    const fd = new FormData();
    fd.append("userZip", document.getElementById('postcode').value);
    fd.append("userAddr", document.getElementById('address-base').value);
    fd.append("userDaddr", document.getElementById('address-detail').value);

    const res = await secureFetch('/mypage/updateAddr.do', fd);
    if (await res.json() > 0) { alert("주소가 수정되었습니다."); location.reload(); }
});

// [닉네임] 중복 확인 (경로 수정됨)
document.getElementById('btn-nick-check')?.addEventListener('click', function () {
    const nick = document.getElementById('new-nickname').value;
    const msg = document.getElementById('nick-msg');
    const saveBtn = document.getElementById('btn-nick-save');

    // 1. 빈 값 체크
    if (!nick) {
        alert("닉네임을 입력하세요.");
        return;
    }

    // 2. 유효성 검사 (초성, 특수문자, 길이 체크)
    if (!validateNickname(nick)) {
        // validateNickname 내부에서 alert를 띄우므로 여기선 메시지 초기화만
        msg.innerText = "";
        saveBtn.disabled = true;
        return;
    }
    // 컨트롤러 경로에 맞게 수정 (.do 추가)
    fetch(`/mypage/nickCheck.do?nickname=${encodeURIComponent(nick)}`)
        .then(res => res.json())
        .then(count => {
            if (count > 0) {
                msg.innerText = "이미 사용 중인 닉네임입니다.";
                msg.style.color = "red";
                saveBtn.disabled = true;
            } else {
                msg.innerText = "사용 가능한 닉네임입니다.";
                msg.style.color = "green";
                saveBtn.disabled = false;
            }
        });
});

document.getElementById('new-nickname')?.addEventListener('input', () => {
    const msg = document.getElementById('nick-msg');
    const saveBtn = document.getElementById('btn-nick-save');
    msg.innerText = "중복 확인이 필요합니다.";
    msg.style.color = "gray";
    saveBtn.disabled = true;
});


// [닉네임] 저장
document.getElementById('btn-nick-save')?.addEventListener('click', async () => {
    const val = document.getElementById('new-nickname').value;
    const fd = new FormData();
    fd.append("userNick", val);
    const res = await secureFetch('/mypage/updateNick.do', fd);
    if (await res.json() > 0) location.reload();
});

// [비밀번호] 저장 버튼 클릭 시
document.getElementById('btn-pw-save')?.addEventListener('click', async () => {
    const cur = document.getElementById('current-pw').value.trim();
    const nPw = document.getElementById('new-pw').value.trim();
    const cfm = document.getElementById('confirm-pw').value.trim();

    // 1. 모든 필드 입력 여부 확인
    if (!cur || !nPw || !cfm) {
        alert("모든 비밀번호 필드를 입력해 주세요.");
        return;
    }

    // 2. 현재 비밀번호와 새 비밀번호가 같은지 확인 (보안 강화)
    if (cur === nPw) {
        alert("새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.");
        return;
    }

    // 3. 새 비밀번호와 확인창 일치 여부 확인
    if (nPw !== cfm) {
        alert("새 비밀번호 확인이 일치하지 않습니다.");
        return;
    }

    // 4. (추가 제안) 비밀번호 최소 길이 검증 
    if (8<=nPw.length<=16 ) {
        alert("새 비밀번호는 최소 8자 이상 16자 이하이어야 합니다.");
        return;
    }

    // 5. 서버 전송 데이터 구성
    const fd = new FormData();
    fd.append("userEnpswd", cur); // 서버 측에서 현재 비밀번호가 맞는지 검증용
    fd.append("newPw", nPw);      // 실제 변경할 비밀번호

    try {
        const res = await secureFetch('/mypage/updatePw.do', fd);
        const result = await res.json();

        if (result > 0) {
            alert("비밀번호가 성공적으로 변경되었습니다.");
            location.reload();
        } else if (result === -1) {
            // 서버에서 현재 비밀번호 불일치를 -1 등으로 보낼 경우 예시
            alert("현재 비밀번호가 일치하지 않습니다.");
        } else {
            alert("비밀번호 변경에 실패했습니다. 다시 시도해 주세요.");
        }
    } catch (e) {
        console.error("비밀번호 수정 중 통신 에러:", e);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
});
/*비밀번호 표시 토글 기능*/
function togglePassword(inputId, iconElement) {
    const passwordInput = document.getElementById(inputId);
    if (!passwordInput) return;

    // 1. input 타입 변경 (text <-> password)
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // 2. 아이콘 변경 (눈 뜬 모양 -> 눈 감은 모양)
        // Lucide 아이콘을 사용하는 경우 클래스나 속성 변경
        iconElement.innerHTML = `<i data-lucide="eye-off" style="width:20px;"></i>`;
    } else {
        passwordInput.type = 'password';
        iconElement.innerHTML = `<i data-lucide="eye" style="width:20px;"></i>`;
    }

    // Lucide 아이콘 재생성
    lucide.createIcons();
}
/* ===================================
    8. 비밀번호 표시 토글 기능 
=================================== */
window.togglePassword = function (inputId) {
    const pwInput = document.getElementById(inputId);
    if (!pwInput) return;

    // input과 같은 부모(password-wrapper) 안에 있는 .pw-icon 아이콘 찾기
    const icon = pwInput.parentElement.querySelector('.pw-icon');

    if (pwInput.type === 'password') {
        pwInput.type = 'text';
        if (icon) icon.setAttribute('data-lucide', 'eye-off');
    } else {
        pwInput.type = 'password';
        if (icon) icon.setAttribute('data-lucide', 'eye');
    }

    // Lucide 아이콘 재생성
    if (window.lucide) {
        lucide.createIcons();
    }
};

/* ===================================
   6. 찜(10) / 완료(20) 통합 로직
=================================== */
async function loadRelationData(relClsf) {
    try {
        const res = await fetch(`/mypage/getRelationList.do?relClsf=${relClsf}`);

        // 500 에러 등이 발생했을 경우 처리
        if (!res.ok) {
            console.error(`서버 응답 에러: ${res.status}`);
            return;
        }

        const data = await res.json();
        const finalData = Array.isArray(data) ? data : [];

        if (relClsf === 10) {
            wishListData = finalData;
            // 사이드바와 배지 개수 업데이트
            const sidebarCount = document.getElementById('sidebar-wish-count');
            const badgeCount = document.getElementById('wish-count-badge');
            if (sidebarCount) sidebarCount.innerText = finalData.length;
            if (badgeCount) badgeCount.innerText = finalData.length;
        } else {
            completedListData = finalData;
        }
    } catch (e) {
        console.error("데이터 파싱 실패:", e);
    }
}

function renderListPage(page, relClsf) {
    // 1. 데이터 및 ID 세팅
    const dataList = (relClsf === 10) ? wishListData : finishedListData; // 'completedListData'를 'finishedListData'로 확인 필요
    const rowId = (relClsf === 10) ? 'wish-items-row' : 'complete-items-row';
    const pagiId = (relClsf === 10) ? 'wish-pagination' : 'complete-pagination';

    const start = (page - 1) * pageSize;
    const pagedList = dataList.slice(start, start + pageSize);
    const row = document.getElementById(rowId);

    if (!row) return;

    if (!pagedList || pagedList.length === 0) {
        row.innerHTML = '<div class="col-12 text-center py-5 text-muted">항목이 없습니다.</div>';
    } else {
        row.innerHTML = pagedList.map(item => {
            // 디자인 분기 처리
            const isWish = (relClsf === 10);
            const rate = item.cmtStarng || 0;
            
            // 삭제 함수 호출 분기 (여행 완료는 cmtNo가 필요할 수 있음)
            const deleteTag = isWish 
                ? `deleteRelationItem('${item.tripContsId}', 10)` 
                : `deleteFinishedItem(${item.cmtNo}, ${item.tripContsId})`;

            return `
            <div class="col-md-4 mb-3">
                <div class="card h-100 border-0 shadow-sm overflow-hidden" style="border-radius:15px;">
                    <div style="position:relative;">
                        <img src="${item.tripPathNm || '/images/common/no-image.png'}" 
                             class="card-img-top" 
                             style="height:140px; object-fit:cover; cursor:pointer;"
                             onclick="location.href='/trip/trip_view?tripContsId=${item.tripContsId}'">
                        
                        <button onclick="${deleteTag}" 
                                style="position:absolute; top:8px; right:8px; border:none; background:rgba(255,255,255,0.9); border-radius:50%; width:28px; height:28px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; z-index:10;">
                            <i data-lucide="trash-2" size="14" style="color:#ff4d4f;"></i>
                        </button>

                        <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.6); color:white; padding:2px 8px; border-radius:20px; font-size:0.75rem; display:flex; align-items:center; gap:3px;">
                            ${isWish 
                                ? `<i data-lucide="heart" size="12" style="fill:#ff4d4f; color:#ff4d4f;"></i><span class="fw-bold"></span>`
                                : `<i data-lucide="star" size="12" style="fill:#ffc107; color:#ffc107;"></i><span class="fw-bold">${rate}</span>`
                            }
                        </div>
                    </div>

                    <div class="card-body p-3">
                        <h6 class="fw-bold text-truncate mb-1" title="${item.tripNm}">${item.tripNm}</h6>
                        <p class="text-muted small mb-0 text-truncate" style="font-size:0.75rem;">
                            <i data-lucide="map-pin" size="10" class="me-1"></i>${item.tripAddr || '주소 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
    
    // 페이지네이션 및 아이콘 렌더링
    renderPagination(dataList.length, page, pagiId, relClsf);
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderPagination(totalCount, currentPage, containerId, relClsf) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const container = document.getElementById(containerId);
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = (i === currentPage) ? 'btn-warning text-white' : 'btn-light';
        html += `<button class="btn btn-sm ${activeClass} me-1" onclick="renderListPage(${i}, ${relClsf})">${i}</button>`;
    }
    container.innerHTML = html;
}

// 개별 삭제 (통합)
async function deleteRelationItem(tripContsId, relClsf) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const fd = new FormData();
    fd.append("relClsf", relClsf);
    fd.append("tripContsId", tripContsId);

    const res = await secureFetch('/mypage/deleteRelation.do', fd);
    if (await res.json() > 0) {
        alert("삭제되었습니다.");
        await loadRelationData(relClsf);
        renderListPage(1, relClsf);
    }

}

/* ===================================
    7. 태그 저장 기능
=================================== */
async function saveTags() {
    // 1. 모달 내에서 선택된(btn-warning 클래스 보유) 버튼들 찾기
    const selectedBtns = document.querySelectorAll('.tag-select-btn.btn-warning');

    // 2. label 값들을 추출하여 콤마(,)로 연결된 문자열 생성
    const selectedLabels = Array.from(selectedBtns).map(btn => btn.dataset.label);
    const tagStr = selectedLabels.join(',');

    const fd = new FormData();
    fd.append("userTag", tagStr);

    try {
        // 3. 서버 전송 (기존에 정의하신 secureFetch 활용)
        const res = await secureFetch('/mypage/updateTag.do', fd);
        const result = await res.json();

        if (result > 0) {
            alert("관심 해시태그가 성공적으로 변경되었습니다.");

            // 4. 모달 닫기 (부트스트랩 5 기준)
            const modalElement = document.getElementById('tagModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // 5. 화면의 태그 영역들 즉시 갱신
            renderTags(tagStr);

            // 사이드바 등 동기화가 더 필요하다면 페이지 리로드도 방법입니다.
            // location.reload(); 
        } else {
            alert("저장에 실패했습니다. 다시 시도해 주세요.");
        }
    } catch (e) {
        console.error("태그 저장 중 오류 발생:", e);
        alert("서버 통신 오류가 발생했습니다.");
    }
}
/* ===================================
   여행 완료(댓글 기반) 통합 관리 로직
=================================== */

/**
 * 1. 데이터 로드 함수: 서버에서 내가 댓글(후기)을 남긴 여행지 목록을 가져옵니다.
 */
async function loadFinishedData() {
    try {
        const res = await fetch('/mypage/selectTripFinishedList.do');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        // 전역 변수 finishedListData에 저장
        finishedListData = Array.isArray(data) ? data : [];

        // 사이드바와 본문 헤더 숫자를 동시에 업데이트
        const sidebarCount = document.getElementById('sidebar-completed-count'); // 사이드바용
        const badgeCount = document.getElementById('complete-count-badge');     // 본문 헤더용

        const totalCount = finishedListData.length;

        if (sidebarCount) sidebarCount.innerText = totalCount;
        if (badgeCount) badgeCount.innerText = totalCount;

    } catch (e) {
        console.error("완료 목록 로드 실패:", e);
    }
}

/**
 * 2. 리스트 렌더링 함수: 데이터를 6개씩 끊어서 카드 형태로 화면에 출력합니다.
 * @param {number} page - 현재 페이지 번호
 */
function renderFinishedListPage(page) {
    const row = document.getElementById('complete-items-row');
    const pagiId = 'complete-pagination';
    if (!row) return;

    // 페이징 처리 (pageSize = 6)
    const start = (page - 1) * pageSize;
    const pagedList = finishedListData.slice(start, start + pageSize);

    if (pagedList.length === 0) {
        row.innerHTML = '<div class="col-12 text-center py-5 text-muted">완료한 여행 기록이 없습니다.</div>';
    } else {
        row.innerHTML = pagedList.map(item => {
            // 별점(cmt_starng) 처리: null일 경우 0으로 표시
            const rate = item.cmtStarng || 0;

            return `
            <div class="col-md-4 mb-3">
                <div class="card h-100 border-0 shadow-sm overflow-hidden" style="border-radius:15px;">
                    <div style="position:relative;">
                        <img src="${item.tripPathNm || '/images/common/no-image.png'}" 
                             class="card-img-top" 
                             style="height:140px; object-fit:cover; cursor:pointer;"
                             onclick="location.href='/trip/trip_view?tripContsId=${item.tripContsId}'">
                        
                        <button onclick="deleteFinishedItem(${item.event},${item.cmtNo}, ${item.tripContsId})" 
                                style="position:absolute; top:8px; right:8px; border:none; background:rgba(255,255,255,0.9); border-radius:50%; width:28px; height:28px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; z-index:10;">
                            <i data-lucide="trash-2" size="14" style="color:#ff4d4f;"></i>
                        </button>

                        <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.6); color:white; padding:2px 8px; border-radius:20px; font-size:0.75rem; display:flex; align-items:center; gap:3px;">
                            <i data-lucide="star" size="12" style="fill:#ffc107; color:#ffc107;"></i>
                            <span class="fw-bold">${rate}</span>
                        </div>
                    </div>

                    <div class="card-body p-3">
                        <h6 class="fw-bold text-truncate mb-1" title="${item.tripNm}">${item.tripNm}</h6>
                        <p class="text-muted small mb-0 text-truncate" style="font-size:0.75rem;">
                            <i data-lucide="map-pin" size="10" class="me-1"></i>${item.tripAddr || '주소 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // 공통 페이징 함수 호출 (999는 완료 목록 구분자)
    renderPagination(finishedListData.length, page, pagiId, 999);
    if (window.lucide) lucide.createIcons();
}
/**
 * 3. 삭제 함수: 후기(댓글)와 여행지 완료 상태를 동시에 삭제합니다.
 */
async function deleteFinishedItem(event, cmtNo, tripContsId) {
    if (event) event.stopPropagation(); // 카드 클릭 이벤트 전파 차단

    // 데이터 누락 여부 확인용 로그
    console.log("전송 데이터:", { cmtNo, tripContsId });

    if (!cmtNo || !tripContsId) {
        alert("삭제에 필요한 정보가 누락되었습니다.");
        return;
    }

    if (!confirm('삭제 시, 여행지 리뷰도 함께 삭제됩니다. 삭제하시겠습니까?')) return;

    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    const params = new URLSearchParams();
    // [중요] 컨트롤러의 @RequestParam 명칭과 토씨 하나 안 틀리고 맞춰야 합니다.
    params.append('cmtNo', cmtNo);           
    params.append('tripContsId', tripContsId); // 💡 tripId가 아니라 'tripContsId'여야 합니다!

    try {
        const res = await fetch('/mypage/deleteFinishedTrip.do', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...(csrfHeader && csrfToken ? { [csrfHeader]: csrfToken } : {})
            },
            body: params
        });

        if (res.ok) {
            const result = await res.json();
            if (result > 0) {
                alert('삭제되었습니다.');
                await loadFinishedData();      // 서버에서 최신 목록 다시 가져오기
                renderFinishedListPage(1);     // 1페이지 다시 그리기
            } else {
                alert('삭제 처리에 실패했습니다. (결과값 0)');
            }
        } else {
            // 여기서 400 에러가 난다면 파라미터 이름이 여전히 안 맞는 것입니다.
            const errorText = await res.text();
            console.error("서버 응답 에러:", res.status, errorText);
            alert(`잘못된 요청입니다. (${res.status})`);
        }
    } catch (e) {
        console.error('삭제 에러:', e);
    }
}


