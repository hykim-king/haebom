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
   4. 날씨 BEST 세션
============================ */
function initWeather() {
  const weatherList = document.getElementById("weatherList");
  if (!weatherList) return;

  const weatherData = [
    { region: "강릉", temp: "15", pop: "10", wind: "2.5", sky: "DB01" },
    { region: "여수", temp: "18", pop: "20", wind: "3.1", sky: "DB02" },
    { region: "전주", temp: "16", pop: "0", wind: "1.8", sky: "DB01" }
  ];

  weatherList.innerHTML = "";
  weatherData.forEach((data) => {
    let iconName = "sun";
    if (data.sky === "DB03") {
      iconName = "cloud-sun";
    } else if (data.sky === "DB04") {
      iconName = "cloud";
    }

    weatherList.innerHTML += `
      <div class="col-md-4">
        <div class="card shadow-lg border-0 rounded-4 hover-lift">
          <div class="card-body text-center">
            <h3 class="fw-bold mb-2" style="font-size: 22px;">${data.region}</h3>
            <div class="weather-icon-box my-3">
              <i data-lucide="${iconName}" class="weather-main-icon"></i>
            </div>
            <div class="weather-info-grid">
              <div class="info-item">
                <span class="label">기온</span>
                <span class="value">${data.temp}°C</span>
              </div>
              <div class="info-item">
                <span class="label">강수</span>
                <span class="value">${data.pop}%</span>
              </div>
              <div class="info-item">
                <span class="label">풍량</span>
                <span class="value">${data.wind}m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}
