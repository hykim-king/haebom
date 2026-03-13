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
const topBtn = document.getElementById('topBtn');
const chatbotBtn = document.getElementById('chatbotBtn');

// --- Global States ---
let localSeedCounter = 0;
let isInfiniteScrollActive = false;
let isDataLoading = false;

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
        const targetId = `age-${window.userAgeGroup.replace('대', '')}`;
        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.add('active');
    }
}

/**
 * [AI 핵심] 데이터 로딩 함수
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

    $.ajax({
        type: "POST",
        url: endpoint,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
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
                    <img src="${img}" alt="${name}" onerror="this.src='../img/no_image.png'">
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
        }
    }, 500);
}

// --- Lifecycle & Events ---

window.onload = () => {
    // 1. 메인 추천 초기 렌더링
    renderCards(mainGrid, safeTravelData.slice(0, 3));

    // 2. 연령대별 초기 렌더링 및 AI 로딩
    if (window.userAgeGroup && window.userAgeGroup !== 'all') {
        activateUserAgeTab();
        loadAiData("/ai_trip/recommend_age", { "ageGroup": window.userAgeGroup }, ageGrid, true);
    } else {
        renderCards(ageGrid, safeAgeData.slice(0, 4), true);
    }

    // 3. 지역별 초기 렌더링
    renderCards(localGrid, safeLocalData.slice(0, 8), true);
    localSeedCounter = 8;
};

// 전역 클릭 이벤트 (탭, 찜하기, 카드 상세)
document.addEventListener('click', (e) => {
    // A. 연령대 탭 클릭
    const tab = e.target.closest('.age-list li');
    if (tab) {
        document.querySelectorAll('.age-list li').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        let ageValue = tab.id.replace('age-', '');
        if (ageValue === 'all') ageValue = "20대";
        else if (!ageValue.includes('대')) ageValue += "대";
        loadAiData("/ai_trip/recommend_age", { "ageGroup": ageValue }, ageGrid, true);
        return;
    }

    // B. 찜하기 버튼 클릭
    const btnWish = e.target.closest(".btn-wish");
    if (btnWish) {
        e.stopPropagation();
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
                if (csrfToken && csrfHeader) xhr.setRequestHeader(csrfHeader, csrfToken);
            },
            success: function (resText) {
                const res = typeof resText === 'string' ? JSON.parse(resText) : resText;
                if (res.status === "success") {
                    if (res.msg === "already_added") {
                        alert("이미 찜 목록에 있는 여행지입니다.");
                        icon.classList.replace("fa-regular", "fa-solid");
                        btnWish.classList.add("active");
                    } else if (isActivating) {
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

    // C. 카드 본체 클릭 (상세 이동)
    const card = e.target.closest(".travel-card");
    if (card) {
        const tripId = card.dataset.id;
        if (tripId) location.href = "/thema/trip_view?tripContsId=" + tripId;
    }
});

// 메인 새로고침
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transition = 'transform 0.5s';
        icon.style.transform = 'rotate(360deg)';
        loadAiData("/ai_trip/recommend", { "user_input": "추천 여행지", "user_tag": "일반" }, mainGrid, false);
        setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 500);
    });
}

// 연령대별 새로고침
if (ageRefreshBtn) {
    ageRefreshBtn.addEventListener('click', () => {
        const icon = ageRefreshBtn.querySelector('i');
        icon.style.transition = 'transform 0.5s';
        icon.style.transform = 'rotate(360deg)';
        const activeTab = document.querySelector('.age-list li.active');
        let ageValue = activeTab ? activeTab.id.replace('age-', '') : "20";
        if (!ageValue.includes('대')) ageValue += "대";
        loadAiData("/ai_trip/recommend_age", { "ageGroup": ageValue }, ageGrid, true);
        setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 500);
    });
}

// 무한 스크롤 및 더보기
if (loadMoreLocalBtn) loadMoreLocalBtn.addEventListener('click', appendLocalCards);

window.addEventListener('scroll', () => {
    // 1. 무한 스크롤
    if (isInfiniteScrollActive && !isDataLoading) {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
            appendLocalCards();
        }
    }

    // 2. Top 버튼 표시
    if (topBtn) {
        if (window.scrollY > 300) topBtn.classList.add('show');
        else topBtn.classList.remove('show');
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