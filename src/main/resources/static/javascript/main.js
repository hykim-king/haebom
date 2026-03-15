/**
 * 해봄트립 메인 스크립트
 * 통합 초기화 및 섹션별 로직 관리
 */
document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();      // 1. 메인 배너 슬라이더
    initRegionSlider();    // 2. 지역별 추천 슬라이더 (Swiper)
    initPopularSpots();    // 3. 인기 관광지 아이콘 초기화
    initWeather();         // 4. 날씨 기반 BEST 추천 시스템
    initSearchEvents();    // 5. 검색 이벤트 (엔터키 등)
});

/* ==========================================
   1. 인기 관광지 (Lucide 아이콘 초기화)
========================================== */
function initPopularSpots() {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

/* ==========================================
   2. 메인 히어로 배너 슬라이더
========================================== */
function initHeroSlider() {
    const slider = document.getElementById("hero-slider");
    if (!slider) return;

    const heroImages = [
        "/img/korea_trip12.jpg", "/img/korea_trip1.jpg", "/img/korea_trip2.jpg", "/img/korea_trip3.jpg",
        "/img/korea_trip4.jpg", "/img/korea_trip5.jpg", "/img/korea_trip6.jpg",
        "/img/korea_trip7.jpg", "/img/korea_trip8.jpg", "/img/korea_trip9.jpg",
        "/img/korea_trip10.jpg", "/img/korea_trip11.jpg",
    ];

    // 슬라이드 DOM 요소 동적 생성
    const fragment = document.createDocumentFragment();
    heroImages.forEach((img, i) => {
        const slide = document.createElement("div");
        slide.className = `slide ${i === 0 ? "active" : ""}`;
        slide.style.backgroundImage = `url(${img})`;
        fragment.appendChild(slide);
    });
    slider.appendChild(fragment);

    const slides = slider.querySelectorAll(".slide");
    if (slides.length === 0) return;

    let current = 0;
    setInterval(() => {
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
    }, 4000);
}

function initSearchEvents() {
    const searchInput = document.getElementById("main-search-input");
    const searchBtn = document.getElementById("main-search-btn");

    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleMainSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", handleMainSearch);
    }
}

function handleMainSearch() {
    const category = document.getElementById("search-category").value;
    const keyword = document.getElementById("main-search-input").value.trim();

    if (!keyword) {
        alert("검색어를 입력해주세요.");
        return;
    }

    if (category === "trip") {
        // 기존 여행지 페이지로 이동
        window.location.href = `/trip/trip?searchWord=${encodeURIComponent(keyword)}`;
    } else if (category === "course") {
        // 여행코스 페이지로 이동
        window.location.href = `/trip_course/trip_course?searchWord=${encodeURIComponent(keyword)}`;
    }
}

/* ==========================================
   3. 지역별 추천 섹션 (Swiper.js)
========================================== */
function initRegionSlider() {
    // Swiper 인스턴스 생성
    new Swiper('.regionSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        // 1. 페이지네이션 (하단 점) 설정
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        // 2. 네비게이션 (좌우 화살표) 설정 추가
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // 3. 반응형 브레이크포인트
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        }
    });
}

/* ==========================================
   4. 날씨 BEST 추천 시스템 (API 연동 및 알고리즘)
========================================== */

