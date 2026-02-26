// --- Data ---
const travelData = [
    { name: "자라섬", location: "경기 가평군", img: "https://picsum.photos/seed/travel1/800/600" },
    { name: "도산서원 [유네스코 세계유산]", location: "경북 안동시", img: "https://picsum.photos/seed/travel2/800/600" },
    { name: "서울숲", location: "서울 성동구", img: "https://picsum.photos/seed/travel3/800/600" },
    { name: "화이트스톤 갤러리", location: "서울 용산구", img: "https://picsum.photos/seed/travel4/800/600" },
    { name: "설온", location: "강원 양양군", img: "https://picsum.photos/seed/travel5/800/600" },
    { name: "국립중앙박물관", location: "서울 용산구", img: "https://picsum.photos/seed/travel6/800/600" },
    { name: "광한루원", location: "전북 남원시", img: "https://picsum.photos/seed/travel7/800/600" }
];

const localData = [
    { name: "피오리움(Fiorium)", location: "전북 남원시", img: "https://picsum.photos/seed/local1/800/500" },
    { name: "신어산자연숲캠핑장(장척힐링마을)", location: "경남 김해시", img: "https://picsum.photos/seed/local2/800/500" },
    { name: "바실라", location: "경북 경주시", img: "https://picsum.photos/seed/local3/800/500" },
    { name: "별마로천문대", location: "강원 영월군", img: "https://picsum.photos/seed/local4/800/500" },
    { name: "한산마리나요트", location: "경남 통영시", img: "https://picsum.photos/seed/local5/800/500" },
    { name: "퀸스칼렛 카페드라뷰", location: "인천 연수구", img: "https://picsum.photos/seed/local6/800/500" },
    { name: "한국 근현대 미술 '4인의 거장들...'", location: "경북 경주시", img: "https://picsum.photos/seed/local7/800/500" },
    { name: "서울시립 사진미술관", location: "서울 도봉구", img: "https://picsum.photos/seed/local8/800/500" }
];

// --- Selectors ---
const mainGrid = document.getElementById('travelGrid');
const ageGrid = document.getElementById('ageTravelGrid');
const localGrid = document.getElementById('localTravelGrid');
const refreshBtn = document.getElementById('refreshBtn');
const ageRefreshBtn = document.getElementById('ageRefreshBtn');
const loadMoreLocalBtn = document.getElementById('loadMoreLocalBtn');

// --- Global States ---
let localSeedCounter = 9;       // 초기 8개 이후의 시드 번호
let isInfiniteScrollActive = false; // 무한 스크롤 활성화 여부
let isDataLoading = false;      // 데이터 중복 로드 방지 플래그

// --- Functions ---

// Section 1 & 2 렌더링
function renderCards(container, data, isSmall = false) {
    if (!container) return;
    container.innerHTML = '';
    data.forEach(item => {
        const colClass = isSmall ? "col-6 col-md-3" : "col-12 col-md-4";
        const cardClass = isSmall ? "travel-card small-card" : "travel-card";
        container.innerHTML += `
            <div class="${colClass}">
                <div class="${cardClass}">
                    <div class="card-img-wrapper">
                        <img src="${item.img}" alt="${item.name}">
                        <button class="btn-wish"><i class="fa-regular fa-heart"></i></button>
                    </div>
                    <div class="card-body-custom">
                        <div class="card-title-custom">${item.name}</div>
                        <div class="card-location-custom">${item.location}</div>
                    </div>
                </div>
            </div>
        `;
    });
}

// Section 3 렌더링 초기화
function renderLocalCards() {
    if (!localGrid) return;
    localGrid.innerHTML = '';
    localData.forEach(item => {
        localGrid.innerHTML += `
            <div class="col">
                <div class="local-card">
                    <div class="local-card-img">
                        <img src="${item.img}" alt="${item.name}">
                        <button class="btn-wish"><i class="fa-regular fa-heart"></i></button>
                    </div>
                    <div class="local-card-body">
                        <h5 class="local-card-title">${item.name}</h5>
                        <span class="local-card-location">${item.location}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// 데이터 셔플 렌더링
function shuffleAndRender(container, count, isSmall = false) {
    const shuffled = [...travelData].sort(() => 0.5 - Math.random());
    renderCards(container, shuffled.slice(0, count), isSmall);
}

// [핵심] 로컬 데이터 추가 생성 및 무한 스크롤 전환 함수
function appendLocalCards() {
    if (isDataLoading) return;
    isDataLoading = true;

    // 버튼이 아직 활성화 상태라면 로딩 표시
    if (loadMoreLocalBtn && !isInfiniteScrollActive) {
        loadMoreLocalBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 여행지 불러오는 중...';
        loadMoreLocalBtn.disabled = true;
    }

    // 가상의 네트워크 지연 후 카드 추가
    setTimeout(() => {
        let newCardsHTML = '';
        for(let i=0; i<8; i++) {
            const currentSeed = localSeedCounter++;
            newCardsHTML += `
                <div class="col">
                    <div class="local-card">
                        <div class="local-card-img">
                            <img src="https://picsum.photos/seed/local${currentSeed}/800/500" alt="새로운 여행지">
                            <button class="btn-wish"><i class="fa-regular fa-heart"></i></button>
                        </div>
                        <div class="local-card-body">
                            <h5 class="local-card-title">숨겨진 명소 ${currentSeed}</h5>
                            <span class="local-card-location">대한민국 어딘가</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (localGrid) {
            localGrid.insertAdjacentHTML('beforeend', newCardsHTML);
        }

        isDataLoading = false;

        // 첫 클릭 시에만 실행: 버튼 숨기고 스크롤 모드 활성화
        if (loadMoreLocalBtn && !isInfiniteScrollActive) {
            loadMoreLocalBtn.style.display = 'none';
            isInfiniteScrollActive = true;
            console.log("무한 스크롤 모드 활성");
        }
    }, 400);
}

// --- Initial Render ---
window.onload = () => {
    shuffleAndRender(mainGrid, 3);
    shuffleAndRender(ageGrid, 4, true);
    renderLocalCards();
};

// --- Event Listeners ---

// Section 1 Refresh
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        mainGrid.style.opacity = '0';
        setTimeout(() => {
            shuffleAndRender(mainGrid, 3);
            mainGrid.style.opacity = '1';
            icon.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

// Section 2 Refresh
if (ageRefreshBtn) {
    ageRefreshBtn.addEventListener('click', () => {
        const icon = ageRefreshBtn.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
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