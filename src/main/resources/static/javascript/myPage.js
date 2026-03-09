/* ===================================
   1. CSRF 토크 및 전역 설정
=================================== */
const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

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
    { id: 'view', icon: '🗼', label: '기념/전망' },
    { id: 'culture', icon: '🏛️', label: '문화시설' },
    { id: 'leisure', icon: '🚲', label: '레포츠' }
];

let currentWishPage = 1;
const pageSize = 6;
let wishListData = [];

/* ===================================
   2. 초기화 및 이벤트 리스너
=================================== */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadUserInfo();
    loadWishList();

    // 메뉴 전환 로직
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const target = this.dataset.menu;
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.content-pane').forEach(pane => pane.style.display = 'none');
            const targetPane = document.getElementById(`content-${target}`);
            if (targetPane) targetPane.style.display = 'block';

            if (target === 'wish') renderWishPage(1);
            lucide.createIcons();
        });
    });

    // 수정 폼 토글 등록
    const setupToggle = (btnId, panelId) => {
        document.getElementById(btnId)?.addEventListener('click', () => {
            document.getElementById(panelId).classList.toggle('d-none');
        });
    };
    setupToggle('btn-nick-edit-toggle', 'nick-edit-fields');
    setupToggle('btn-pw-edit-toggle', 'pw-edit-fields');
    setupToggle('btn-addr-edit-toggle', 'addr-edit-fields');
    document.getElementById('btn-tag-edit-toggle')?.addEventListener('click', openTagEditor);
});

/* ===================================
   3. 공통 전송 함수 (CSRF 헤더 자동 포함)
=================================== */
async function secureFetch(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            [csrfHeader]: csrfToken
        }
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
    const tags = tagStr.split(',');
    const container = document.getElementById('hashtag-container');
    const display = document.getElementById('selected-hashtags-display');
    
    const sidebarHtml = tags.map(t => `<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2 py-1 me-1" style="font-size:0.75rem;">#${t.trim()}</span>`).join('');
    const mainHtml = tags.map(t => `<span class="badge bg-warning text-white rounded-pill px-3 py-2 me-2 mb-2"># ${t.trim()}</span>`).join('');
    
    if (container) container.innerHTML = sidebarHtml;
    if (display) display.innerHTML = mainHtml;
}

/* ===================================
   5. 수정 기능 (POST 요청들)
=================================== */

// 카카오 주소 API (이건 GET 성격이라 CSRF 필요없음)
function execPostCode() {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById('postcode').value = data.zonecode;
            document.getElementById('address-base').value = data.address;
            document.getElementById('address-detail').focus();
        }
    }).open();
}

// 닉네임 저장
document.getElementById('btn-nick-save')?.addEventListener('click', async () => {
    const val = document.getElementById('new-nickname').value;
    if(!val.trim()) return alert("닉네임을 입력하세요.");
    
    const fd = new FormData(); 
    fd.append("userNick", val);
    
    const res = await secureFetch('/mypage/updateNick.do', fd);
    if(await res.json() > 0) location.reload();
});

// 비밀번호 저장 (컨트롤러에 해당 메서드가 있어야 함)
document.getElementById('btn-pw-save')?.addEventListener('click', async () => {
    const cur = document.getElementById('current-pw').value;
    const nPw = document.getElementById('new-pw').value;
    const cfm = document.getElementById('confirm-pw').value;
    
    if(nPw !== cfm) return alert("새 비밀번호가 일치하지 않습니다.");
    
    const fd = new FormData();
    fd.append("userEnpswd", cur);
    fd.append("newPw", nPw);
    
    const res = await secureFetch('/mypage/updatePw.do', fd);
    if(await res.json() > 0) { 
        alert("비밀번호가 변경되었습니다."); 
        location.reload(); 
    } else {
        alert("현재 비밀번호가 올바르지 않습니다.");
    }
});

