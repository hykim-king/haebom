// 1. 데이터 설정
const regionGroups = {
    '서울': ['강남구', '동대문구', '마포구', '종로구'],
    '부산': ['해운대구', '수영구'],
    '대구': ['중구', '수성구'],
    '인천': ['계양구', '부평구'],
    '광주': [], '대전': [], '울산': [], '세종': [],
};

const themes = ['레포츠', '문화시설', '자연', '역사', '관광지', '체험', '숙박', '음식', '쇼핑'];

const weatherData = {
    "전체": { temp: "-", status: "-", wind: "-", dust: "데이터 없음", dustColor: "bg-gray-300" },
    "서울": { temp: "24", status: "맑음", wind: "2.1", dust: "보통", dustColor: "bg-green-500" },
    "부산": { temp: "26", status: "흐림", wind: "4.5", dust: "좋음", dustColor: "bg-blue-500" },
    "광주": { temp: "25", status: "맑음", wind: "1.5", dust: "보통", dustColor: "bg-green-500" },
    "대전": { temp: "23", status: "구름많음", wind: "2.0", dust: "좋음", dustColor: "bg-blue-500" },
    "인천": { temp: "22", status: "맑음", wind: "3.2", dust: "나쁨", dustColor: "bg-red-500" },
    "세종": { temp: "23", status: "맑음", wind: "1.1", dust: "보통", dustColor: "bg-green-500" },
    "대구": { temp: "28", status: "맑음", wind: "1.2", dust: "보통", dustColor: "bg-green-500" },
    "울산": { temp: "24", status: "흐림", wind: "5.1", dust: "좋음", dustColor: "bg-blue-500" }
};

const mockDestinations = [
    {
        id: 1, title: "비토해양낚시공원", region: "경남", subRegion: "사천시", theme: "관광지",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        summary: "별주부전 전설을 간직한 사천의 명소",
        description: "비토해양낚시공원은 천혜의 자연경관과 전설이 살아있는 비토섬에 위치하고 있습니다. 낚시 애호가뿐만 아니라 가족 단위 관광객들에게도 인기가 높습니다.",
        likes: 6, views: '2.4K', address: "경남 사천시 서포면 비토길 49", phone: "055-833-0259"
    },
    {
        id: 2, title: "별마당 도서관", region: "서울", subRegion: "강남구", theme: "문화시설",
        image: "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?w=800",
        summary: "코엑스 몰 중심의 열린 문화 공간",
        description: "책과 문화가 어우러진 서울의 랜드마크 도서관입니다. 거대한 서가와 아늑한 조명이 만들어내는 분위기가 일품입니다.",
        likes: 12, views: '1.5K', address: "서울 강남구 영동대로 513", phone: "02-6002-3031"
    },
    {
        id: 3, title: "육전식당 1호점", region: "서울", subRegion: "동대문구", theme: "음식",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
        summary: "두툼한 목살과 삼겹살 명소",
        description: "전문적인 그릴러가 직접 고기를 구워줍니다. 고기 본연의 맛을 느낄 수 있는 서울의 줄 서는 맛집입니다.",
        likes: 45, views: '5.2K', address: "서울 동대문구 난계로30길 16", phone: "02-2253-6373"
    }
];

let state = {
    mainRegion: '전체',
    subRegion: '전체',
    theme: '전체',
    searchQuery: '',
    comments: JSON.parse(localStorage.getItem('trip_comments')) || {},
    likedItems: JSON.parse(localStorage.getItem('trip_likes')) || []
};

/**
 * 2. 초기화 함수
 */
