// Medical Guide Logic (서버 페이징)

// --- Constants ---
const ITEMS_PER_PAGE = 5;

// --- 시간 포맷 (800 → 8:00, 1830 → 18:30) ---
function formatTime(val) {
    if (!val || val === 'null') return '';
    const str = String(val).padStart(4, '0');
    return str.slice(0, -2) + ':' + str.slice(-2);
}

// --- 전화번호 포맷 (222607114 → 02-2260-7114) ---
function formatPhone(val) {
    if (!val) return '';
    const str = String(val).replace(/\s/g, '').replace(/\)/g, '-').replace(/\(/g, '');
    if (str.includes('-')) return str;

    if (str.startsWith('02')) {
        if (str.length === 10) return str.slice(0, 2) + '-' + str.slice(2, 6) + '-' + str.slice(6);
        if (str.length === 9) return str.slice(0, 2) + '-' + str.slice(2, 5) + '-' + str.slice(5);
    }
    if (str.startsWith('0')) {
        if (str.length === 11) return str.slice(0, 3) + '-' + str.slice(3, 7) + '-' + str.slice(7);
        if (str.length === 10) return str.slice(0, 3) + '-' + str.slice(3, 6) + '-' + str.slice(6);
    }
    if (str.startsWith('1') && str.length === 8) {
        return str.slice(0, 4) + '-' + str.slice(4);
    }
    if (!str.startsWith('0') && !str.startsWith('1')) {
        return formatPhone('0' + str);
    }
    return str;
}

// --- DB 데이터를 공통 형태로 변환 ---
function convertHospital(h) {
    const tags = [];
    if (h.hpEmrmYn === '1') tags.push('응급실운영');
    if (h.hpWkndOpenYn === 'Y') tags.push('주말진료');
    return {
        id: h.hpNo, type: 'hospital', name: h.hpNm,
        address: (h.hpAddr || '').replace(/,\s*$/, ''),
        phone: formatPhone(h.hpTelno1),
        openTime: (h.hpOpTm && h.hpOpTm !== 'null' && h.hpEndTm && h.hpEndTm !== 'null') ? formatTime(h.hpOpTm) + ' - ' + formatTime(h.hpEndTm) : '',
        tags: tags
    };
}

function convertDrug(d) {
    const tags = [];
    if (d.dsWkndOpenYn === 'Y') tags.push('주말운영');
    return {
        id: d.dsNo, type: 'pharmacy', name: d.dsNm,
        address: (d.dsAddr || '').replace(/,\s*$/, ''),
        phone: formatPhone(d.dsTelno),
        openTime: (d.dsOpTm && d.dsOpTm !== 'null' && d.dsEndTm && d.dsEndTm !== 'null') ? formatTime(d.dsOpTm) + ' - ' + formatTime(d.dsEndTm) : '',
        tags: tags
    };
}

// --- State ---
let currentTab = 'hospital';
let currentRegion = '전체';
let searchQuery = '';
let currentPage = 1;
let totalCnt = 0;

// --- 서버에서 데이터 fetch ---
async function fetchData() {
    const apiUrl = currentTab === 'hospital' ? '/medical/api/hospitals' : '/medical/api/drugs';
    const params = new URLSearchParams({
        pageNo: currentPage,
        pageSize: ITEMS_PER_PAGE
    });

    if (currentRegion && currentRegion !== '전체') {
        params.append('region', currentRegion);
    }
    if (searchQuery) {
        params.append('searchWord', searchQuery);
    }

    const res = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await res.json();

    totalCnt = (data.length > 0) ? data[0].totalCnt : 0;

    const converter = currentTab === 'hospital' ? convertHospital : convertDrug;
    return data.map(converter);
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    updateRegionVisual();
    loadAndRender();
    initSearch();
    updateTabVisual();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function loadAndRender() {
    const container = document.getElementById('medical-list');
    container.innerHTML = '<div class="text-center p-4"><span class="text-secondary">로딩 중...</span></div>';

    const items = await fetchData();
    renderItems(items);
}

// --- Event Handlers ---
async function switchTab(tab) {
    if (currentTab === tab) return;
    currentTab = tab;
    currentPage = 1;
    updateTabVisual();
    await loadAndRender();
}

function selectRegion(region) {
    currentRegion = region;
    currentPage = 1;
    updateRegionVisual();
    loadAndRender();
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
            loadAndRender();
        }, 300);
    });
}

function setPage(page) {
    if (page < 1) return;
    currentPage = page;
    loadAndRender();

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

function renderItems(pageData) {
    const container = document.getElementById('medical-list');
    const paginationContainer = document.getElementById('pagination');

    const totalPages = Math.ceil(totalCnt / ITEMS_PER_PAGE);

    if (totalCnt === 0) {
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
                    ${item.openTime ? `<span class="info-item-pill">
                        <i data-lucide="clock" size="14"></i> ${item.openTime}
                    </span>` : ''}
                    ${item.phone ? `<span class="info-item-pill">
                        <i data-lucide="phone" size="14"></i> ${item.phone}
                    </span>` : ''}
                </div>
            </div>

            <div class="text-secondary">
                <i data-lucide="chevron-right" size="24"></i>
            </div>
        </a>
    `).join('');

    // Pagination
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
