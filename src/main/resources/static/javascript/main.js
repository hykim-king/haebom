document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initRegionSlider();
  initPopularSpots();
  initWeather();
});

/* ============================
   1. 인기 관광지
============================ */
function initPopularSpots() {

    // Lucide 아이콘(눈 모양 아이콘 등)만 렌더링되게 합니다.
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
}

/* ============================
   2. 메인 배너 이미지
============================ */
function initHeroSlider() {
    const slider = document.getElementById("hero-slider");
    if (!slider) return;

    const heroImages = [
        "/img/korea_trip1.jpg",
        "/img/korea_trip2.jpg",
        "/img/korea_trip3.jpg",
        "/img/korea_trip4.jpg",
        "/img/korea_trip5.jpg",
        "/img/korea_trip6.jpg",
        "/img/korea_trip7.jpg",
        "/img/korea_trip8.jpg",
        "/img/korea_trip9.jpg",
        "/img/korea_trip10.jpg",
        "/img/korea_trip11.jpg",
    ];
    //슬라이드 요소 생성
    heroImages.forEach((img, i) => {
        const slide = document.createElement("div");
        slide.className = "slide" + (i === 0 ? " active" : "");
        slide.style.backgroundImage = `url(${img})`;
        slider.appendChild(slide);
    });

    const slides = slider.querySelectorAll(".slide");

    // 요소가 없을 경우 함수를 종료하여 에러 방지
    if (slides.length === 0) {
        console.warn("히어로 슬라이드 이미지가 없습니다.");
        return;
    }

    let current = 0;
    setInterval(() => {
        // slides[current]가 존재하는지 한 번 더 체크
        if (slides[current]) {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }
    }, 4000);
}
/* ============================
   3. 지역별 추천 섹션
============================ */
function initRegionSlider() {
    // 서버(Thymeleaf)가 이미 HTML을 생성했으므로 innerHTML 코드는 삭제합니다.

    new Swiper('.regionSwiper', { // 클래스명이 HTML과 일치하는지 확인
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: { delay: 3000 },
        passiveListeners: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

/* ============================
   4. 날씨 BEST 추천 시스템
============================ */
// [함수 A] 날씨 점수 계산 (사용자 로직 반영)
function calculateWeatherScore(data) {
    let score = 0;

    // 1. 강수 유무 (비 안오면 50점)
    if (data.prep === "0") score += 50;

    // 2. 하늘 상태
    if (data.sky === "DB01") score += 30;      // 맑음
    else if (data.sky === "DB02") score += 20; // 구름조금
    else if (data.sky === "DB03") score += 10; // 구름많음

    // 3. 강수 확률 (확률이 낮을수록 가점)
    score += (100 - parseInt(data.st || 0)) * 0.1;

    // 4. 기온 (활동하기 적당한 18~24도 사이 가점)
    const temp = parseFloat(data.temp);
    if (temp >= 18 && temp <= 24) score += 5;

    return score;
}

// [함수 B] API 데이터 호출
async function initWeather() {
    const weatherList = document.getElementById("weatherList");
    if (!weatherList) return;

    try {
        const response = await fetch('/main/weather/api');
        const rawData = await response.text();

        // ★ 바로 요기! 데이터를 받자마자 콘솔에 찍어봅니다.
        console.log("=== [기상청 API 원본 데이터] ===");
        console.log(rawData);
        console.log("===============================");

        if (rawData.trim()) {
            processWeatherLogic(rawData);
        }
    } catch (error) {
        console.error("날씨 로드 실패:", error);
    }
}

// [함수 C] 데이터 파싱
function processWeatherLogic(rawData) {
    const lines = rawData.split("\n");
    const parsedData = [];

    lines.forEach((line) => {
        const row = line.trim();
        if (!row || row.startsWith("#")) return;

        const cols = row.split(/\s+/);

        // 지역명(cols[4])이 존재하고 도시 데이터('C')인 경우
        if (cols.length >= 5 && cols[3] === 'C') {
            const item = {
                region: cols[4],
                // 데이터가 15개 이상일 때만 상세 수치 할당, 아니면 기본값 "0"
                sky: cols[11] || "DB01",
                prep: cols[12] || "0",
                st: parseInt(cols[13]) || 0,
                temp: cols[14] || "0",
                wind: cols[16] || "0"
            };

            // 점수 계산 (이 함수가 main.js 안에 정의되어 있어야 함)
            item.score = calculateWeatherScore(item);
            parsedData.push(item);
        }
    });

    // 점수가 높은 순으로 정렬
    parsedData.sort((a, b) => b.score - a.score);

    // 데이터가 하나라도 있으면 렌더링
    if (parsedData.length > 0) {
        renderBestWeather(parsedData);
    } else {
        console.error("표시할 수 있는 날씨 데이터가 없습니다.");
    }
}

// // 날씨 점수제 로직
// function calculateWeatherScore(data) {
//     let score = 0;
//
//     // 기온이 0인 데이터는 예보가 아직 생성 안 된 것이므로 하위권으로 배치
//     if (data.temp === "0" || data.temp === "") return -100;
//
//     // 1. 강수 유무 (비 안 오면 50점)
//     if (data.prep === "0") score += 50;
//
//     // 2. 기온 가산점 (15~25도 사이 여행하기 좋은 날씨)
//     const t = parseFloat(data.temp);
//     if (t >= 15 && t <= 25) score += 30;
//
//     // 3. 강수확률 감점
//     score += (100 - data.st) * 0.2;
//
//     return score;
// }

function renderBestWeather(allRegions) {
    const weatherList = document.getElementById("weatherList");
    if (!weatherList) return;

    // 전국에서 점수가 높은 순으로 정렬 후 TOP 3 추출
    const best3 = allRegions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    weatherList.innerHTML = best3.map((data, index) => {
        // 아이콘 결정
        let iconName = "sun";
        if (data.prep !== "0") iconName = "cloud-rain";
        else if (data.sky === "DB03" || data.sky === "DB04") iconName = "cloud";

        return `
        <div class="col-md-4">
          <div class="card shadow-lg border-0 rounded-4">
            <div class="card-body text-center p-4">
              <div class="mb-2">
                <span class="badge ${index === 0 ? 'bg-danger' : 'bg-primary'} rounded-pill px-3">
                    BEST ${index + 1}
                </span>
              </div>
              <h3 class="fw-bold mb-3" style="font-size: 24px;">${data.region}</h3>
              <div class="mb-3">
                <i data-lucide="${iconName}" class="text-warning" style="width: 50px; height: 50px;"></i>
              </div>
              <div class="weather-info-grid">
                <div class="info-item">
                    <span class="label">기온</span>
                    <span class="value">${data.temp}°C</span>
                </div>
                <div class="info-item">
                    <span class="label">강수확률</span>
                    <span class="value">${data.st}%</span>
                </div>
                <div class="info-item">
                    <span class="label">풍속</span>
                    <span class="value">${data.wind}m/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Lucide 아이콘 재생성
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}