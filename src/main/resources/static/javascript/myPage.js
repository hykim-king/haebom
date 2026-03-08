/**
 * ===================================
 * 해봄트립 마이페이지 JavaScript (페이징 & 선택 삭제)
 * ===================================
 */

/* 전역 변수 */
let allWishList = [];       // 서버에서 받아온 전체 찜 데이터
let currentPage = 1;        // 현재 페이지
const pageSize = 6;         // 페이지당 출력 개수 (6개)
let selectedWishIds = new Set(); // 선택된 찜 ID 저장

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadUserInfo();
    fetchWishList(); // 초기 데이터 로드
});

/* ===================================
   1. 데이터 로드 및 페이징 처리
=================================== */

// 서버에서 전체 찜 목록 가져오기
function fetchWishList() {
    fetch('/mypage/getRelationList.do')
        .then(res => res.json())
        .then(list => {
            allWishList = list;
            renderWishPage(1); // 1페이지 출력
            updateWishCount(list.length);
        })
        .catch(err => console.error("찜 목록 로드 실패:", err));
}

// 특정 페이지의 데이터 렌더링
function renderWishPage(page) {
    currentPage = page;
    const container = document.getElementById('wish-items-row');
    if (!container) return;

    // 데이터가 없을 때
    if (allWishList.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted">찜한 여행지가 없습니다.</div>`;
        renderPagination(0);
        return;
    }

    // 페이징 계산 (6개씩 자르기)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageItems = allWishList.slice(startIndex, endIndex);

    // HTML 생성
    container.innerHTML = pageItems.map(item => {
        const isSelected = selectedWishIds.has(String(item.tripContsId));
        return `
        <div class="col-md-4 mb-4 wish-item-card" data-wish-id="${item.tripContsId}">
            <div class="card h-100 shadow-sm wish-card ${selectMode ? 'select-mode' : ''} ${isSelected ? 'selected' : ''}">
                <div class="selection-overlay"></div> <img src="${item.itemImage || '/images/common/no-image.png'}" class="card-img-top" alt="여행지">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${item.itemTitle}</h5>
                    <p class="card-text small text-muted"><i data-lucide="map-pin" size="12"></i> ${item.itemAddr || '주소 정보 없음'}</p>
                </div>
            </div>
        </div>
    `}).join('');
    
    renderPagination(allWishList.length);
    lucide.createIcons();
}

// 페이징 버튼 생성
function renderPagination(totalCount) {
    const nav = document.getElementById('wish-pagination-nav');
    if (!nav) return;

    const totalPages = Math.ceil(totalCount / pageSize);
    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="renderWishPage(${i})">${i}</a>
            </li>
        `;
    }
    nav.innerHTML = html;
}

/* ===================================
   2. 선택 모드 및 일괄 삭제 기능
=================================== */

// 선택 모드 토글 (이미지의 '선택 삭제', '취소' 버튼 연동)
function toggleSelectMode() {
    selectMode = !selectMode;
    const btnGroup = document.getElementById('select-mode-btns'); // 버튼 감싸는 컨테이너
    const cards = document.querySelectorAll('.wish-card');

    if (selectMode) {
        document.getElementById('btn-toggle-select').classList.add('d-none');
        document.getElementById('select-actions').classList.remove('d-none');
        cards.forEach(c => c.classList.add('select-mode'));
    } else {
        selectedWishIds.clear();
        document.getElementById('btn-toggle-select').classList.remove('d-none');
        document.getElementById('select-actions').classList.add('d-none');
        renderWishPage(currentPage); // 화면 초기화
    }
}

// 카드 클릭 시 선택 처리
document.getElementById('wish-items-row')?.addEventListener('click', function(e) {
    if (!selectMode) return;
    
    const card = e.target.closest('.wish-card');
    if (!card) return;

    const wishId = String(card.closest('.wish-item-card').dataset.wishId);

    if (selectedWishIds.has(wishId)) {
        selectedWishIds.delete(wishId);
        card.classList.remove('selected');
    } else {
        selectedWishIds.add(wishId);
        card.classList.add('selected');
    }
});

// 선택된 항목 서버에 삭제 요청
function deleteSelectedItems() {
    if (selectedWishIds.size === 0) return alert("삭제할 항목을 선택해주세요.");

    if (confirm(`선택한 ${selectedWishIds.size}개의 항목을 삭제하시겠습니까?`)) {
        // 실제로는 반복문으로 삭제 API를 호출하거나, 서버에 리스트로 보냅니다.
        const promises = Array.from(selectedWishIds).map(id => 
            fetch(`/trip/toggleFavorite.do?tripContsId=${id}`)
        );

        Promise.all(promises).then(() => {
            alert("삭제되었습니다.");
            selectedWishIds.clear();
            toggleSelectMode(); // 모드 해제
            fetchWishList();    // 데이터 갱신
        });
    }
}

/* ===================================
   3. 기타 유틸리티 (카운트 등)
=================================== */
function updateWishCount(count) {
    const el1 = document.getElementById('wish-count-display');
    const el2 = document.getElementById('sidebar-wish-count');
    if (el1) el1.innerText = count;
    if (el2) el2.innerText = count;
}