document.addEventListener("DOMContentLoaded", () => {
 // initHeroButton();
  initHeroSlider();
  initRegionSlider();// 가독성을 위해 인기 관광지 로직도 함수화 권장
  initWeather();      // 날씨 로직도 함수화 권장
});

/* ============================
   1. 인기 관광지
============================ */
function initPopularSpots() {
    // HTML은 Thymeleaf(th:each)가 이미 생성함.
    // Lucide 아이콘만 다시 그려줌
    if (window.lucide) {
        window.lucide.createIcons();
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

      heroImages.forEach((img, i) => {
          const slide = document.createElement("div");
          slide.className = "slide" + (i === 0 ? " active" : "");
          slide.style.backgroundImage = `url(${img})`;
          slider.appendChild(slide);
      });

      const slides = slider.querySelectorAll(".slide");
      let current = 0;
      if(slides.length > 0) {
          setInterval(() => {
              slides[current].classList.remove("active");
              current = (current + 1) % slides.length;
              slides[current].classList.add("active");
          }, 4000);
      }
  }

  const slider = document.querySelector(".region-slider");

  if (slider) {
    regions.forEach((r) => {
      slider.innerHTML += `
      <div class="px-3 py-3">
        <div class="card region-card shadow-lg rounded-5 overflow-hidden position-relative"
             data-region="${r.name}"
             style="height:450px; cursor:pointer;">
          <img src="${r.image}" 
               class="w-100 h-100 position-absolute top-0 start-0"
               style="object-fit:cover;" />

          <div class="card-img-overlay bg-gradient-dark d-flex flex-column justify-content-end">
            <h3 class="text-white fw-bold mb-0">${r.name}</h3>
            <p class="text-light mb-2">${r.description}</p>
          </div>
        </div>
      </div>
    `;
    });

    $(".region-slider").slick({
      centerMode: true,
      slidesToShow: 3,
      autoplay: true,
      responsive: [{ breakpoint: 992, settings: { slidesToShow: 1 } }],
    });
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".region-card");
    if (!card) return;

    const region = card.dataset.region;
    console.log("선택한 지역:", region);

    // 실제 사용 시
    // location.href = `/travel/list.html?region=${encodeURIComponent(region)}`;
  });

/* ============================
   3. 지역별 추천 섹션
============================ */
function initRegionSlider() {
//  Swiper 활성화 설정만 남깁니다.
    new Swiper(".regionSwiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        }
    });
}
  
/* ============================
   4. 날씨 BEST 세션
============================ */
function initWeather() {
    const weatherList = document.getElementById("weatherList");
    if (!weatherList) return;

    // TODO: 추후 fetch('/api/main/weather') 로 변경 예정
    const weatherData = [
        { region: "강릉", temp: "15", pop: "10", wind: "2.5", sky: "DB01" },
        { region: "여수", temp: "18", pop: "20", wind: "3.1", sky: "DB02" },
        { region: "전주", temp: "16", pop: "0", wind: "1.8", sky: "DB01" }
    ];

    weatherList.innerHTML = "";

    weatherData.forEach((data) => {
        let iconName = "sun";
        if (data.sky === "DB03") iconName = "cloud-sun";
        else if (data.sky === "DB04") iconName = "cloud";

        weatherList.innerHTML += `
            <div class="col-md-4">
                <div class="card shadow-lg border-0 rounded-4 hover-lift">
                    <div class="card-body text-center">
                        <h3 class="fw-bold mb-2">${data.region}</h3>
                        <div class="weather-icon-box my-3">
                            <i data-lucide="${iconName}" class="weather-main-icon"></i>
                        </div>
                        <div class="weather-info-grid">
                            <div class="info-item"><span class="label">기온</span><span class="value">${data.temp}°C</span></div>
                            <div class="info-item"><span class="label">강수</span><span class="value">${data.pop}%</span></div>
                            <div class="info-item"><span class="label">풍량</span><span class="value">${data.wind}m/s</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    if (window.lucide) lucide.createIcons();
}
