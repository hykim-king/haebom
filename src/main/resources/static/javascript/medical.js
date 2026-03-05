// Medical Guide Logic

// --- Constants ---
const ITEMS_PER_PAGE = 5;
const REGIONS = ['전체', '서울', '경기', '인천', '강원', '제주', '부산', '대구', '광주', '대전', '울산', '세종', '충북', '충남', '전북', '전남', '경북', '경남'];

// --- 시간 포맷 (800 → 8:00, 1830 → 18:30) ---
function formatTime(val) {
    if (!val) return '';
    const str = String(val).padStart(4, '0');
    return str.slice(0, -2) + ':' + str.slice(-2);
}

// --- 전화번호 포맷 (222607114 → 02-2260-7114) ---
function formatPhone(val) {
    if (!val) return '';
    const str = String(val).replace(/\s/g, '').replace(/\)/g, '-').replace(/\(/g, '');
    if (str.includes('-')) return str;

    // 02로 시작 (서울)
    if (str.startsWith('02')) {
        if (str.length === 10) return str.slice(0, 2) + '-' + str.slice(2, 6) + '-' + str.slice(6);
        if (str.length === 9) return str.slice(0, 2) + '-' + str.slice(2, 5) + '-' + str.slice(5);
    }
    // 0으로 시작 (지역번호, 휴대폰)
    if (str.startsWith('0')) {
        if (str.length === 11) return str.slice(0, 3) + '-' + str.slice(3, 7) + '-' + str.slice(7);
        if (str.length === 10) return str.slice(0, 3) + '-' + str.slice(3, 6) + '-' + str.slice(6);
    }
    // 1로 시작 (대표번호 1577, 1588 등)
    if (str.startsWith('1') && str.length === 8) {
        return str.slice(0, 4) + '-' + str.slice(4);
    }
    // 앞의 0이 빠진 경우 → 0 붙여서 재귀 처리
    if (!str.startsWith('0') && !str.startsWith('1')) {
        return formatPhone('0' + str);
    }
    return str;
}

// --- DB 데이터를 공통 형태로 변환 ---
function convertHospitals(data) {
    return data.map(h => {
        const tags = [];
        if (h.hpEmrmYn === '1') tags.push('응급실운영');
        if (h.hpWkndOpenYn === 'Y') tags.push('주말진료');

        return {
            id: h.hpNo,
            type: 'hospital',
            name: h.hpNm,
            address: (h.hpAddr || '').replace(/,\s*$/, ''),
            phone: formatPhone(h.hpTelno1),
            openTime: formatTime(h.hpOpTm) + ' - ' + formatTime(h.hpEndTm),
            tags: tags
        };
    });
}

function convertDrugs(data) {
    return data.map(d => {
        const tags = [];
        if (d.dsWkndOpenYn === 'Y') tags.push('주말운영');

        return {
            id: d.dsNo,
            type: 'pharmacy',
            name: d.dsNm,
            address: (d.dsAddr || '').replace(/,\s*$/, ''),
            phone: formatPhone(d.dsTelno),
            openTime: formatTime(d.dsOpTm) + ' - ' + formatTime(d.dsEndTm),
            tags: tags
        };
    });
}

// 병원 데이터는 인라인으로 즉시 로딩
const HOSPITAL_DATA = convertHospitals(typeof hospitalData !== 'undefined' ? hospitalData : []);

// 약국 데이터는 탭 클릭 시 fetch로 로딩 (캐싱)
let DRUG_DATA = null;

async function loadDrugData() {
    if (DRUG_DATA !== null) return DRUG_DATA;
    const res = await fetch('/medical/api/drugs');
    const data = await res.json();
    DRUG_DATA = convertDrugs(data);
    return DRUG_DATA;
}

function getCurrentData() {
    return currentTab === 'hospital' ? HOSPITAL_DATA : (DRUG_DATA || []);
}

// --- 지역 약칭 → 주소에 포함된 실제 명칭 매핑 ---
const REGION_MAP = {
    '서울': '서울', '경기': '경기', '인천': '인천', '강원': '강원',
    '제주': '제주', '부산': '부산', '대구': '대구', '광주': '광주',
    '대전': '대전', '울산': '울산', '세종': '세종',
    '충북': '충청북도', '충남': '충청남도',
    '전북': '전라북도', '전남': '전라남도',
    '경북': '경상북도', '경남': '경상남도'
};

// --- 주소에서 지역 추출 ---
function getRegion(address) {
    for (const [shortName, fullName] of Object.entries(REGION_MAP)) {
        if (address.includes(fullName)) return shortName;
    }
    return '';
}

