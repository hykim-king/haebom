// Culture List Logic

// --- Data ---
const REGIONS = ['전체', '서울', '경기', '인천', '강원', '제주', '부산', '대구', '광주', '대전'];

const MOCK_CULTURE_DATA = [
    {
        id: 1,
        name: '국립현대미술관 서울',
        region: '서울',
        category: '미술관',
        address: '서울특별시 종로구 삼청로 30',
        image: 'https://images.unsplash.com/photo-1720270241567-a21eda1d5fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMG11c2V1bSUyMGFydCUyMGdhbGxlcnklMjBleHRlcmlvciUyMGFyY2hpdGVjdHVyZSUyMG1vZGVybnxlbnwxfHx8fDE3NzA4MDc0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        desc: '동시대 미술의 흐름을 보여주는 한국의 대표 미술관입니다. 다양한 기획전과 상설전이 열립니다.'
    },
    {
        id: 2,
        name: '경복궁',
        region: '서울',
        category: '궁궐/유적',
        address: '서울특별시 종로구 사직로 161',
        image: 'https://images.unsplash.com/photo-1712617130426-ecdb768997b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMHBhbGFjZSUyMHRyYWRpdGlvbmFsJTIwYnVpbGRpbmclMjBzcHJpbmclMjBmbG93ZXJzfGVufDF8fHx8MTc3MDgwNzQ4NHww&ixlib=rb-4.1.0&q=80&w=1080',
        desc: '조선 왕조 제일의 법궁으로, 사계절 아름다운 풍경을 자랑하는 역사적인 장소입니다.'
    },
    {
        id: 3,
        name: '부산시립미술관',
        region: '부산',
        category: '미술관',
        address: '부산광역시 해운대구 APEC로 58',
        image: 'https://images.unsplash.com/photo-1768726455737-3e55a8268bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwaW50ZXJpb3IlMjBleGhpYml0aW9uJTIwY2xlYW4lMjBtaW5pbWFsfGVufDF8fHx8MTc3MDgwNzQ4OHww&ixlib=rb-4.1.0&q=80&w=1080',
        desc: '부산의 현대미술을 조명하고 시민들에게 다양한 문화 체험 기회를 제공합니다.'
    },
    {
        id: 4,
        name: '아르떼뮤지엄 강릉',
        region: '강원',
        category: '전시관',
        address: '강원도 강릉시 난설헌로 131',
        image: 'https://images.unsplash.com/photo-1497211419994-142331908abd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '몰입형 미디어아트 상설 전시관으로, 빛과 소리가 만들어내는 환상적인 경험을 선사합니다.'
    },
    {
        id: 5,
        name: '제주도립미술관',
        region: '제주',
        category: '미술관',
        address: '제주특별자치도 제주시 1100로 2894-78',
        image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '제주의 자연과 예술이 어우러진 공간에서 특별한 휴식을 즐겨보세요.'
    },
    {
        id: 6,
        name: '국립경주박물관',
        region: '경북',
        category: '박물관',
        address: '경상북도 경주시 일정로 186',
        image: 'https://images.unsplash.com/photo-1590423011388-755e10dc9725?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '신라 천년의 역사와 문화를 한눈에 볼 수 있는 한국의 대표적인 박물관입니다.'
    }
];

// --- State ---
let currentRegion = '전체';

// --- Functions ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    renderRegions();
    renderList();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderRegions() {
    const list = document.getElementById('region-list');
    list.innerHTML = REGIONS.map(region => `
        <button 
            onclick="selectRegion('${region}')" 
            class="region-btn ${region === currentRegion ? 'active' : ''}"
        >
            ${region}
        </button>
    `).join('');
}

function selectRegion(region) {
    currentRegion = region;
    renderRegions();
    renderList();
}

function renderList() {
    const grid = document.getElementById('culture-grid');
    
    // Filter
    const filtered = currentRegion === '전체' 
        ? MOCK_CULTURE_DATA 
        : MOCK_CULTURE_DATA.filter(item => item.region === currentRegion);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                    <i data-lucide="image-off" class="w-8 h-8 text-slate-300"></i>
                </div>
                <p class="text-slate-500 font-medium">해당 지역의 문화시설 정보가 없습니다.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = filtered.map((item, index) => `
        <a href="culture-detail.html?id=${item.id}" class="culture-card animate-fade-up" style="animation-delay: ${index * 100}ms">
            <div class="culture-img-wrapper">
                <img src="${item.image}" alt="${item.name}">
                <span class="category-badge">${item.category}</span>
            </div>
            <div class="card-content">
                <div class="mb-auto">
                    <h3 class="text-xl font-bold text-slate-900 mb-2 truncate">${item.name}</h3>
                    <p class="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                        ${item.desc}
                    </p>
                </div>
                <div class="flex items-center text-xs text-slate-400 border-t border-slate-100 pt-3 mt-2">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1"></i>
                    <span class="truncate">${item.address}</span>
                </div>
            </div>
        </a>
    `).join('');

    lucide.createIcons();
}

// Global scope for onclick
window.selectRegion = selectRegion;