function init() {
    const isDetailPage = document.getElementById('d-image');

    if (isDetailPage) {
        initDetailPage();
    } else {
        if (document.getElementById('dest-list')) {
            renderMainTags();
            renderSubTags();
            renderThemeTags();
            renderList();
            updateWeatherUI('전체');
        }
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * 3. 목록 페이지 전용 함수들
 */
function renderMainTags() {
    const el = document.getElementById('main-region-tags');
    if (!el) return;
    el.innerHTML = ['전체', ...Object.keys(regionGroups)].map(reg => `
        <button onclick="setMainRegion('${reg}')" class="px-2 py-1 text-sm text-gray-400 font-bold ${state.mainRegion === reg ? 'text-orange-600 border-b-2 border-orange-500' : ''}">#${reg}</button>
    `).join('');
}

function renderSubTags() {
    const container = document.getElementById('sub-region-tags');
    if (!container) return;
    if (state.mainRegion === '전체') { container.innerHTML = ''; return; }
    container.innerHTML = ['전체', ...regionGroups[state.mainRegion]].map(sub => `
        <button onclick="setSubRegion('${sub}')" class="text-sm ${state.subRegion === sub ? 'font-bold text-gray-900' : 'text-gray-400'}">${sub}</button>
    `).join('');
}

function renderThemeTags() {
    const el = document.getElementById('theme-tags');
    if (!el) return;
    el.innerHTML = themes.map(t => `
        <button onclick="setTheme('${t}')" class="text-sm hover:text-black ${state.theme === t ? 'font-bold text-orange-500' : 'text-gray-400'}">#${t}</button>
    `).join('');
}

function renderList() {
    const listEl = document.getElementById('dest-list');
    if (!listEl) return;

    const filtered = mockDestinations.filter(d =>
        (state.mainRegion === '전체' || d.region === state.mainRegion) &&
        (state.subRegion === '전체' || d.subRegion === state.subRegion) &&
        (state.theme === '전체' || d.theme === state.theme) &&
        (d.title.includes(state.searchQuery))
    );

    const countEl = document.getElementById('total-count');
    if (countEl) countEl.innerText = filtered.length;

    listEl.innerHTML = filtered.map(d => `
        <div class="flex flex-col md:flex-row gap-8 cursor-pointer group border-b pb-8" onclick="location.href='trip_detail.html?id=${d.id}'">
            <div class="w-full md:w-64 h-44 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                <img src="${d.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-bold mb-1 group-hover:text-orange-600 transition-colors">${d.title}</h3>
                    <span class="text-xs text-gray-400 mt-2">${d.region} ${d.subRegion}</span>
                </div>
                <div class="mb-3">
                    <span class="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">${d.theme}</span>
                </div>
                <p class="text-gray-600 line-clamp-2 text-sm leading-relaxed">${d.summary}</p>
            </div>
        </div>`).join('');
}

window.setMainRegion = function (reg) {
    state.mainRegion = reg; state.subRegion = '전체';
    renderMainTags(); renderSubTags(); renderList(); updateWeatherUI(reg);
};
window.setSubRegion = function (sub) { state.subRegion = sub; renderSubTags(); renderList(); };
window.setTheme = function (t) { state.theme = (state.theme === t) ? '전체' : t; renderThemeTags(); renderList(); };

function updateWeatherUI(regionName) {
    const data = weatherData[regionName] || weatherData['전체'];
    const nameEl = document.getElementById("selected-region-name");
    if (nameEl) nameEl.innerText = regionName === '전체' ? '전국' : regionName;
    const tempEl = document.getElementById("weather-temp");
    if (tempEl) tempEl.innerText = data.temp === '-' ? '-' : `${data.temp} ℃`;
    const dustEl = document.getElementById("weather-dust");
    if (dustEl) {
        dustEl.innerText = data.dust;
        dustEl.className = `px-2 py-0.5 rounded-full text-[10px] text-white ${data.dustColor}`;
    }
}

/**
 * 4. 상세 페이지 전용 함수들
 */
function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const id = idParam ? parseInt(idParam) : 1;
    const data = mockDestinations.find(d => d.id === id);

    if (!data) return console.error("데이터를 찾을 수 없습니다.");

    // 제목 및 요약 정보 주입
    const titleEl = document.getElementById('d-title');
    const regionBadgeEl = document.getElementById('d-region-badge');
    const summaryEl = document.getElementById('d-summary');

    if (titleEl) titleEl.innerText = data.title;
    if (regionBadgeEl) regionBadgeEl.innerText = `${data.region} ${data.subRegion}`;
    if (summaryEl) summaryEl.innerText = data.summary; // 요약 문구 반영

    // 나머지 상세 정보 주입
    const imgEl = document.getElementById('d-image');
    const themeEl = document.getElementById('d-theme');
    const addrEl = document.getElementById('d-address');
    const phoneEl = document.getElementById('d-phone');
    const descEl = document.getElementById('d-description');
    const viewEl = document.getElementById('d-views');

    if (imgEl) imgEl.src = data.image;
    if (themeEl) themeEl.innerText = `#${data.theme}`;
    if (addrEl) addrEl.innerText = data.address;
    if (phoneEl) phoneEl.innerText = data.phone;
    if (descEl) descEl.innerText = data.description;
    if (viewEl) viewEl.innerText = data.views;

    updateLikeUI(id);
    renderComments(id);
    setupImageHandler();
}

window.setCommentFilter = function (unused, filterType) { // 첫번째 인자 대신 URL에서 ID 추출
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '1';

    state.commentFilter = filterType;

    const allBtn = document.getElementById('btn-filter-all');
    const photoBtn = document.getElementById('btn-filter-photo');

    if (filterType === 'all') {
        allBtn.classList.replace('text-gray-400', 'text-orange-600');
        allBtn.classList.add('border-orange-500');
        photoBtn.classList.replace('text-orange-600', 'text-gray-400');
        photoBtn.classList.remove('border-orange-500');
    } else {
        photoBtn.classList.replace('text-gray-400', 'text-orange-600');
        photoBtn.classList.add('border-orange-500');
        allBtn.classList.replace('text-orange-600', 'text-gray-400');
        allBtn.classList.remove('border-orange-500');
    }
    renderComments(id);
};


window.handleLike = function () {
    const id = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
    const index = state.likedItems.indexOf(id);
    if (index > -1) {
        state.likedItems.splice(index, 1);
    } else {
        state.likedItems.push(id);
    }
    localStorage.setItem('trip_likes', JSON.stringify(state.likedItems));
    updateLikeUI(id);
};

function updateLikeUI(id) {
    const data = mockDestinations.find(d => d.id === id);
    const isLiked = state.likedItems.includes(id);
    const likeCountEl = document.getElementById('d-likes');
    const icon = document.getElementById('like-icon');

    if (likeCountEl) {
        likeCountEl.innerText = isLiked ? data.likes + 1 : data.likes;
    }
    if (icon) {
        if (isLiked) {
            icon.classList.add('fill-red-500', 'text-red-500');
        } else {
            icon.classList.remove('fill-red-500', 'text-red-500');
        }
    }
}

window.submitComment = function () {
    const id = new URLSearchParams(window.location.search).get('id') || '1';
    const text = document.getElementById('comment-input').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const image = document.getElementById('img-preview').src;

    if (!rating || !text.trim()) return alert('별점과 내용을 입력해주세요.');
    if (!state.comments[id]) state.comments[id] = [];

    state.comments[id].unshift({
        rating: parseInt(rating),
        text,
        image: image.startsWith('data:') ? image : null,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('trip_comments', JSON.stringify(state.comments));
    renderComments(parseInt(id));

    document.getElementById('comment-input').value = '';
    clearImage();
    document.querySelectorAll('input[name="rating"]').forEach(el => el.checked = false);
};

function renderComments(id) {
    const container = document.getElementById('comment-list');
    const countEl = document.getElementById('comment-count');
    let comments = state.comments[id] || [];

    // 1. 개수 업데이트
    if (countEl) countEl.innerText = comments.length;

    // 2. 필터링 로직 적용 (사진 후기인 경우 이미지가 있는 것만)
    const currentFilter = state.commentFilter || 'all';
    if (currentFilter === 'photo') {
        comments = comments.filter(c => c.image);
    }

    if (comments.length === 0) {
        container.innerHTML = `<p class="text-center py-10 text-gray-400 text-sm">등록된 후기가 없습니다.</p>`;
        return;
    }

    // 3. 리스트 렌더링 (삭제 버튼 index 추가)
    container.innerHTML = comments.map((c, index) => `
        <div class="p-6 bg-white rounded-xl border border-gray-100 mb-4 shadow-sm relative group">
            <div class="flex justify-between items-start">
                <div class="text-yellow-400 mb-2">${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}</div>
                <button onclick="deleteComment('${id}', ${index})" class="text-gray-300 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" size="16"></i>
                </button>
            </div>
            <p class="text-sm mb-4 text-gray-700">${c.text}</p>
            ${c.image ? `<img src="${c.image}" class="w-32 h-32 object-cover rounded-lg border">` : ''}
            <p class="text-[10px] text-gray-300 mt-2">${c.date}</p>
        </div>`).join('');

    // 아이콘 재렌더링
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupImageHandler() {
    const input = document.getElementById('image-upload');
    if (input) {
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('file-name').innerText = file.name;
                const reader = new FileReader();
                reader.onload = ev => {
                    document.getElementById('img-preview').src = ev.target.result;
                    document.getElementById('preview-box').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

window.deleteComment = function (id, index) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    // 해당 ID의 댓글 배열에서 특정 인덱스 제거
    state.comments[id].splice(index, 1);

    // 데이터 저장 및 재렌더링
    localStorage.setItem('trip_comments', JSON.stringify(state.comments));
    renderComments(id);
};


window.clearImage = function () {
    document.getElementById('image-upload').value = '';
    document.getElementById('file-name').innerText = '선택된 파일 없음';
    const box = document.getElementById('preview-box');
    if (box) box.classList.add('hidden');
    const img = document.getElementById('img-preview');
    if (img) img.src = '';
};

// 모든 리소스가 로드된 후 init 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}