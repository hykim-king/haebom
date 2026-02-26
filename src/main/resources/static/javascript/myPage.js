/**
 * ===================================
 * 해봄트립 마이페이지 JavaScript
 * ===================================
 * 작성자: 해봄트립 개발팀
 * 설명: 마이페이지의 모든 동적 기능 제어
 * - 좌측 메뉴 전환 (내 정보, 찜 목록, 여행완료)
 * - 찜 목록 관리 (추가/삭제/선택 삭제)
 * - 여행완료 관리 (추가/삭제/선택 삭제)
 * - 개인정보 수정 (닉네임, 비밀번호, 주소)
 * - 해시태그 선택 및 저장
 * ===================================
 */

/* ===================================
   전역 변수
=================================== */
let selectMode = false;              // 찜 목록 선택 모드 활성화 여부
let selectedItems = new Set();       // 찜 목록 선택된 아이템 ID 저장

let completedSelectMode = false;     // 여행완료 선택 모드 활성화 여부
let selectedCompletedItems = new Set(); // 여행완료 선택된 아이템 ID 저장

/* ===================================
   찜 목록 - 개별 아이템 삭제 함수
   (HTML에서 onclick으로 호출)
=================================== */
function removeWishItem(buttonElement, itemName) {
    // 삭제 확인 메시지
    if (confirm(`'${itemName}'을(를) 찜 목록에서 삭제하시겠습니까?`)) {
        // 버튼의 부모 카드 요소 찾기
        const card = buttonElement.closest('.wish-item-card');
        
        if (card) {
            // 부드러운 삭제 애니메이션 적용
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            card.style.transition = '0.3s';
            
            // 300ms 후 DOM에서 완전히 제거
            setTimeout(() => {
                card.remove();
                checkEmptyWishList(); // 목록이 비었는지 확인
            }, 300);
        }
    }
}

/* ===================================
   여행완료 - 개별 아이템 삭제 함수
   (HTML에서 onclick으로 호출)
=================================== */
function removeCompletedItem(buttonElement, itemName) {
    // 삭제 확인 메시지
    if (confirm(`'${itemName}'을(를) 여행완료에서 삭제하시겠습니까?`)) {
        // 버튼의 부모 카드 요소 찾기
        const card = buttonElement.closest('.completed-item-card');
        
        if (card) {
            // 부드러운 삭제 애니메이션 적용
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            card.style.transition = '0.3s';
            
            // 300ms 후 DOM에서 완전히 제거
            setTimeout(() => {
                card.remove();
                checkEmptyCompletedList(); // 목록이 비었는지 확인
            }, 300);
        }
    }
}

/* ===================================
   찜 목록 - 빈 목록 체크 및 카운트 업데이트
   목록이 비어있으면 안내 메시지 표시
=================================== */
function checkEmptyWishList() {
    const row = document.getElementById('wish-items-row');
    const countDisplay = document.getElementById('wish-count-display');
    const sidebarCount = document.getElementById('sidebar-wish-count');
    
    if (!row) return;

    // 현재 남아있는 카드 개수 계산
    const itemCount = row.querySelectorAll('.wish-item-card').length;
    
    // 카운트 표시 업데이트
    if (countDisplay) countDisplay.innerText = itemCount;
    if (sidebarCount) sidebarCount.innerText = itemCount;

    // 아이템이 하나도 없으면 안내 메시지 표시
    if (itemCount === 0) {
        row.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i data-lucide="heart-off" size="64" class="text-muted mb-3"></i>
                    <p class="text-muted">찜한 여행지가 없습니다.</p>
                </div>
            </div>
        `;
    }
    
    // 아이콘이 깨지지 않도록 다시 생성 (Lucide 아이콘)
    lucide.createIcons();
}

/* ===================================
   여행완료 - 빈 목록 체크 및 카운트 업데이트
   목록이 비어있으면 안내 메시지 표시
=================================== */
function checkEmptyCompletedList() {
    const row = document.getElementById('completed-items-row');
    const countDisplay = document.getElementById('completed-count-display');
    const sidebarCount = document.getElementById('sidebar-completed-count');
    
    if (!row) return;

    // 현재 남아있는 카드 개수 계산
    const itemCount = row.querySelectorAll('.completed-item-card').length;
    
    // 카운트 표시 업데이트
    if (countDisplay) countDisplay.innerText = itemCount;
    if (sidebarCount) sidebarCount.innerText = itemCount;

    // 아이템이 하나도 없으면 안내 메시지 표시
    if (itemCount === 0) {
        row.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i data-lucide="map-pin-off" size="64" class="text-muted mb-3"></i>
                    <p class="text-muted">아직 완료된 여행이 없습니다.</p>
                    <p class="text-muted small">다녀온 여행지를 체크해보세요!</p>
                </div>
            </div>
        `;
        
        // 페이지네이션 숨김
        const pagination = document.getElementById('completed-pagination-nav');
        if (pagination) pagination.classList.add('d-none');
    }
    
    // 아이콘 재생성
    lucide.createIcons();
}

