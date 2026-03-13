/* ai_trip.js - FastAPI 실시간 연동 및 UI 렌더링 통합 스크립트 */

const csrfToken = $("meta[name='_csrf']").attr("content");
const csrfHeader = $("meta[name='_csrf_header']").attr("content");

// --- Selectors ---
const mainGrid = document.getElementById('travelGrid');
const ageGrid = document.getElementById('ageTravelGrid');
const localGrid = document.getElementById('localTravelGrid');
const refreshBtn = document.getElementById('refreshBtn');
const ageRefreshBtn = document.getElementById('ageRefreshBtn');
const loadMoreLocalBtn = document.getElementById('loadMoreLocalBtn');

// --- Global States ---
<<<<<<< HEAD
let localSeedCounter = 0;
let isInfiniteScrollActive = false;

// 전역 데이터 가드
const safeTravelData = window.travelData || [];
const safeAgeData = window.ageData || [];
const safeLocalData = window.localData || [];

// --- Functions ---

function formatAddress(fullAddr) {
    if (!fullAddr) return '지역 정보';
    const parts = fullAddr.split(' ');
    if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
    return parts[0];
}

function activateUserAgeTab() {
    if (!window.userAgeGroup) return;
    const ageTabs = document.querySelectorAll('.age-list li');
    if (ageTabs.length > 0) {
        ageTabs.forEach(tab => tab.classList.remove('active'));
        const targetTab = document.getElementById(`age-${window.userAgeGroup}`);
        if (targetTab) targetTab.classList.add('active');
    }
}

/**
 * [AI 핵심] FastAPI 엔드포인트와 통신하도록 수정됨
 * ⭐ 변경사항: GET -> POST, Content-Type 설정, JSON.stringify 사용
 */
function loadAiData(endpoint, params, container, isSmall = false) {
    if (isDataLoading) return;
    isDataLoading = true;

    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #007bff;"></i>
                <p class="mt-2">AI가 최적의 여행지를 분석 중입니다...</p>
            </div>`;
    }

    // Java Controller를 거쳐 FastAPI로 가거나, 직접 FastAPI로 갈 때 공통 적용되는 규격
    $.ajax({
        type: "POST", // FastAPI post 엔드포인트 대응
        url: endpoint,
        contentType: "application/json; charset=utf-8", // JSON 형식 명시
        data: JSON.stringify(params), // 데이터를 JSON 문자열로 변환
        dataType: "json",
        beforeSend: function (xhr) {
            if (csrfToken && csrfHeader) {
                xhr.setRequestHeader(csrfHeader, csrfToken);
            }
        },
        success: function (response) {
            console.log("AI 추천 수신 성공:", response);
            renderCards(container, response, isSmall);
            isDataLoading = false;
        },
        error: function (xhr, status, error) {
            console.error("AI 데이터 로딩 실패:", error);
            renderCards(container, []);
            isDataLoading = false;
        }
    });
}

/**
 * 카드 리스트 렌더링 (동일)
 */
function renderCards(container, data, isSmall = false) {
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><p style="color: #666;"><i class="fa-solid fa-circle-info"></i> 추천된 데이터가 없습니다.</p></div>`;
        return;
    }

    let displayData = data;
    if (container === mainGrid) displayData = data.slice(0, 3);
    else if (container === ageGrid) displayData = data.slice(0, 4);
    else if (container === localGrid) displayData = data.slice(0, 20);

    displayData.forEach(item => {
        container.innerHTML += createCardHTML(item, isSmall);
    });
}

function createCardHTML(item, isSmall = false) {
    const name = item.tripNm || '추천 여행지';
    const img = item.tripPathNm || '';
    const addr = formatAddress(item.tripAddr);
    const id = item.tripContsId || '';
    const colClass = isSmall ? "col-6 col-md-3" : "col-12 col-md-4";
    const isWished = Number(item.isWish) > 0;
    const heartIconClass = isWished ? 'fa-solid' : 'fa-regular';
    const activeClass = isWished ? 'active' : '';

    return `
        <div class="${colClass} mb-4">
            <div class="travel-card shadow-sm" data-id="${id}" style="cursor: pointer;">
                <div class="card-img-wrapper">
                    <img src="${img}" alt="${name}" onerror="this.src=''">
                </div>
                <div class="card-body-custom">
                    <div class="card-title-row">
                        <div class="card-title-custom text-truncate" style="max-width: 80%;">${name}</div>
                        <button class="btn-wish border-0 bg-transparent p-0 ${activeClass}" data-id="${id}">
                            <i class="${heartIconClass} fa-heart" style="color: #ff4d4d;"></i>
                        </button>
                    </div>
                    <div class="card-location-custom">
                        <i class="fa-solid fa-location-dot me-1"></i>${addr}
                    </div>
                </div>
            </div>
        </div>`;
}