// 지역 코드 매핑 테이블 (필요한 주요 도시 위주 관리)
const regionMap = {
    // 기본 및 전국
    "108": "전국",

    // 서울, 인천, 경기도 (11B)    // 강원도 (11D, 11E)
    "11B10101": "서울",           "11D10101": "철원",
    "11B10102": "과천",           "11D10102": "화천",
    "11B10103": "광명",           "11D10201": "인제",
    "11B20101": "강화",           "11D10202": "양구",
    "11B20102": "김포",           "11D10301": "춘천",
    "11B20201": "인천",           "11D10302": "홍천",
    "11B20202": "시흥",           "11D10401": "원주",
    "11B20203": "안산",           "11D10402": "횡성",
    "11B20204": "부천",           "11D10501": "영월",
    "11B20301": "의정부",         "11D10502": "정선",
    "11B20302": "고양",           "11D10503": "평창",
    "11B20304": "양주",           "11D20201": "대관령",
    "11B20305": "파주",           "11D20301": "태백",
    "11B20401": "동두천",         "11D20401": "속초",
    "11B20402": "연천",           "11D20402": "고성",
    "11B20403": "포천",           "11D20403": "양양",
    "11B20404": "가평",           "11D20501": "강릉",
    "11B20501": "구리",           "11D20601": "동해",
    "11B20502": "남양주",         "11D20602": "삼척",
    "11B20503": "양평",           "11E00101": "울릉도",
    "11B20504": "하남",           "11E00102": "독도",
    "11B20601": "수원",
    "11B20602": "안양",           // 충청북도 (11C1)
    "11B20603": "오산",           "11C10101": "충주",
    "11B20604": "화성",           "11C10102": "진천",
    "11B20605": "성남",           "11C10103": "음성",
    "11B20606": "평택",           "11C10201": "제천",
    "11B20609": "의왕",           "11C10202": "단양",
    "11B20610": "군포",           "11C10301": "청주",
    "11B20611": "안성",           "11C10302": "보은",
    "11B20612": "용인",           "11C10303": "괴산",
    "11B20701": "이천",           "11C10304": "증평",
    "11B20702": "광주",           "11C10401": "추풍령",
    "11B20703": "여주",           "11C10402": "영동",
    "11A00101": "백령도",          "11C10403": "옥천",
    "11A00102": "연평도",
    "11A00103": "소청도",

    // 충청남도, 대전, 세종 (11C2) // 전북자치도 (11F1, 21F1)
    "11C20101": "서산",          "11F10201": "전주",
    "11C20102": "태안",          "11F10202": "익산",
    "11C20103": "당진",          "11F10203": "정읍",
    "11C20104": "홍성",          "11F10204": "완주",
    "11C20201": "보령",          "11F10301": "장수",
    "11C20202": "서천",          "11F10302": "무주",
    "11C20301": "천안",          "11F10303": "진안",
    "11C20302": "아산",          "11F10401": "남원",
    "11C20303": "예산",          "11F10402": "임실",
    "11C20401": "대전",          "11F10403": "순창",
    "11C20402": "공주",          "21F10501": "군산",
    "11C20403": "계룡",          "21F10502": "김제",
    "11C20404": "세종",          "21F10601": "고창",
    "11C20501": "부여",          "21F10602": "부안",
    "11C20502": "청양",
    "11C20601": "금산",
    "11C20602": "논산",

    // 광주, 전라남도 (11F2, 21F2)  // 대구, 경상북도 (11H1)
    "11F20501": "광주",            "11H10701": "대구",
    "11F20502": "장성",            "11H10702": "영천",
    "11F20503": "나주",            "11H10703": "경산",
    "11F20504": "담양",            "11H10704": "청도",
    "11F20505": "화순",            "11H10705": "칠곡",
    "11F20601": "구례",            "11H10707": "군위",
    "11F20602": "곡성",            "11H10101": "울진",
    "11F20603": "순천",            "11H10102": "영덕",
    "11F20301": "완도",            "11H10201": "포항",
    "11F20302": "해남",            "11H10202": "경주",
    "11F20303": "강진",            "11H10301": "문경",
    "11F20304": "장흥",            "11H10302": "상주",
    "11F20401": "여수",            "11H10303": "예천",
    "11F20402": "광양",            "11H10401": "영주",
    "11F20403": "고흥",            "11H10402": "봉화",
    "11F20404": "보성",            "11H10403": "영양",
    "11F20405": "순천",            "11H10501": "안동",
    "11F20701": "흑산도",          "11H10502": "의성",
    "21F20101": "함평",            "11H10503": "청송",
    "21F20102": "영광",            "11H10601": "김천",
    "21F20201": "진도",            "11H10602": "구미",
    "21F20202": "해남(화원)",       "11H10604": "고령",
    "21F20801": "목포",            "11H10605": "성주",
    "21F20802": "영암",
    "21F20803": "신안",
    "21F20804": "무안",

    // 부산, 울산, 경상남도 (11H2) // 제주도 (11G)
    "11H20201": "부산",          "11G00201": "제주시",
    "11H20101": "울산",          "11G00401": "서귀포시",
    "11H20102": "양산",          //"11G00000": "제주도",
    "11H20301": "창원",
    "11H20304": "김해",
    "11H20401": "통영",          // 주요 산악 지역 (필요시 사용)
    "11H20402": "사천",          "11B101P0": "북한산",
    "11H20403": "거제",          "11D001P0": "설악산",
    "11H20404": "고성",          "11D002P0": "오대산",
    "11H20405": "남해",          "11D003P0": "치악산",
    "11H20501": "함양",          "11C001P0": "계룡산",
    "11H20502": "거창",          "11F002P0": "지리산",
    "11H20503": "합천",          "11F004P0": "덕유산",
    "11H20601": "밀양",          "11F003P0": "내장산",
    "11H20602": "의령",          "11G001P1": "한라산(정상)",
    "11H20603": "함안",
    "11H20604": "창녕",
    "11H20701": "진주",
    "11H20702": "하동",
    "11H20703": "산청",

};



