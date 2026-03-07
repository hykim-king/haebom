// -----------------------------
// ⭐ 1️⃣ 전역 상태 변수
// -----------------------------
let page = 1;
const pageSize = 8;
let selectedTheme = "0";
let currentSort = "default"; // "default" 또는 "hits"
let isLoading = false;
let isScrollActive = false;

const THEME_CODE_MAP = {
    "mountain": ["A01010400"], "waterfall": ["A01010800"], "valley": ["A01010900"],
    "sea": ["A01011100", "A01011200", "A01011400", "A01011600"], "lake": ["A01011700"],
    "river": ["A01011800"], "cave": ["A01011900"],
    "history": ["A02010100", "A02010200", "A02010300", "A02010600", "A02010700"],
    "temple": ["A02010800"], "spa": ["A02020300"], "themepark": ["A02020600"],
    "experience": ["A02030100", "A02030200", "A02030300", "A02030400"],
    "view": ["A02050200"], "culture": ["A02060100", "A02060200", "A02060300", "A02060500", "A02061200"],
    "leisure": [
        "A03020300", "A03020400", "A03020500", "A03020600", "A03020700", "A03020900",
        "A03021100", "A03021200", "A03021300", "A03021400", "A03021600", "A03021700",
        "A03021800", "A03022000", "A03022100", "A03022200", "A03022300", "A03022400",
        "A03022700", "A03030100", "A03030200", "A03030300", "A03030400", "A03030500",
        "A03030600", "A03030700", "A03030800", "A03040100", "A03040200", "A03040300"
    ]
};

const THEMES = [
    { id: '0', icon: '✨', label: '전체' }, { id: 'mountain', icon: '⛰️', label: '산' },
    { id: 'waterfall', icon: '🌊', label: '폭포' }, { id: 'valley', icon: '💦', label: '계곡' },
    { id: 'sea', icon: '🏖️', label: '바다' }, { id: 'lake', icon: '🚣', label: '호수' },
    { id: 'river', icon: '🏞️', label: '강' }, { id: 'cave', icon: '🦇', label: '동굴' },
    { id: 'history', icon: '🏯', label: '역사 관광지' }, { id: 'temple', icon: '🙏', label: '사찰' },
    { id: 'spa', icon: '♨️', label: '온천/스파' }, { id: 'themepark', icon: '🎡', label: '테마공원' },
    { id: 'experience', icon: '🚜', label: '체험' }, { id: 'view', icon: '🗼', label: '기념/전망' },
    { id: 'culture', icon: '🏛️', label: '문화시설' }, { id: 'leisure', icon: '🚲', label: '레포츠' }
];

// -----------------------------
// 2️⃣ 카드 템플릿 및 변환 유틸
// -----------------------------
function createCardHTML(item) {
    return `
    <div class="col-md-3 col-sm-6 mb-4">
      <div class="card h-100 shadow-sm">
        <img src="${item.img}" class="card-img-top" alt="${item.title}">
        <div class="card-body">
          <div class="card-title-row d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0 text-truncate" style="max-width: 80%;">${item.title}</h5>
            <button class="btn-wish border-0 bg-transparent p-0">
              <i class="fa-regular fa-heart" style="color: #ff4d4d;"></i>
            </button>
          </div>
          <span class="card-location small text-muted text-truncate d-block">${item.location}</span>
        </div>
      </div>
    </div>`;
}

