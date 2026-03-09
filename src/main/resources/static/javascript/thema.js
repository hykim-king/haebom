// -----------------------------
// ⭐ 1️⃣ 전역 상태 변수
// -----------------------------
let page = 1;
let pageSize = 8;
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
    const isWished = Number(item.isWish) > 0;
    const heartIconClass = isWished ? 'fa-solid' : 'fa-regular';
    const activeClass = isWished ? 'active' : '';

    return `
    <div class="col-md-3 col-sm-6 mb-4">
      <div class="card h-100 shadow-sm" data-id="${item.id}"> 
        <img src="${item.img}" class="card-img-top" alt="${item.title}">
        <div class="card-body">
          <div class="card-title-row d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0 text-truncate" style="max-width: 80%;">${item.title}</h5>
            <button class="btn-wish border-0 bg-transparent p-0 ${activeClass}">
              <i class="${heartIconClass} fa-heart" style="color: #ff4d4d;"></i>
            </button>
          </div>
          <span class="card-location small text-muted text-truncate d-block">${item.location}</span>
        </div>
      </div>
    </div>`;
}

function mapItemToCard(item) {
    let finalImg = item.tripPathNm;
    if (!finalImg || finalImg === 'null' || finalImg.trim() === '') {
        return null;
    }
    let displayAddr = item.tripAddr || "";
    if (displayAddr) {
        const addrParts = displayAddr.split(" ");
        let city = addrParts[0].replace(/특별자치도|광역시|특별시|자치시/g, "");
        let district = addrParts[1] || "";
        displayAddr = `${city} ${district}`.trim();
    }
    // ⭐ [수정] XML에서 tripInqCnt 필드에 isWish 결과값을 담아 보냈으므로 이를 매핑합니다.
    return { 
        id: item.tripContsId, 
        title: item.tripNm, 
        location: displayAddr, 
        img: finalImg, 
        isWish: item.tripInqCnt 
    };
}

// -----------------------------
// 3️⃣ AJAX 조회 및 렌더링 함수
// -----------------------------
function loadListAjax(isMore = false) {
    if (isLoading) return;
    isLoading = true;

    let tagValue = "";
    if (selectedTheme === "0") {
        const allCodes = Object.values(THEME_CODE_MAP).flat();
        tagValue = allCodes.join(",");
    } else {
        const codeArray = THEME_CODE_MAP[selectedTheme];
        tagValue = codeArray ? codeArray.join(",") : "0";
    }

    const searchVO = {
        tripTag: tagValue,
        pageNo: page,
        pageSize: pageSize,
        searchWord: currentSort
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

    list.forEach(item => {
        const cardData = mapItemToCard(item);
        if (cardData) {
            grid.insertAdjacentHTML("beforeend", createCardHTML(cardData));
        }
    });
}

function appendAjaxList(list) {
    const grid = document.getElementById("localTravelGrid");
    if (!grid || !list) return;

    list.forEach(item => {
        const cardData = mapItemToCard(item);
        if (cardData) {
            grid.insertAdjacentHTML("beforeend", createCardHTML(cardData));
        }
    });
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

    loadListAjax();

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            if (pageSize === 8) {
                pageSize = 12;
                page = 2;
            } else {
                page++;
            }
            loadListAjax(true);
            if (!isScrollActive) {
                isScrollActive = true;
                activateInfiniteScroll();
                $(this).fadeOut(500);
            }
        });
    }

    if (sortByHitsBtn) {
        sortByHitsBtn.addEventListener("click", function () {
            if (currentSort === "hits") {
                currentSort = "default";
                this.classList.remove("active");
                this.style.backgroundColor = "";
                this.style.color = "";
                this.style.borderColor = "";
            } else {
                currentSort = "hits";
                this.classList.add("active");
                this.style.backgroundColor = "#ff4d4d";
                this.style.color = "#fff";
                this.style.borderColor = "#ff4d4d";
            }
            page = 1;
            isScrollActive = false;
            $(window).off("scroll");
            if (loadMoreBtn) $(loadMoreBtn).show();
            loadListAjax();
        });
    }

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

    // -----------------------------
    // 하트 토글 이벤트
    // -----------------------------
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-wish");
        if (!btn) return;

        // 로그인 여부 체크
        if (typeof window.isFirstLogin === 'undefined' || window.isFirstLogin === false) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        const icon = btn.querySelector("i");
        const isActivating = icon.classList.contains("fa-regular");
        const card = btn.closest(".card");
        const tripContsId = card ? card.dataset.id : null;

        if (!tripContsId) {
            console.error("여행지 ID를 찾을 수 없습니다.");
            return;
        }

        $.ajax({
            url: isActivating ? "/thema/wish/add.do" : "/thema/wish/delete.do",
            type: "POST",
            beforeSend: function (xhr) {
                const token = $("meta[name='_csrf']").attr("content");
                const header = $("meta[name='_csrf_header']").attr("content");
                if (header && token) {
                    xhr.setRequestHeader(header, token);
                }
            },
            data: { "tripContsId": tripContsId },
            success: function (res) {
                if (isActivating) {
                    icon.classList.replace("fa-regular", "fa-solid"); 
                    btn.classList.add("active");
                } else {
                    icon.classList.replace("fa-solid", "fa-regular");
                    btn.classList.remove("active");
                }
            },
            error: function (xhr) {
                if (xhr.status === 403) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                } else {
                    alert("처리 중 오류가 발생했습니다.");
                }
            }
        });
    });
});

window.addEventListener("scroll", function () {
    const topBtn = document.getElementById("backToTop");
    if (topBtn) {
        if (window.scrollY > 300) {
            topBtn.style.setProperty("display", "flex", "important");
        } else {
            topBtn.style.setProperty("display", "none", "important");
        }
    }
});

const topBtnEl = document.getElementById("backToTop");
if (topBtnEl) {
    topBtnEl.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}