function appendLocalCards() {
    if (isDataLoading || !safeLocalData.length) return;
    if (localSeedCounter >= safeLocalData.length) {
        if (loadMoreLocalBtn) loadMoreLocalBtn.style.display = 'none';
        return;
    }

    isDataLoading = true;
    if (loadMoreLocalBtn && !isInfiniteScrollActive) {
        loadMoreLocalBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 로딩 중...';
    }

    setTimeout(() => {
        const nextBatch = safeLocalData.slice(localSeedCounter, localSeedCounter + 4);
        let newCardsHTML = '';
        nextBatch.forEach(item => { newCardsHTML += createCardHTML(item, true); });
        if (localGrid) localGrid.insertAdjacentHTML('beforeend', newCardsHTML);
        localSeedCounter += nextBatch.length;
        isDataLoading = false;
        if (loadMoreLocalBtn && !isInfiniteScrollActive) {
            loadMoreLocalBtn.style.display = 'none';
            isInfiniteScrollActive = true;
=======
let localSeedCounter = 9;       // 초기 8개 이후의 시드 번호
let isInfiniteScrollActive = false; // 무한 스크롤 활성화 여부

<<<<<<< HEAD
// --- Lifecycle & Events ---

window.onload = () => {
    renderCards(mainGrid, safeTravelData.slice(0, 3));

    if (window.userAgeGroup && window.userAgeGroup !== 'all') {
        activateUserAgeTab();
        // FastAPI 파라미터 규격 반영: age_group
        loadAiData("/ai_trip/recommend_age", { "ageGroup": window.userAgeGroup }, ageGrid, true);
    } else {
        renderCards(ageGrid, safeAgeData.slice(0, 4), true);
    }

    renderCards(localGrid, safeLocalData.slice(0, 8), true);
    localSeedCounter = 8;
};

/**
 * 연령대 탭 클릭 이벤트 (AJAX 방식 POST로 전환)
 */
document.addEventListener('click', (e) => {
    const tab = e.target.closest('.age-list li');
    if (tab) {
        const allTabs = document.querySelectorAll('.age-list li');
        allTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        let ageValue = tab.id.replace('age-', '');
        if (ageValue === 'all') ageValue = "20대"; // 기본값 설정

        loadAiData("/ai_trip/recommend_age", { "ageGroup": ageValue }, ageGrid, true);
    }
});

/**
 * 카드 클릭 및 찜하기 이벤트 (기존 POST 방식 유지하되 데이터 구조 점검)
 */
document.addEventListener("click", (e) => {
    const btnWish = e.target.closest(".btn-wish");

    if (btnWish) {
        e.stopPropagation();

        // 로그인 체크 (JSP 변수명 확인 필요)
        if (window.isLoggedIn === false) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        const icon = btnWish.querySelector("i");
        const isActivating = icon.classList.contains("fa-regular");
        const card = btnWish.closest(".travel-card");
        const tripContsId = card ? card.dataset.id : null;

        if (!tripContsId) return;

        $.ajax({
            url: isActivating ? "/ai_trip/wish/add.do" : "/ai_trip/wish/delete.do",
            type: "POST",
            data: { "tripContsId": tripContsId },
            beforeSend: function (xhr) {
                if (csrfToken && csrfHeader) {
                    xhr.setRequestHeader(csrfHeader, csrfToken);
                }
            },
            success: function (resText) {
                const res = typeof resText === 'string' ? JSON.parse(resText) : resText;
                if (res.status === "success") {
                    if (res.msg === "already_added") {
                        alert("이미 찜 목록에 있는 여행지입니다.");
                        icon.classList.replace("fa-regular", "fa-solid");
                        btnWish.classList.add("active");
                        return;
                    }
                    if (isActivating) {
                        icon.classList.replace("fa-regular", "fa-solid");
                        btnWish.classList.add("active");
                    } else {
                        icon.classList.replace("fa-solid", "fa-regular");
                        btnWish.classList.remove("active");
                    }
                } else {
                    alert(res.msg === "login_required" ? "로그인이 필요합니다." : "처리 중 오류 발생");
                }
            }
        });
        return;
    }

    const card = e.target.closest(".travel-card");
    if (card) {
        const tripId = card.dataset.id;
        if (tripId) location.href = "/thema/trip_view?tripContsId=" + tripId;
    }
});

/**
 * 새로고침 버튼들 (POST 방식으로 데이터 요청)
 */
=======
// --- Initial Render ---
window.onload = () => {
    // shuffleAndRender(mainGrid, 3);
    shuffleAndRender(ageGrid, 4, true);
    renderLocalCards();
};

// --- Event Listeners ---

// Section 1 Refresh
>>>>>>> bbbec91a71d3676e1380afba6ee027f90bcedf1b
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
<<<<<<< HEAD

        // 메인 추천 다시 받기 (FastAPI recommend 엔드포인트 연동)
        loadAiData("/ai_trip/recommend", { "user_input": "추천 여행지", "user_tag": "일반" }, mainGrid, false);

        setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 500);
    });
}