function mapItemToCard(item) {
    let finalImg = item.tripPathNm;
    if (!finalImg || finalImg === 'null') {
        finalImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
    let displayAddr = item.tripAddr || "";
    if (displayAddr) {
        const addrParts = displayAddr.split(" ");
        let city = addrParts[0].replace(/특별자치도|광역시|특별시|자치시/g, "");
        let district = addrParts[1] || "";
        displayAddr = `${city} ${district}`.trim();
    }
    return { id: item.tripContsId, title: item.tripNm, location: displayAddr, img: finalImg };
}

// -----------------------------
// 3️⃣ AJAX 조회 및 렌더링 함수
// -----------------------------
function loadListAjax(isMore = false) {
    if (isLoading) return;
    isLoading = true;

    const codeArray = THEME_CODE_MAP[selectedTheme];
    let tagValue = (selectedTheme === "0" || !codeArray) ? "0" : codeArray.join(",");

    const searchVO = {
        tripTag: tagValue,
        pageNo: page,
        pageSize: pageSize,
        searchWord: currentSort // 서버에서 이 값을 보고 정렬 분기
    };

    $.ajax({
        url: "/thema/doRetrieve.do",
        type: "GET",
        data: searchVO,
        success: function (res) {
            const dataList = res || [];
            if (!isMore) renderAjaxList(dataList);
            else appendAjaxList(dataList);
            isLoading = false;
        },
        error: function (xhr) {
            console.error("조회 실패:", xhr.status);
            isLoading = false;
        }
    });
}

function renderAjaxList(list) {
    const grid = document.getElementById("localTravelGrid");
    if (!grid) return;
    grid.innerHTML = "";
    if (!list || list.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5">조회된 여행지가 없습니다.</div>';
        return;
    }
    list.forEach(item => grid.insertAdjacentHTML("beforeend", createCardHTML(mapItemToCard(item))));
}

function appendAjaxList(list) {
    const grid = document.getElementById("localTravelGrid");
    if (!grid || !list) return;
    list.forEach(item => grid.insertAdjacentHTML("beforeend", createCardHTML(mapItemToCard(item))));
}

// -----------------------------
// 4️⃣ 무한 스크롤 엔진
// -----------------------------
function activateInfiniteScroll() {
    $(window).on("scroll", function () {
        if (!isScrollActive) return;
        let scrollTop = $(window).scrollTop();
        let windowHeight = $(window).height();
        let documentHeight = $(document).height();

        if (scrollTop + windowHeight >= documentHeight - 200) {
            if (!isLoading) {
                page++;
                loadListAjax(true);
            }
        }
    });
}

// -----------------------------
// 5️⃣ DOM 로드 및 이벤트
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    const loadMoreBtn = document.getElementById("loadMoreLocalBtn");
    const wrapper = document.getElementById("categoryWrapper");
    const sortByHitsBtn = document.getElementById("sortByHits");

    // 카테고리 초기 렌더링
    if (wrapper) {
        wrapper.innerHTML = THEMES.map(theme => `
            <div class="swiper-slide category-item ${theme.id === selectedTheme ? 'active' : ''}" data-id="${theme.id}">
              <div class="category-icon">${theme.icon}</div>
              <span>${theme.label}</span>
            </div>
        `).join("");

        new Swiper('.categorySwiper', {
            slidesPerView: 'auto',
            spaceBetween: 16,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        });
    }

    // 최초 8개 로드
    loadListAjax();

    // 더보기 버튼
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            page++;
            loadListAjax(true);
            if (!isScrollActive) {
                isScrollActive = true;
                activateInfiniteScroll();
                $(this).fadeOut(500);
            }
        });
    }

    // ⭐ [중요] 조회수 정렬 버튼 이벤트 (하나로 통합 및 스타일 수정)
    if (sortByHitsBtn) {
        sortByHitsBtn.addEventListener("click", function () {
            // 1. 상태 토글
            if (currentSort === "hits") {
                currentSort = "default";
                this.classList.remove("active");
                // 인라인 스타일 직접 제거 (CSS 클래스로 제어하는 것이 더 좋지만 우선 인라인으로 처리)
                this.style.backgroundColor = ""; 
                this.style.color = "";
                this.style.borderColor = "";
                console.log("정렬: 최신순으로 복귀");
            } else {
                currentSort = "hits";
                this.classList.add("active");
                // 활성화 색상 적용
                this.style.backgroundColor = "#ff4d4d";
                this.style.color = "#fff";
                this.style.borderColor = "#ff4d4d";
                console.log("정렬: 조회수순으로 변경");
            }

            // 2. 페이지 및 스크롤 초기화
            page = 1;
            isScrollActive = false;
            $(window).off("scroll");
            if (loadMoreBtn) $(loadMoreBtn).show();

            // 3. 데이터 재조회
            loadListAjax(); 
        });
    }

    // 카테고리 클릭
    document.addEventListener("click", function (e) {
        const category = e.target.closest(".category-item");
        if (!category) return;

        document.querySelectorAll(".category-item").forEach(item => item.classList.remove("active"));
        category.classList.add("active");

        selectedTheme = category.dataset.id;
        page = 1;
        isScrollActive = false;
        $(window).off("scroll");
        if (loadMoreBtn) $(loadMoreBtn).show();

        loadListAjax(); 
    });

    // 하트 토글
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-wish");
        if (!btn) return;
        const icon = btn.querySelector("i");
        btn.classList.toggle("active");
        if (icon.classList.contains("fa-regular")) {
            icon.classList.replace("fa-regular", "fa-solid");
        } else {
            icon.classList.replace("fa-solid", "fa-regular");
        }
    });
});