async function initWeather() {
    try {
        const response = await fetch('/main/weather/api');
        const rawData = await response.text();
        if (rawData && rawData.includes("#START")) {
            processWeatherLogic(rawData);
        }
    } catch (error) {
        console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
    }
}

function processWeatherLogic(rawData) {
    const lines = rawData.split("\n");
    const parsedData = [];
    const addedRegions = new Set();

    // 1차 파싱: 일단 데이터를 모두 수집
    lines.forEach((line) => {
        const row = line.trim();
        if (!row || row.startsWith("#")) return;
        const f = row.split(",");
        if (f.length >= 16) {
            const regionName = regionMap[f[0].trim()];
            if (regionName && !addedRegions.has(regionName) && f[4].trim() === "1") {
                parsedData.push({
                    region: regionName,
                    TA: parseFloat(f[12] || 0),
                    ST: parseInt(f[13] || 0),
                    SKY: f[14]?.trim() || "DB01",
                    PREP: f[15]?.trim() || "0",
                    WIND: parseFloat(f[10] || 0),
                    WIND_DIR: f[11]?.trim() || ""
                });
                addedRegions.add(regionName);
            }
        }
    });

    if (parsedData.length === 0) return;

    /// 1. 전국 평균값 산출
    const avg = {
        TA: parsedData.reduce((s, x) => s + x.TA, 0) / parsedData.length,
        ST: parsedData.reduce((s, x) => s + x.ST, 0) / parsedData.length,
        WIND: parsedData.reduce((s, x) => s + x.WIND, 0) / parsedData.length
    };

    // 2. 점수 계산 (중요: 객체로 반환받음)
    const scoredList = parsedData.map(item => {
        const result = calculateRelativeScore(item, avg);
        return {
            ...item,
            score: result.finalScore, // 렌더링용 점수 저장
            debug: result.debugInfo   // 로그용 데이터 저장
        };
    });

    // 3. 점수 순 정렬
    scoredList.sort((a, b) => b.score - a.score);

    // 4. [콘솔 출력] 상위 10위 상세 분석
    console.log("%c🏆 [해봄트립] 기상 데이터 기반 추천 순위 TOP 10 상세분석", "color: #f97316; font-weight: bold; font-size: 16px;");

    scoredList.slice(0, 10).forEach((item, index) => {
        const d = item.debug;
        console.group(`[${index + 1}위] ${item.region} (총점: ${item.score.toFixed(0)}점)`);

        // 상세 항목을 한눈에 볼 수 있도록 객체 구성
        console.table({
            "항목": {
                "기본점수": d.base,
                "계절특화": d.seasonal.toFixed(1),
                "하늘상태": d.sky,
                "강풍/섬": (d.wind + d.island).toFixed(1),
                "강수확률페널티": d.rainPenalty ? d.rainPenalty.toFixed(1) : 0,
                "강수필터(비/눈)": d.finalFilter
            }
        });

        // 계산식 가시화
        console.log(`%c👉 계산식: ${d.base} + ${d.seasonal.toFixed(1)}(계절) + ${d.sky}(하늘) + ${(d.wind + d.island).toFixed(1)}(풍속/섬) + ${d.rainPenalty ? d.rainPenalty.toFixed(1) : 0}(강수) + ${d.finalFilter}(필터) = ${item.score.toFixed(0)}점`, "color: #64748b; font-style: italic;");
        console.groupEnd();
    });

    // 5. 화면 렌더링 실행
    renderBestWeather(scoredList);
}

/**
 * [해봄트립 초정밀 계절 맞춤형 알고리즘]
 * 개별 지역의 점수와 계산 근거(logs)를 함께 반환합니다.
 */
