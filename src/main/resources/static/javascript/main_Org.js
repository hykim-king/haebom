document.addEventListener("DOMContentLoaded", () => {
 // initHeroButton();
  initHeroSlider();
  initRegionSlider();
  initPopularSpots(); // 가독성을 위해 인기 관광지 로직도 함수화 권장
  initWeather();      // 날씨 로직도 함수화 권장
});

/* ============================
   1. 인기 관광지
============================ */
  const popularSpots = [
    {
      name: "남산 서울타워",
      location: "서울 용산구",
      views: "1.2M",
      image:
        "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?q=80&w=1080",
    },
    {
      name: "해운대 해수욕장",
      location: "부산 해운대구",
      views: "980K",
      image:
        "https://images.unsplash.com/photo-1762440752251-5ce203a63048?q=80&w=1080",
    },
    {
      name: "불국사",
      location: "경북 경주시",
      views: "850K",
      image:
        "https://images.unsplash.com/photo-1653632445017-0da95027672c?q=80&w=1080",
    },
  ];

  /* 조회수 문자열을 숫자로 변환 */
  function parseViews(viewStr) {
    if (viewStr.includes("M")) return parseFloat(viewStr) * 1000000;
    if (viewStr.includes("K")) return parseFloat(viewStr) * 1000;
    return parseFloat(viewStr);
  }

  /* 조회수 기준 내림차순 정렬 */
  popularSpots.sort((a, b) => parseViews(b.views) - parseViews(a.views));

  /*순위 메달*/
  const medalIcons  = ["🥇", "🥈", "🥉"];

  const popularList = document.getElementById("popularList");

popularSpots.forEach((s, i) => {
  popularList.innerHTML += `
    <a href="#" class="list-group-item popular-item d-flex align-items-center shadow-sm rounded mb-4">
      <div class="me-4">
        <span class="rank-badge">
          ${medalIcons [i] || (i + 1)}
        </span>
      </div>

      <div class="thumb me-4">
        <img src="${s.image}">
      </div>

      <div class="flex-grow-1">
        <h4 class="fw-bold mb-1">${s.name}</h4>
        <p class="text-muted mb-0">${s.location}</p>
      </div>

      <div class="views-box">
        <i data-lucide="eye"></i>
        <span>${s.views}</span>
      </div>
    </a>
  `;
  });

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

    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 4000);
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
    const sliderWrapper = document.getElementById('regionSliderWrapper');
    if (!sliderWrapper) return;

    // api/travel-data.js (나중에 이 부분만 fetch API로 바뀝니다)
    const regions = [
        {
            title: "바다에 스며든 낭만",
            desc: "제주 동쪽&서쪽 일몰 명소",
            img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        {
            title: "가을빛 머금은 산사",
            desc: "경주 불국사의 고즈넉한 풍경",
            img: "https://images.unsplash.com/photo-1596472412854-464972e2764b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        {
            title: "밤바다의 황홀함",
            desc: "부산 광안대교 야경 투어",
            img: "https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        {
            title: "커피 향 가득한 거리",
            desc: "강릉 안목해변 카페거리",
            img: "https://images.unsplash.com/photo-1629166921272-36c174623725?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        {
            title: "도심 속 힐링",
            desc: "서울 한강공원 피크닉",
            img: "https://images.unsplash.com/photo-1538485399081-7191377e8241?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
        },
        {
            title: "전통과 현대의 조화",
            desc: "전주 한옥마을 산책",
            img: "https://images.unsplash.com/photo-1598921868476-80db268c7835?q=80&w=1080"
        }
    ];

    sliderWrapper.innerHTML = "";
    regions.forEach((region, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        // Set background image directly on the slide for the 'cover' effect
        slide.style.backgroundImage = `url('${region.img}')`;
        
        slide.innerHTML = `
            <div class="slide-content-overlay">
                <h3 class="slide-title">${region.title}</h3>
                <p class="slide-desc">${region.desc}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <a href="#" class="slide-btn">
                        자세히 보기 <i data-lucide="chevron-right" size="16"></i>
                    </a>
                    <span class="slide-number">
                        ${index + 1} / ${regions.length} <span style="opacity:0.5; margin-left:5px;">||</span>
                    </span>
                </div>
            </div>
        `;
        sliderWrapper.appendChild(slide);
    });

    // Initialize Swiper

new Swiper('.region-swiper', {
    effect: 'slide',
    grabCursor: true,
    centeredSlides: false, // 중앙 정렬
    slidesPerView: 10, //카드 간격
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false, // 그림자가 너무 어두우면 false
    },
   loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        spaceBetween: 20, 
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 10 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 30 }
        }
    });
}
  
/* ============================
   4. 날씨 BEST 세션
============================ */
const weatherList = document.getElementById("weatherList");
// 샘플 데이터를 API 구조와 유사하게 구성 (나중에 실제 API 연동 시 이 객체만 교체하면 됩니다)
const weatherData = [
  { region: "강릉", temp: "15", pop: "10", wind: "2.5", sky: "DB01" }, // DB01: 맑음
  { region: "여수", temp: "18", pop: "20", wind: "3.1", sky: "DB02" }, // DB02: 구름조금
  { region: "전주", temp: "16", pop: "0", wind: "1.8", sky: "DB01" }
];

weatherList.innerHTML = ""; // 기존 내용 초기화

weatherData.forEach((data) => {
  // 1. SKY 코드에 따른 아이콘 및 색상 매핑
  let iconName = "sun"; 
  let iconColor = "text-warning"; // 노란색 (맑음)

  if (data.sky === "DB03") {
    iconName = "cloud-sun"; 
    iconColor = "text-secondary"; // 회색빛 (구름많음)
  } else if (data.sky === "DB04") {
    iconName = "cloud"; 
    iconColor = "text-muted";    // 어두운 회색 (흐림)
  }

/*
weatherData.forEach((data) => {
  // 하늘상태코드(SKY)에 따른 아이콘 설정
  let iconName = "sun"; // 기본값
  if (data.sky === "DB03" || data.sky === "DB04") iconName = "cloud";
  if (data.sky === "snow") iconName = "snowflake"; // 예시
  */

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