// 주소 저장
document.getElementById('btn-addr-save')?.addEventListener('click', async () => {
    const fd = new FormData();
    fd.append("userZip", document.getElementById('postcode').value);
    fd.append("userAddr", document.getElementById('address-base').value);
    fd.append("userDaddr", document.getElementById('address-detail').value);
    
    const res = await secureFetch('/mypage/updateAddr.do', fd);
    if(await res.json() > 0) location.reload();
});

// 태그 편집기 및 저장
function openTagEditor() {
    const container = document.getElementById('tag-editor-container');
    container.classList.toggle('d-none');
    document.getElementById('theme-list-wrapper').innerHTML = THEMES.map(t => `
        <button type="button" class="btn btn-outline-secondary btn-sm m-1 tag-select-btn" 
                data-label="${t.label}" onclick="toggleTagSelection(this)">
            ${t.icon} ${t.label}
        </button>
    `).join('');
}

function toggleTagSelection(btn) {
    btn.classList.toggle('btn-warning');
    btn.classList.toggle('text-white');
    btn.classList.toggle('btn-outline-secondary');
}

async function saveTags() {
    const selected = Array.from(document.querySelectorAll('.tag-select-btn.btn-warning')).map(btn => btn.dataset.label);
    const fd = new FormData(); 
    fd.append("userTag", selected.join(','));
    
    const res = await secureFetch('/mypage/updateTag.do', fd);
    if(await res.json() > 0) location.reload();
}

/* ===================================
   6. 찜 목록 및 페이지네이션
=================================== */
async function loadWishList() {
    try {
        const res = await fetch('/mypage/getRelationList.do');
        wishListData = await res.json();
        renderWishPage(1);
        document.getElementById('sidebar-wish-count').innerText = wishListData.length;
        document.getElementById('wish-count-badge').innerText = wishListData.length;
    } catch (e) { console.error("찜 목록 로드 실패", e); }
}

function renderWishPage(page) {
    currentWishPage = page;
    const start = (page - 1) * pageSize;
    const pagedList = wishListData.slice(start, start + pageSize);
    const row = document.getElementById('wish-items-row');
    
    if(pagedList.length === 0) {
        row.innerHTML = '<div class="col-12 text-center py-5 text-muted">찜한 여행지가 없습니다.</div>';
    } else {
        row.innerHTML = pagedList.map(item => `
            <div class="col-md-4 mb-3">
                <div class="card h-100 border-0 shadow-sm overflow-hidden" style="border-radius:15px;">
                    <div style="position:relative;">
                        <img src="${item.tripImgAddr || '/images/common/no-image.png'}" class="card-img-top" style="height:150px; object-fit:cover;">
                        <button onclick="deleteWishItem('${item.tripContsId}')" style="position:absolute; top:10px; right:10px; border:none; background:white; border-radius:50%; width:28px; height:28px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                            <i data-lucide="x" size="14" style="color:red;"></i>
                        </button>
                    </div>
                    <div class="card-body p-2 text-center">
                        <h6 class="fw-bold text-truncate small mb-0">${item.tripTitle}</h6>
                    </div>
                </div>
            </div>
        `).join('');
    }
    renderPagination();
    lucide.createIcons();
}

function renderPagination() {
    const totalPages = Math.ceil(wishListData.length / pageSize);
    const container = document.getElementById('wish-pagination');
    if(totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<button class="btn btn-sm btn-light me-1" onclick="renderWishPage(${Math.max(1, currentWishPage-1)})"> < </button>`;
    for(let i=1; i<=totalPages; i++) {
        html += `<button class="btn btn-sm ${i === currentWishPage ? 'btn-warning text-white' : 'btn-light'} me-1" onclick="renderWishPage(${i})">${i}</button>`;
    }
    html += `<button class="btn btn-sm btn-light" onclick="renderWishPage(${Math.min(totalPages, currentWishPage+1)})"> > </button>`;
    container.innerHTML = html;
}

async function deleteWishItem(id) {
    if(!confirm("찜 목록에서 삭제하시겠습니까?")) return;
    const fd = new FormData(); 
    fd.append("tripContsId", id);
    
    const res = await secureFetch('/mypage/deleteWish.do', fd);
    if(await res.json() > 0) loadWishList();
}