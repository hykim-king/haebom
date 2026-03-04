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

// [함수 A] API 데이터 호출
async function initWeather() {
    try {
        const response = await fetch('/main/weather/api');
        const rawData = await response.text(); // JSON이 아닌 TEXT로 받음

        console.log("서버 응답 데이터:", rawData);

        if (rawData && rawData.includes("#START77")) {
            processWeatherLogic(rawData); // 이전에 만든 텍스트 파싱 함수
        } else if (rawData.includes("403")) {
            console.error("API 권한 에러(403) 발생. 활용 신청 상태를 확인하세요.");
        }
    } catch (error) {
        console.error("날씨 호출 실패:", error);
    }
}

// [함수 B] 데이터 파싱 (기상청 ASCII 형식 대응)
function processWeatherLogic(rawData) {
    const lines = rawData.split("\n");
    const parsedData = [];

    lines.forEach((line) => {
        const row = line.trim();
        if (!row || row.startsWith("#")) return; // 주석 라인 제외

        const cols = row.split(/\s+/); // 공백 기준으로 열 분리

        // fct_afs_dl2.php (단기개황) 결과 컬럼 수에 맞춰 인덱스 조정
        const f = line.split(","); // 공백 대신 쉼표로 분리 (CSV 형식)
        if (f.length >= 18) {
            const item = {
                region: f[1],   // 지점명
                temp: f[12],    // 기온
                st: f[13],      // 강수확률
                sky: f[14],     // 하늘상태
                prep: f[15]     // 강수유무
            };

            // 유효한 기온 데이터가 있을 때만 추가
            if (item.temp && item.temp !== "-99") {
                // 점수 계산 (calculateWeatherScore 함수가 있다고 가정)
                item.score = typeof calculateWeatherScore === 'function' ? calculateWeatherScore(item) : 0;
                parsedData.push(item);
            }
        }
    });

    if (parsedData.length > 0) {
        renderBestWeather(parsedData);
    }
}

// [함수 C] 화면 렌더링
function renderBestWeather(allRegions) {
    const weatherList = document.getElementById("weatherList");
    if (!weatherList) return;

    // 점수순 정렬 후 TOP 3 추출
    const best3 = allRegions
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3);

    weatherList.innerHTML = best3.map((data, index) => {
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

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}