// --- State ---
let currentTab = 'hospital';
let currentRegion = '전체';
let searchQuery = '';
let currentPage = 1;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    updateRegionVisual();
    renderList();
    initSearch();
    updateTabVisual();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- Event Handlers ---
async function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;
    currentPage = 1;
    updateTabVisual();

    if (tab === 'pharmacy') {
        await loadDrugData();
    }
    renderList();
}

function selectRegion(region) {
    currentRegion = region;
    currentPage = 1;
    updateRegionVisual();
    renderList();
}

function updateRegionVisual() {
    const buttons = document.querySelectorAll('.region-btn');
    buttons.forEach(btn => {
        if (btn.textContent.trim() === currentRegion) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    let timeout = null;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            renderList();
        }, 300);
    });
}

function setPage(page) {
    if (page < 1) return;
    currentPage = page;
    renderList();

    const listTop = document.getElementById('medical-list').offsetTop - 100;
    window.scrollTo({ top: listTop, behavior: 'smooth' });
}

// --- Rendering ---
function updateTabVisual() {
    const tabHospital = document.getElementById('tab-hospital');
    const tabPharmacy = document.getElementById('tab-pharmacy');

    if (currentTab === 'hospital') {
        tabHospital.classList.add('active');
        tabPharmacy.classList.remove('active');
    } else {
        tabPharmacy.classList.add('active');
        tabHospital.classList.remove('active');
    }
}

function renderRegions() {
    const list = document.getElementById('region-list');
    if (!list) return;

    list.innerHTML = REGIONS.map(region => `
        <button
            onclick="selectRegion('${region}')"
            class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                region === currentRegion
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }"
        >
            ${region}
        </button>
    `).join('');
}

function renderList() {
    const container = document.getElementById('medical-list');
    const paginationContainer = document.getElementById('pagination');

    // 1. Filter Data
    let filtered = getCurrentData();

    if (currentRegion !== '전체') {
        filtered = filtered.filter(item => getRegion(item.address) === currentRegion);
    }

    if (searchQuery) {
        filtered = filtered.filter(item =>
            item.name.includes(searchQuery) || item.address.includes(searchQuery)
        );
    }

    // 2. Pagination Logic
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (totalPages === 0) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = filtered.slice(start, end);

    // 3. Render Items
    if (totalItems === 0) {
        container.innerHTML = `
            <div class="text-center p-5 bg-white rounded-4 border">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3" style="width:64px;height:64px;">
                    <i data-lucide="search-x" size="32" class="text-secondary"></i>
                </div>
                <p class="text-secondary fw-medium mb-0">검색 결과가 없습니다.</p>
            </div>
        `;
        paginationContainer.innerHTML = '';
        lucide.createIcons();
        return;
    }

    const detailUrl = currentTab === 'hospital' ? '/medical/hospital_detail' : '/medical/drug_detail';

    container.innerHTML = pageData.map(item => `
        <a class="info-card d-flex align-items-center justify-content-between" href="${detailUrl}?id=${item.id}">
            <div class="flex-grow-1 overflow-hidden me-3">
                <h3 class="fw-bold fs-5 mb-1 text-truncate">${item.name}</h3>
                <p class="small text-secondary text-truncate mb-2">${item.address}</p>

                <div class="d-flex flex-wrap gap-1 mb-3">
                    ${item.tags.map(tag => {
                        const isHighlight = tag === '응급실운영' || tag === '주말진료' || tag === '주말운영';
                        return `<span class="tag ${isHighlight ? 'tag-orange' : ''}">#${tag}</span>`;
                    }).join('')}
                </div>

                <div class="card-footer-info">
                    <span class="info-item-pill">
                        <i data-lucide="clock" size="14"></i> ${item.openTime}
                    </span>
                    <span class="info-item-pill">
                        <i data-lucide="phone" size="14"></i> ${item.phone}
                    </span>
                </div>
            </div>

            <div class="text-secondary">
                <i data-lucide="chevron-right" size="24"></i>
            </div>
        </a>
    `).join('');

    // 4. Render Pagination Controls
    if (totalPages > 1) {
        let paginationHTML = '';

        paginationHTML += `
            <button onclick="setPage(${currentPage - 1})" class="page-btn arrow-btn" ${currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" size="18"></i>
            </button>
        `;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button onclick="setPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button onclick="setPage(${currentPage + 1})" class="page-btn arrow-btn" ${currentPage === totalPages ? 'disabled' : ''}>
                <i data-lucide="chevron-right" size="18"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    } else {
        paginationContainer.innerHTML = '';
    }

    lucide.createIcons();
}

// Global scope
window.switchTab = switchTab;
window.selectRegion = selectRegion;
window.setPage = setPage;