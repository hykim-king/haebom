// -----------------------------
// 1️⃣ 테마 데이터
// -----------------------------
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

// -----------------------------
// 2️⃣ 초기 카드 데이터
// -----------------------------
const data = [
    { title: "한산마리나요트", location: "경남 통영시", img: "https://picsum.photos/seed/1/800/500" },
    { title: "퀸스타운 카페", location: "인천 연수구", img: "https://picsum.photos/seed/2/800/500" },
    { title: "한국 근현대 미술전", location: "광주 광산구", img: "https://picsum.photos/seed/3/800/500" },
    { title: "서울시립 사진미술관", location: "서울 도봉구", img: "https://picsum.photos/seed/4/800/500" },
    { title: "한산마리나요트", location: "경남 통영시", img: "https://picsum.photos/seed/5/800/500" },
    { title: "퀸스타운 카페", location: "인천 연수구", img: "https://picsum.photos/seed/6/800/500" },
    { title: "한국 근현대 미술전", location: "광주 광산구", img: "https://picsum.photos/seed/7/800/500" },
    { title: "서울시립 사진미술관", location: "서울 도봉구", img: "https://picsum.photos/seed/8/800/500" }
];

// -----------------------------
// 3️⃣ 카드 템플릿
// -----------------------------
function createCardHTML(item) {
    return `
    <div class="col-md-3 col-sm-6">
      <div class="card">
        
        <img src="${item.img}" class="card-img-top" alt="${item.title}">
        
        <div class="card-body">

          <div class="card-title-row">
            <h5 class="card-title mb-0">${item.title}</h5>

            <button class="btn-wish">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>

          <span class="card-location">${item.location}</span>

        </div>

      </div>
    </div>
  `;
}

// -----------------------------
// 4️⃣ DOM 로드
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("localTravelGrid");
    const loadMoreBtn = document.getElementById("loadMoreLocalBtn");

    // -------------------------
    // 초기 카드 렌더링
    // -------------------------
    data.forEach(item => {
        grid.insertAdjacentHTML("beforeend", createCardHTML(item));
    });

    // -------------------------
    // 더보기 기능
    // -------------------------
    let seedCounter = 9;

    loadMoreBtn.addEventListener("click", () => {

        const originalText = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 불러오는 중...';
        loadMoreBtn.disabled = true;

        setTimeout(() => {

            for (let i = 0; i < 8; i++) {
                const newItem = {
                    title: `숨겨진 명소 ${seedCounter}`,
                    location: "대한민국 어딘가",
                    img: `https://picsum.photos/seed/${seedCounter}/800/500`
                };

                grid.insertAdjacentHTML("beforeend", createCardHTML(newItem));
                seedCounter++;
            }

            loadMoreBtn.innerHTML = originalText;
            loadMoreBtn.disabled = false;

        }, 400);
    });

    // -------------------------
    // ⭐ 하트 토글 (CSS active 사용)
    // -------------------------
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-wish");
        if (!btn) return;

        const icon = btn.querySelector("i");

        btn.classList.toggle("active");

        if (icon.classList.contains("fa-regular")) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
        }
    });

    // -------------------------
    // 카테고리 렌더링
    // -------------------------
    const wrapper = document.getElementById("categoryWrapper");

    wrapper.innerHTML = THEMES.map(theme => `
    <div class="swiper-slide category-item" data-id="${theme.id}">
      <div class="category-icon">${theme.icon}</div>
      <span>${theme.label}</span>
    </div>
  `).join("");

    new Swiper('.categorySwiper', {
        slidesPerView: 'auto',
        spaceBetween: 16,
        centeredSlides: true,
        centeredSlidesBounds: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    });

});