function calculateRelativeScore(item, avg) {
    let score = 1000;
    const now = new Date();
    const month = now.getMonth() + 1;

    const temp = item.TA;
    const wind = item.WIND;
    const rainProb = item.ST;
    const region = item.region || "알 수 없는 지역";

    let logs = {
        region: region,
        base: 1000,
        seasonal: 0,
        sky: 0,
        wind: 0,
        island: 0,
        finalFilter: 0
    };

    // ① 체감 온도 계산
    let sensibleTemp = temp;
    if (temp <= 10) {
        sensibleTemp = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
    }

    // ② 계절별 특화 로직
    if (month >= 3 && month <= 5) {
        const springOpt = 20;
        logs.seasonal = (300 - Math.abs(sensibleTemp - springOpt) * 50);
        if (item.SKY === "DB01") logs.seasonal += 200;
    }
    else if (month >= 6 && month <= 8) {
        if (temp > 30) logs.seasonal -= (temp - 30) * 150;
        logs.seasonal += (avg.TA - temp) * 100;
        if (rainProb > 60) logs.seasonal -= 500;
    }
    else if (month >= 9 && month <= 11) {
        const fallOpt = 18;
        logs.seasonal = (300 - Math.abs(sensibleTemp - fallOpt) * 40);
        if (item.SKY === "DB01") logs.seasonal += 400;
    }
    else {
        logs.seasonal += (temp - avg.TA) * 80;
        if (item.PREP === "2" || item.PREP === "3") logs.seasonal += 500;
        if (sensibleTemp < -10) logs.seasonal -= 1000;
    }
    score += logs.seasonal;

    // ③ 하늘 상태 및 활동성
    const skyMap = { "DB01": 200, "DB03": 50, "DB04": -150 };
    logs.sky = (skyMap[item.SKY] || 0);
    score += logs.sky;

    // ④ 강풍 및 섬 지역 로직
    if (wind >= 7) {
        logs.wind = -1000;
        score += logs.wind;
    }
    const islandKeywords = ["제주", "독도", "백령", "울릉", "흑산", "추자"];
    if (islandKeywords.some(key => region.includes(key)) && wind >= 4 && wind < 7) {
        logs.island = 300;
        score += logs.island;
    }

    // ③ 강수 확률에 따른 페널티 계산 (새로 추가/보강)
    // 강수 확률이 높을수록 기하급수적으로 점수 차감 (0~100%)
    let rainPenalty = 0;
    if (rainProb > 0) {
        // 30% 이하에서는 약한 페널티, 30% 초과 시 강한 페널티 적용
        if (rainProb <= 30) {
            rainPenalty = rainProb * 5;
        } else {
            rainPenalty = 150 + (rainProb - 30) * 20;
        }
    }
    logs.rainPenalty = -rainPenalty;
    score -= rainPenalty;

    // ⑤ 최종 필터
    if (item.PREP === "1") {
        logs.finalFilter = -4000;
        score += logs.finalFilter;
    }

    return { finalScore: score, debugInfo: logs };
}

// [렌더링] Template 기반 화면 출력
function renderBestWeather(allRegions) {
    const weatherList = document.getElementById("weatherList");
    const template = document.getElementById("weather-card-template");
    if (!weatherList || !template) return;

    weatherList.innerHTML = ""; // 기존 내용 초기화

    const windDirMap = {"N":"북풍","NE":"북동풍","E":"동풍","SE":"남동풍","S":"남풍","SW":"남서풍","W":"서풍","NW":"북서풍"};
    const medals = ["🥇", "🥈", "🥉"];

    // 점수 높은 순으로 정렬 후 상위 3개 선정
    const best3 = allRegions.sort((a, b) => b.score - a.score).slice(0, 3);

    best3.forEach((data, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.weather-link-card');

        // 데이터 채우기
        clone.querySelector(".medal-slot").textContent = medals[index];
        clone.querySelector(".region-name").textContent = data.region;
        clone.querySelector(".temp-val").textContent = `${data.TA}°C`;
        clone.querySelector(".rain-val").textContent = `${data.ST}%`;

        // 클릭 시, 여행지 목록 페이지로 이동
        card.onclick = function() {
            // Thymeleaf 프로젝트의 기본 경로인 /trip/trip 으로 이동하며
            // 검색어 파라미터(searchWord)에 해당 지역명을 담아 보냅니다.
            const regionName = data.region;
            window.location.href = `/trip/trip?searchWord=${encodeURIComponent(regionName)}`;
        };

        const windDir = windDirMap[data.WIND_DIR.trim()] || data.WIND_DIR;
        clone.querySelector(".wind-val").textContent = `${windDir} ${data.WIND}m/s`;

        // 날씨 상태에 따른 아이콘 결정
        let iconName = "sun";
        if (data.PREP !== "0") iconName = "cloud-rain";
        else if (data.SKY === "DB03" || data.SKY === "DB04") iconName = "cloud";

        const iconEl = clone.querySelector(".weather-icon");
        iconEl.setAttribute("data-lucide", iconName);

        weatherList.appendChild(clone);
    });

    // 동적 생성된 아이콘 렌더링
    if (typeof lucide !== "undefined") lucide.createIcons();
}