// Medical Guide Logic

// --- Constants ---
const ITEMS_PER_PAGE = 5;

// --- Mock Data Generator ---
// Helper to generate dummy data
const REGIONS = ['전체', '서울', '경기', '인천', '강원', '제주', '부산', '대구', '광주', '대전'];
const NAMES_HOSPITAL = ['서울대학교병원', '세브란스병원', '아산병원', '삼성서울병원', '성모병원', '밝은안과', '튼튼정형외과', '서울내과', '우리소아과', '굿모닝병원'];
const NAMES_PHARMACY = ['온누리약국', '종로약국', '행복약국', '건강약국', '세브란스약국', '대학약국', '메디칼약국', '옵티마약국', '백세약국', '푸른약국'];

// Tags Pool
const TAGS_HOSPITAL = ['응급실운영', '야간진료', '건강검진', '연중무휴', '주차가능', '입원실', '물리치료', '소아진료'];
const TAGS_PHARMACY = ['연중무휴', '심야약국', '처방조제', '상비약'];

const getRandomTags = (type) => {
    const pool = type === 'hospital' ? TAGS_HOSPITAL : TAGS_PHARMACY;
    // Shuffle and pick 1~3 tags
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
};

const generateData = (type, count) => {
    return Array.from({ length: count }, (_, i) => {
        const region = REGIONS[Math.floor(Math.random() * (REGIONS.length - 1)) + 1];
        const nameList = type === 'hospital' ? NAMES_HOSPITAL : NAMES_PHARMACY;
        const name = `${region} ${nameList[i % nameList.length]} ${Math.floor(i/10) + 1}호점`;
        
        return {
            id: `${type}-${i}`,
            type: type, // 'hospital' or 'pharmacy'
            name: name,
            region: region,
            address: `${region} 어딘가로 ${Math.floor(Math.random() * 900) + 100}번길 ${i + 1}`,
            phone: `02-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            status: Math.random() > 0.3 ? 'OPEN' : 'CLOSED', // 70% chance open
            openTime: '09:00 - 18:00',
            tags: getRandomTags(type)
        };
    });
};

const MOCK_DATA = [
    ...generateData('hospital', 50),
    ...generateData('pharmacy', 50)
];

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
    renderRegions();
    renderList(); // Initial render
    initSearch(); // Bind search events
    
    // Tab initial state visual
    updateTabVisual();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- Event Handlers ---
function switchTab(tab) {
    if (currentTab === tab) return;
    
    currentTab = tab;
    currentPage = 1; // Reset page
    updateTabVisual();
    renderList();
}

function selectRegion(region) {
    currentRegion = region;
    currentPage = 1; // Reset page
    renderRegions(); // Update active state of buttons
    renderList();
}

function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    // Debounce search input
    let timeout = null;
    input.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentPage = 1; // Reset page
            renderList();
        }, 300);
    });
}

function setPage(page) {
    if (page < 1) return;
    currentPage = page;
    renderList();
    
    // Scroll to top of list smoothly
    const listTop = document.getElementById('medical-list').offsetTop - 100;
    window.scrollTo({ top: listTop, behavior: 'smooth' });
}

// --- Rendering ---
function updateTabVisual() {
    const indicator = document.getElementById('tab-indicator');
    const tabHospital = document.getElementById('tab-hospital');
    const tabPharmacy = document.getElementById('tab-pharmacy');
    
    if (currentTab === 'hospital') {
        indicator.style.transform = 'translateX(0)';
        tabHospital.classList.remove('text-slate-500');
        tabHospital.classList.add('text-slate-700');
        tabPharmacy.classList.remove('text-slate-700');
        tabPharmacy.classList.add('text-slate-500');
    } else {
        indicator.style.left = '4px'; 
        indicator.style.transform = 'translateX(100%)';
        
        tabPharmacy.classList.remove('text-slate-500');
        tabPharmacy.classList.add('text-slate-700');
        tabHospital.classList.remove('text-slate-700');
        tabHospital.classList.add('text-slate-500');
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
    let filtered = MOCK_DATA.filter(item => item.type === currentTab);
    
    if (currentRegion !== '전체') {
        filtered = filtered.filter(item => item.region === currentRegion);
    }

    if (searchQuery) {
        filtered = filtered.filter(item => 
            item.name.includes(searchQuery) || item.address.includes(searchQuery)
        );
    }

    // 2. Pagination Logic
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Adjust current page if out of bounds
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (totalPages === 0) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = filtered.slice(start, end);

    // 3. Render Items
    if (totalItems === 0) {
        container.innerHTML = `
            <div class="bg-white p-12 rounded-2xl text-center border border-slate-100">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                    <i data-lucide="search-x" class="w-8 h-8 text-slate-300"></i>
                </div>
                <p class="text-slate-500 font-medium">검색 결과가 없습니다.</p>
            </div>
        `;
        paginationContainer.innerHTML = ''; // Hide pagination
        lucide.createIcons();
        return;
    }

    container.innerHTML = pageData.map(item => `
        <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-orange-200 transition-colors cursor-pointer group" onclick="location.href='medical-detail.html?id=${item.id}'">
            <div class="flex-1 min-w-0 pr-4">
                <div class="flex items-center gap-2 mb-1">
                    <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        item.status === 'OPEN' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-slate-100 text-slate-500'
                    }">
                        ${item.status === 'OPEN' ? '진료중' : '진료종료'}
                    </span>
                    <h3 class="font-bold text-lg text-slate-900 truncate group-hover:text-orange-600 transition-colors">${item.name}</h3>
                </div>
                
                <p class="text-sm text-slate-500 truncate mb-2">${item.address}</p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1 mb-3">
                    ${item.tags.map(tag => {
                        // Highlight specific tags
                        const isHighlight = tag === '응급실운영' || tag === '야간진료' || tag === '심야약국';
                        return `<span class="px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                            isHighlight 
                            ? 'bg-orange-50 text-orange-600 border-orange-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }">#${tag}</span>`;
                    }).join('')}
                </div>
                
                <div class="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-50 pt-3 mt-1">
                    <span class="flex items-center gap-1">
                        <i data-lucide="clock" class="w-3 h-3"></i> ${item.openTime}
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="phone" class="w-3 h-3"></i> ${item.phone}
                    </span>
                </div>
            </div>
            
            <div class="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all pl-2">
                <i data-lucide="chevron-right" class="w-6 h-6"></i>
            </div>
        </div>
    `).join('');

    // 4. Render Pagination Controls
    if (totalPages > 1) {
        let paginationHTML = '';
        
        // Prev Button
        paginationHTML += `
            <button 
                onclick="setPage(${currentPage - 1})" 
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                ${currentPage === 1 ? 'disabled' : ''}
            >
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
        `;

        // Page Numbers logic
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button 
                    onclick="setPage(${i})" 
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        i === currentPage 
                        ? 'bg-orange-600 text-white border border-orange-600' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }"
                >
                    ${i}
                </button>
            `;
        }

        // Next Button
        paginationHTML += `
            <button 
                onclick="setPage(${currentPage + 1})" 
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none"
                ${currentPage === totalPages ? 'disabled' : ''}
            >
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
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