/* ===================================
   주소 검색 - 카카오 우편번호 API 호출
   다음 우편번호 서비스 팝업 띄우기
=================================== */
function execPostCode() {
    new daum.Postcode({
        oncomplete: function (data) {
            // 우편번호와 기본 주소를 각 input에 자동 입력
            document.getElementById('postcode').value = data.zonecode;
            document.getElementById('address-base').value = data.address;
            // 상세 주소 입력란으로 포커스 이동
            document.getElementById('address-detail').focus();
        }
    }).open();
}

/* ===================================
   DOM 로드 완료 후 실행되는 메인 함수
   페이지의 모든 이벤트 리스너 등록
=================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Lucide 아이콘 초기화
    lucide.createIcons();

    /* ===================================
       초기 카운트 업데이트 (페이지 로드 시)
       찜 목록과 여행완료의 실제 개수를 계산하여 표시
    =================================== */
    function updateInitialCounts() {
        // 찜 목록 개수 업데이트
        const wishCount = document.querySelectorAll('.wish-item-card').length;
        const wishCountDisplay = document.getElementById('wish-count-display');
        const sidebarWishCount = document.getElementById('sidebar-wish-count');
        if (wishCountDisplay) wishCountDisplay.innerText = wishCount;
        if (sidebarWishCount) sidebarWishCount.innerText = wishCount;

        // 여행완료 개수 업데이트
        const completedCount = document.querySelectorAll('.completed-item-card').length;
        const completedCountDisplay = document.getElementById('completed-count-display');
        const sidebarCompletedCount = document.getElementById('sidebar-completed-count');
        if (completedCountDisplay) completedCountDisplay.innerText = completedCount;
        if (sidebarCompletedCount) sidebarCompletedCount.innerText = completedCount;

        console.log(`✅ 초기 카운트 업데이트: 찜 ${wishCount}개, 여행완료 ${completedCount}개`);
    }

    // 초기 카운트 업데이트 실행
    updateInitialCounts();

    /* ===================================
       좌측 메뉴 클릭 이벤트 (메뉴 전환)
       - 내 정보, 찜 목록, 여행완료 간 전환
    =================================== */
    const menuItems = document.querySelectorAll('.menu-item');
    const contentPanes = document.querySelectorAll('.content-pane');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 현재 활성화된 메뉴 확인
            const targetMenu = this.dataset.menu;
            
            // 모든 메뉴 비활성화
            menuItems.forEach(mi => mi.classList.remove('active'));
            // 클릭한 메뉴 활성화
            this.classList.add('active');

            // 모든 콘텐츠 숨김
            contentPanes.forEach(pane => pane.classList.remove('active'));
            // 해당 콘텐츠 표시
            const targetPane = document.getElementById(`content-${targetMenu}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            // 아이콘 재생성 (새로 표시된 콘텐츠의 아이콘)
            lucide.createIcons();
        });
    });

    /* ===================================
       찜 목록 - 선택 모드 토글 버튼
       선택 모드 On/Off 전환
    =================================== */
    document.getElementById('btn-toggle-select')?.addEventListener('click', function() {
        selectMode = !selectMode;               // 모드 전환
        selectedItems.clear();                  // 선택 항목 초기화
        
        const cards = document.querySelectorAll('.wish-card');
        const deleteBtn = document.getElementById('btn-delete-selected');
        
        if (selectMode) {
            // 선택 모드 활성화
            this.innerHTML = '<i data-lucide="x" size="14"></i> 취소';
            this.classList.remove('btn-outline-orange');
            this.classList.add('btn-secondary');
            deleteBtn.classList.remove('d-none');           // 삭제 버튼 표시
            cards.forEach(card => card.classList.add('select-mode'));
        } else {
            // 선택 모드 비활성화
            this.innerHTML = '<i data-lucide="check-square" size="14"></i> 선택 모드';
            this.classList.remove('btn-secondary');
            this.classList.add('btn-outline-orange');
            deleteBtn.classList.add('d-none');              // 삭제 버튼 숨김
            cards.forEach(card => {
                card.classList.remove('select-mode', 'selected');
            });
        }
        
        // 아이콘 재생성
        lucide.createIcons();
    });

    /* ===================================
       찜 목록 - 카드 클릭 시 선택/해제
       선택 모드가 활성화된 경우에만 작동
    =================================== */
    document.getElementById('wish-items-row')?.addEventListener('click', function(e) {
        if (!selectMode) return;        // 선택 모드가 아니면 무시
        
        const card = e.target.closest('.wish-card');
        if (!card) return;
        
        // 카드의 고유 ID 가져오기
        const cardId = card.closest('.wish-item-card').dataset.wishId;
        
        // 이미 선택된 경우 -> 선택 해제
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            selectedItems.delete(cardId);
        } 
        // 선택되지 않은 경우 -> 선택
        else {
            card.classList.add('selected');
            selectedItems.add(cardId);
        }
    });

    /* ===================================
       찜 목록 - 선택 항목 일괄 삭제
       선택된 모든 카드를 한번에 삭제
    =================================== */
    document.getElementById('btn-delete-selected')?.addEventListener('click', function() {
        // 선택된 항목이 없으면 경고
        if (selectedItems.size === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }
        
        // 삭제 확인
        if (confirm(`선택한 ${selectedItems.size}개의 항목을 삭제하시겠습니까?`)) {
            // 선택된 모든 카드 삭제
            selectedItems.forEach(id => {
                const card = document.querySelector(`.wish-item-card[data-wish-id="${id}"]`);
                if (card) {
                    // 부드러운 삭제 애니메이션
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    card.style.transition = '0.3s';
                    
                    setTimeout(() => {
                        card.remove();
                        checkEmptyWishList();
                    }, 300);
                }
            });
            
            // 삭제 후 초기화
            selectedItems.clear();
            selectMode = false;
            document.getElementById('btn-toggle-select').click();
        }
    });

    /* ===================================
       여행완료 - 선택 모드 토글 버튼
       선택 모드 On/Off 전환
    =================================== */
    document.getElementById('btn-toggle-completed-select')?.addEventListener('click', function() {
        completedSelectMode = !completedSelectMode;     // 모드 전환
        selectedCompletedItems.clear();                 // 선택 항목 초기화
        
        const cards = document.querySelectorAll('.completed-card');
        const deleteBtn = document.getElementById('btn-delete-completed-selected');
        
        if (completedSelectMode) {
            // 선택 모드 활성화
            this.innerHTML = '<i data-lucide="x" size="14"></i> 취소';
            this.classList.remove('btn-outline-success');
            this.classList.add('btn-secondary');
            deleteBtn.classList.remove('d-none');       // 삭제 버튼 표시
            cards.forEach(card => card.classList.add('select-mode'));
        } else {
            // 선택 모드 비활성화
            this.innerHTML = '<i data-lucide="check-square" size="14"></i> 선택 모드';
            this.classList.remove('btn-secondary');
            this.classList.add('btn-outline-success');
            deleteBtn.classList.add('d-none');          // 삭제 버튼 숨김
            cards.forEach(card => {
                card.classList.remove('select-mode', 'selected');
            });
        }
        
        // 아이콘 재생성
        lucide.createIcons();
    });

    /* ===================================
       여행완료 - 카드 클릭 시 선택/해제
       선택 모드가 활성화된 경우에만 작동
    =================================== */
    document.getElementById('completed-items-row')?.addEventListener('click', function(e) {
        if (!completedSelectMode) return;   // 선택 모드가 아니면 무시
        
        const card = e.target.closest('.completed-card');
        if (!card) return;
        
        // 카드의 고유 ID 가져오기
        const cardId = card.closest('.completed-item-card').dataset.completedId;
        
        // 이미 선택된 경우 -> 선택 해제
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            selectedCompletedItems.delete(cardId);
        } 
        // 선택되지 않은 경우 -> 선택
        else {
            card.classList.add('selected');
            selectedCompletedItems.add(cardId);
        }
    });

    /* ===================================
       여행완료 - 선택 항목 일괄 삭제
       선택된 모든 카드를 한번에 삭제
    =================================== */
    document.getElementById('btn-delete-completed-selected')?.addEventListener('click', function() {
        // 선택된 항목이 없으면 경고
        if (selectedCompletedItems.size === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }
        
        // 삭제 확인
        if (confirm(`선택한 ${selectedCompletedItems.size}개의 항목을 삭제하시겠습니까?`)) {
            // 선택된 모든 카드 삭제
            selectedCompletedItems.forEach(id => {
                const card = document.querySelector(`.completed-item-card[data-completed-id="${id}"]`);
                if (card) {
                    // 부드러운 삭제 애니메이션
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    card.style.transition = '0.3s';
                    
                    setTimeout(() => {
                        card.remove();
                        checkEmptyCompletedList();
                    }, 300);
                }
            });
            
            // 삭제 후 초기화
            selectedCompletedItems.clear();
            completedSelectMode = false;
            document.getElementById('btn-toggle-completed-select').click();
        }
    });

    /* ===================================
       내 정보 - 닉네임 변경 토글
       변경하기 버튼 클릭 시 입력창 표시/숨김
    =================================== */
    const nickEditBtn = document.getElementById('btn-nick-edit-toggle');
    const nickFields = document.getElementById('nick-edit-fields');

    if (nickEditBtn) {
        nickEditBtn.addEventListener('click', () => {
            const isHidden = nickFields.classList.toggle('d-none');
            nickEditBtn.textContent = isHidden ? '변경하기' : '취소';
        });
    }

    /* ===================================
       내 정보 - 닉네임 저장 버튼
       새로운 닉네임을 저장하고 화면에 반영
    =================================== */
    document.getElementById('btn-nick-save')?.addEventListener('click', () => {
        const val = document.getElementById('new-nickname').value;
        
        // 빈 값 체크
        if (!val.trim()) return alert("닉네임을 입력하세요.");
        
        // 화면에 반영
        document.getElementById('display-nickname').textContent = val;
        document.getElementById('sidebar-nickname').textContent = val;
        
        alert("변경되었습니다.");
        
        // 입력창 닫기
        nickFields.classList.add('d-none');
        nickEditBtn.textContent = '변경하기';
    });

    /* ===================================
       내 정보 - 비밀번호 변경 토글
       변경하기 버튼 클릭 시 입력창 표시/숨김
    =================================== */
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

    /* ===================================
       내 정보 - 비밀번호 일치 여부 실시간 체크
       두 입력창의 비밀번호가 일치하는지 확인
    =================================== */
    function validatePw() {
        if (!confirmPw || !newPw) return;
        if (!confirmPw.value) { 
            feedback.textContent = ""; 
            return; 
        }
        
        // 일치 여부에 따라 피드백 표시
        if (newPw.value === confirmPw.value) {
            feedback.textContent = "일치함"; 
            feedback.style.color = "#22c55e";   // 초록색
        } else {
            feedback.textContent = "불일치"; 
            feedback.style.color = "#ef4444";   // 빨간색
        }
    }

    // 입력할 때마다 실시간 체크
    newPw?.addEventListener('input', validatePw);
    confirmPw?.addEventListener('input', validatePw);

    /* ===================================
       내 정보 - 비밀번호 저장 버튼
       비밀번호 일치 확인 후 저장
    =================================== */
    document.getElementById('btn-pw-save')?.addEventListener('click', () => {
        if (newPw.value && newPw.value === confirmPw.value) {
            alert("성공적으로 변경되었습니다.");
            // 입력창 닫기
            pwFields.classList.add('d-none');
            pwEditBtn.textContent = '변경하기';
            // 입력값 초기화
            newPw.value = '';
            confirmPw.value = '';
            feedback.textContent = '';
        } else {
            alert("비밀번호를 확인해 주세요.");
        }
    });

    /* ===================================
       내 정보 - 주소지 변경 토글
       수정하기 버튼 클릭 시 입력창 표시/숨김
    =================================== */
    const addrEditBtn = document.getElementById('btn-addr-edit-toggle');
    const addrFields = document.getElementById('addr-edit-fields');
    const addrText = document.getElementById('current-addr-text');

    if (addrEditBtn) {
        addrEditBtn.addEventListener('click', () => {
            const isHidden = addrFields.classList.toggle('d-none');
            addrEditBtn.textContent = isHidden ? '수정하기' : '취소';
        });
    }

    /* ===================================
       내 정보 - 주소 저장 버튼
       우편번호, 기본주소, 상세주소를 저장
    =================================== */
    document.getElementById('btn-addr-save')?.addEventListener('click', () => {
        const post = document.getElementById('postcode').value;
        const base = document.getElementById('address-base').value;
        const detail = document.getElementById('address-detail').value;
        
        // 필수값 체크
        if (!post || !base) return alert("주소를 검색해 주세요.");
        
        // 화면에 저장된 주소 표시
        addrText.textContent = `(${post}) ${base} ${detail}`;
        addrText.className = "small fw-bold text-primary mb-0";
        
        alert("주소가 저장되었습니다.");
        
        // 입력창 닫기
        addrFields.classList.add('d-none');
        addrEditBtn.textContent = '수정하기';
    });

    /* ===================================
       해시태그 시스템 - 카테고리별 태그 데이터
       각 카테고리에 아이콘과 태그 리스트 포함
    =================================== */

    const hashtagData = {
            "테마": {
                icon: "📜",
                tags: ["산⛰️", "폭포🌊", "계곡💦", "바다🏖️", "호수🚣", "강🏞️", "동굴🦇",
                       "역사관광지🏯", "사찰🙏", "온천/스파♨️", "테마공원🎡", "기념/전망🗼",
                       "문화시설🏛️", "레포츠🚲"]
            }
        };

    /* ===================================
       해시태그 선택 UI 동적 생성
       모달 내부에 카테고리별 태그 버튼 생성
    =================================== */
    const groupContainer = document.getElementById('hashtag-selection-groups');
    if (groupContainer) {
        let fullHtml = "";
        
        // 각 카테고리별로 HTML 생성
        for (const [category, data] of Object.entries(hashtagData)) {
            // 카테고리 제목 (아이콘 포함)
            fullHtml += `<div class="category-title fw-bold mt-3 mb-2">${data.icon} ${category}</div>`;
            fullHtml += `<div class="d-flex flex-wrap gap-2">`;
            
            // 각 태그를 체크박스 + 라벨로 생성
            data.tags.forEach(tag => {
                fullHtml += `
                    <input type="checkbox" id="tag-${tag}" class="tag-checkbox d-none" value="${tag}">
                    <label for="tag-${tag}" class="btn btn-sm btn-outline-secondary rounded-pill px-3 tag-label-btn">${tag}</label>
                `;
            });
            
            fullHtml += `</div>`;
        }
        
        groupContainer.innerHTML = fullHtml;

        /* ===================================
           해시태그 - 체크박스 선택 시 스타일 변경
           라벨 클릭 시 선택/해제 상태에 따라 색상 변경
        =================================== */
        groupContainer.querySelectorAll('.tag-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = document.querySelector(`label[for="${this.id}"]`);
                if (this.checked) {
                    // 선택 상태 - 파란색으로 변경
                    label.classList.replace('btn-outline-secondary', 'btn-primary');
                    label.classList.add('text-white');
                } else {
                    // 선택 해제 - 회색으로 변경
                    label.classList.replace('btn-primary', 'btn-outline-secondary');
                    label.classList.remove('text-white');
                }
            });
        });
    }

    /* ===================================
       해시태그 - 저장 버튼
       선택된 태그들을 화면에 표시
    =================================== */
    document.getElementById('btn-save-hashtags')?.addEventListener('click', function () {
        // 체크된 태그들만 배열로 가져오기
        const checkedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
                                 .map(cb => cb.value);
        
        // 최소 1개 이상 선택 확인
        if (checkedTags.length === 0) {
            return alert("최소 하나 이상의 키워드를 선택해주세요.");
        }

        // 배지 형태로 HTML 생성
        const badges = checkedTags.map(tag => 
            `<span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">${tag}</span>`
        ).join('');
        
        // 좌측 사이드바와 메인 영역에 모두 표시
        document.getElementById('hashtag-container').innerHTML = badges;
        document.getElementById('selected-hashtags-display').innerHTML = badges;

        // 모달 닫기
        const modalElement = document.getElementById('hashtagModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        alert("성공적으로 저장되었습니다.");
    });

}); // DOMContentLoaded 종료