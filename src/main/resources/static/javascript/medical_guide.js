/* medical_guide.js */

// [데이터] 병원/약국 데이터 (나중에 API로 대체 가능)
const data = {
    hospital: [
        {
            name: "서울대학교병원",
            address: "서울특별시 종로구 대학로 101",
            status: "진료중",
            tags: ["응급실운영", "연중무휴", "건강검진", "소아진료"],
            time: "09:00 - 18:00",
            phone: "1588-5700"
        },
        {
            name: "서울 세브란스병원 2호점",
            address: "서울특별시 서대문구 연세로 50",
            status: "진료중",
            tags: ["건강검진", "응급실운영"],
            time: "09:00 - 18:00",
            phone: "02-4389-3236"
        }
    ],
    pharmacy: [
        {
            name: "서울 온누리약국 2호점",
            address: "서울특별시 강남구 테헤란로 898",
            status: "진료중",
            tags: ["연중무휴", "상비약"],
            time: "09:00 - 22:00",
            phone: "02-5890-9852"
        }
    ]
};

let currentTab = 'hospital';

// [기능] 탭 전환
function switchTab(type, element) {
    currentTab = type;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderList();
}

// [기능] 지역 선택
function selectRegion(region, element) {
    document.querySelectorAll('.region-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    // 실제 지역 필터링 로직 추가 가능
}

// [기능] 태그에 따른 CSS 클래스 반환
function getTagClass(tagText) {
    if (tagText.includes('응급')) return 'tag-emergency';
    if (tagText.includes('연중') || tagText.includes('24시간')) return 'tag-allday';
    if (tagText.includes('검진')) return 'tag-checkup';
    return 'tag-orange';
}

// [기능] 리스트 렌더링
function renderList() {
    const listContainer = document.getElementById('result-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const items = data[currentTab];

    items.forEach(item => {
        const statusClass = item.status === '진료중' ? 'status-on' : 'status-off';
        const tagsHtml = item.tags.map(tag => `<span class="tag ${getTagClass(tag)}">${tag}</span>`).join('');

        const cardHtml = `
            <a href="MedicalGuideDetail.html" class="info-card">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="d-flex align-items-center mb-1">
                    <span class="status-badge ${statusClass}">${item.status}</span>
                    <h5 class="mb-0 fw-bold">${item.name}</h5>
                  </div>
                  <p class="text-secondary small mb-0">${item.address}</p>
                  <div class="tags-container">${tagsHtml}</div>
                </div>
                <div class="text-muted"><i data-lucide="chevron-right"></i></div>
              </div>
              <div class="card-footer-info">
                <div class="info-item-pill">
                    <i data-lucide="clock" size="14"></i>
                    <span>운영 <b>${item.time}</b></span>
                </div>
                <div class="info-item-pill">
                    <i data-lucide="phone" size="14"></i>
                    <b>${item.phone}</b>
                </div>
              </div>
            </a>`;
        listContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    // 아이콘 다시 렌더링 (Lucide 사용 시 필수)
    if (window.lucide) {
        lucide.createIcons();
    }
}