=======
        mainGrid.style.opacity = '0';
        setTimeout(() => {
            shuffleAndRender(mainGrid, 3);
            mainGrid.style.opacity = '1';
            icon.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

// Section 2 Refresh
>>>>>>> bbbec91a71d3676e1380afba6ee027f90bcedf1b
if (ageRefreshBtn) {
    ageRefreshBtn.addEventListener('click', () => {
        const icon = ageRefreshBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
<<<<<<< HEAD

        const activeTab = document.querySelector('.age-list li.active');
        let ageValue = activeTab ? activeTab.id.replace('age-', '') : "20";

        loadAiData("/ai_trip/recommend_age", { "ageGroup": ageValue }, ageGrid, true);

        setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 500);
    });
}

if (loadMoreLocalBtn) loadMoreLocalBtn.addEventListener('click', appendLocalCards);

window.addEventListener('scroll', () => {
    if (!isInfiniteScrollActive || isDataLoading) return;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        appendLocalCards();
    }
});
=======
        ageGrid.style.opacity = '0';
        setTimeout(() => {
            shuffleAndRender(ageGrid, 4, true);
            ageGrid.style.opacity = '1';
            icon.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

// Tab and Tag Interaction
document.querySelectorAll('.age-list li').forEach(li => {
    li.addEventListener('click', () => {
        const activeLi = document.querySelector('.age-list li.active');
        if (activeLi) activeLi.classList.remove('active');
        li.classList.add('active');
        shuffleAndRender(ageGrid, 4, true);
    });
});

document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        const activeTab = document.querySelector('.tab-item.active');
        if (activeTab) activeTab.classList.remove('active');
        tab.classList.add('active');
        shuffleAndRender(ageGrid, 4, true);
    });
});

// Wishlist Toggle (Event Delegation)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-wish');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-regular')) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = '#ff4757';
        } else {
            icon.classList.replace('fa-solid', 'fa-regular');
            icon.style.color = '';
        }
    }
});

// [수정] 더보기 버튼 클릭 이벤트
if (loadMoreLocalBtn) {
    loadMoreLocalBtn.addEventListener('click', appendLocalCards);
}

// [추가] 무한 스크롤 이벤트 리스너
window.addEventListener('scroll', () => {
    if (!isInfiniteScrollActive || isDataLoading) return;

    // 바닥에서 300px 여유를 두고 트리거
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        appendLocalCards();
    }
});

// --- Floating Buttons Logic ---
const topBtn = document.getElementById('topBtn');
const chatbotBtn = document.getElementById('chatbotBtn');

window.addEventListener('scroll', () => {
    if (topBtn) {
        if (window.scrollY > 300) {
            topBtn.classList.add('show');
        } else {
            topBtn.classList.remove('show');
        }
    }
});

if (topBtn) {
    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (chatbotBtn) {
    chatbotBtn.addEventListener('click', () => {
        alert('챗봇 상담 서비스가 준비 중입니다!');
    });
}
>>>>>>> bbbec91a71d3676e1380afba6ee027f90bcedf1b
