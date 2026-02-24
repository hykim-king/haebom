const regions = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];
const subRegionsMap = { 
    '서울': ['강남구', '동대문구', '마포구', '종로구'],
    '부산': ['해운대구', '수영구'],
    '대구': ['중구','수성구'],
    '인천': ['계양구', '부평구'],
    '광주': [], '대전': [], '울산': [], '세종': [],
};
const themes = ['#레포츠', '#문화시설', '#자연', '#역사', '#관광지', '#체험', '#음식'];
const mockTemps = { '서울': '4°C', '부산': '8°C', '광주': '7°C', '대전': '10°C', '세종': '3°C', '인천': '12°C' };

const mockDestinations = [
    { 
        id: 1, title: "별마당 도서관", region: "서울", subRegion: "강남구", theme: "#문화시설", 
        image: "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?w=800", 
        summary: "코엑스 몰 중심의 열린 문화 공간", 
        description: "책과 문화가 어우러진 서울의 랜드마크 도서관입니다. 웅장한 서가와 매월 바뀌는 전시가 특징입니다.", 
        likes: 12, views: '1.5K', address: "서울 강남구 영동대로 513", phone: "02-6002-3031",
        fullCourse: [
            { name: "삼성역 도보", desc: "코엑스 방향 연결 통로 이동", img: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400", dist: "150m" },
            { name: "별마당 도서관", desc: "메인 서가 관람 및 휴식", img: "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?w=400", dist: "300m" },
            { name: "봉은사", desc: "도심 속 사찰 산책", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", dist: null }
        ]
    }
];

let state = { 
    mainRegion: '전체', 
    subRegion: '전체', 
    theme: '전체', 
    searchQuery: '', 
    comments: {}, 
    likedItems: [] 
};

let currentUploadImg = null;

function init() { 
    renderMainTags(); renderSubTags(); renderThemeTags(); renderList(); renderWeather(); 
    lucide.createIcons(); 
}

// --- 공통 렌더링 로직 ---
function renderMainTags() {
    document.getElementById('main-region-tags').innerHTML = regions.map(reg => `
        <button onclick="setMainRegion('${reg}')" class="px-2 py-1 text-sm text-gray-400 font-bold ${state.mainRegion === reg ? 'tag-active px-3' : ''}">#${reg}</button>
    `).join('');
}

function renderSubTags() {
    const container = document.getElementById('sub-region-tags');
    if (state.mainRegion === '전체') { container.innerHTML = ''; return; }
    const subs = subRegionsMap[state.mainRegion] || [];
    container.innerHTML = ['전체', ...subs].map(sub => `
        <button onclick="setSubRegion('${sub}')" class="${state.subRegion === sub ? 'sub-tag-active px-2 text-gray-900' : 'hover:text-gray-900'}">${sub}</button>
    `).join('');
}

function renderThemeTags() {
    document.getElementById('theme-tags').innerHTML = themes.map(t => `
        <button onclick="setTheme('${t}')" class="hover:text-black ${state.theme === t ? 'theme-active' : ''}">${t}</button>
    `).join('');
}

function renderWeather() {
    const list = document.getElementById('temperature-list');
    if(!list) return;
    list.innerHTML = Object.entries(mockTemps).map(([city, temp]) => `
        <div class="flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-all ${state.mainRegion === city ? 'temp-focus font-bold shadow-sm' : 'bg-gray-100 text-gray-500'}">
            <span>${city}</span><span>${temp}</span>
        </div>
    `).join('');
}

// --- 필터 & 검색 로직 ---
window.setMainRegion = function(reg) { 
    state.mainRegion = reg; state.subRegion = '전체'; 
    document.getElementById('view-title').innerText = reg;
    const tempBanner = document.getElementById('selected-city-temp');
    if(reg !== '전체' && mockTemps[reg]) { 
        tempBanner.classList.replace('hidden', 'flex'); 
        document.getElementById('target-temp-val').innerText = `${reg} ${mockTemps[reg]}`;
    } else if(tempBanner) tempBanner.classList.replace('flex', 'hidden');
    renderMainTags(); renderSubTags(); renderList(); renderWeather(); lucide.createIcons();
};

window.setSubRegion = function(sub) { state.subRegion = sub; renderSubTags(); renderList(); lucide.createIcons(); };
window.setTheme = function(t) { state.theme = (state.theme === t) ? '전체' : t; renderThemeTags(); renderList(); lucide.createIcons(); };
window.handleSearch = function(v) { state.searchQuery = v; renderList(); lucide.createIcons(); };

window.renderList = function() {
    const filtered = mockDestinations.filter(d => 
        (state.mainRegion === '전체' || d.region === state.mainRegion) &&
        (state.subRegion === '전체' || d.subRegion === state.subRegion) &&
        (state.theme === '전체' || d.theme === state.theme) &&
        (d.title.includes(state.searchQuery))
    );
    
    document.getElementById('total-count').innerText = filtered.length;
    
    document.getElementById('dest-list').innerHTML = filtered.map(d => `
        <div class="flex flex-col md:flex-row gap-8 cursor-pointer group border-b pb-8" onclick="openDetail(${d.id})">
            <div class="w-full md:w-64 h-44 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                <img src="${d.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-bold mb-1 group-hover:text-blue-600 transition-colors">${d.title}</h3>
                    <span class="text-xs text-gray-400 mt-2">${d.region} ${d.subRegion}</span>
                </div>
                
                <div class="mb-3">
                    <span class="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        ${d.theme}
                    </span>
                </div>

                <p class="text-gray-600 line-clamp-2 text-sm leading-relaxed">${d.summary}</p>
            </div>
        </div>`).join('');
        
    lucide.createIcons();
};

// --- 상세 페이지 (코스 경로 + 상세 정보 + 테마 위치 수정) ---
window.openDetail = function(id) {
    const d = mockDestinations.find(x => x.id === id);
    const isLiked = state.likedItems.includes(id);
    const comments = state.comments[id] || [];

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    window.scrollTo(0,0);

    const renderStars = (rating) => Array(5).fill(0).map((_, i) => `
        <i data-lucide="star" size="14" class="${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}"></i>
    `).join('');

    document.getElementById('detail-content').innerHTML = `
        <div class="text-center mb-10">
            <p class="text-gray-500 mb-1 text-sm">${d.region} ${d.subRegion}</p>
            <h1 class="text-4xl font-bold mb-5">${d.title}</h1>
            
            <div class="px-4 py-1.5 bg-orange-50 text-orange-600 border-b-2 border-orange-100 font-bold inline-block text-sm rounded-sm">${d.summary}</div>
            
            <div class="mt-4 flex justify-center">
                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    ${d.theme}
                </span>
            </div>
        </div>

        <div class="flex justify-between items-center mb-6 pb-4 border-b">
            <div class="flex gap-6 text-gray-500 text-sm font-bold">
                <button onclick="toggleLike(${d.id})" class="flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}">
                    <i data-lucide="heart" size="18" class="${isLiked ? 'fill-current' : ''}"></i> <span>${d.likes}</span>
                </button>
                <span class="flex items-center gap-1"><i data-lucide="eye" size="18"></i> ${d.views}</span>
            </div>
            <button onclick="closeDetail()" class="flex items-center gap-1 font-bold text-blue-600"><i data-lucide="list" size="18"></i> 목록보기</button>
        </div>
        
        <img src="${d.image}" class="w-full h-[450px] object-cover rounded-3xl mb-12 shadow-md">
        
        <div class="mb-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
                <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <span class="w-1.5 h-6 bg-blue-600"></span> 여행지 정보
                </h3>
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <i data-lucide="map-pin" class="text-gray-400 shrink-0" size="20"></i>
                        <div>
                            <p class="text-sm font-bold text-gray-700">주소</p>
                            <p class="text-gray-500 text-sm">${d.address}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <i data-lucide="phone" class="text-gray-400 shrink-0" size="20"></i>
                        <div>
                            <p class="text-sm font-bold text-gray-700">문의처</p>
                            <p class="text-gray-500 text-sm">${d.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <span class="w-1.5 h-6 bg-blue-600"></span> 소개
                </h3>
                <p class="text-gray-600 leading-relaxed text-sm">${d.description}</p>
            </div>
        </div>

        <div class="mb-20">
            <h3 class="text-xl font-bold mb-8 flex items-center gap-2"><span class="w-1.5 h-6 bg-blue-600"></span> 코스 경로 정보</h3>
            <div class="ml-8 border-l-2 border-dashed border-gray-200 pl-8 space-y-12">
                ${d.fullCourse.map(spot => `
                    <div class="relative">
                        <div class="course-dot"></div>
                        <div class="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                            <img src="${spot.img}" class="w-full md:w-48 h-32 object-cover rounded-xl">
                            <div><h4 class="font-bold text-lg mb-2">${spot.name}</h4><p class="text-gray-500 text-sm">${spot.desc}</p></div>
                        </div>
                        ${spot.dist ? `<div class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full"><i data-lucide="navigation" size="12"></i> 다음 장소까지 ${spot.dist}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="max-w-4xl mx-auto mb-20">
            <h3 class="font-bold text-xl mb-6">후기 및 댓글 <span class="text-orange-500 text-sm ml-1">${comments.length}</span></h3>
            
            <div class="bg-gray-50 p-8 rounded-3xl border border-gray-200 mb-8 shadow-sm">
                <div class="flex items-center gap-4 mb-4">
                    <span class="text-sm font-bold text-gray-700">평점 선택</span>
                    <div class="star-rating">
                        <input type="radio" id="s5" name="rating" value="5"><label for="s5"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="s4" name="rating" value="4"><label for="s4"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="s3" name="rating" value="3"><label for="s3"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="s2" name="rating" value="2"><label for="s2"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="s1" name="rating" value="1" checked><label for="s1"><i data-lucide="star" size="24"></i></label>
                    </div>
                </div>

                <div class="flex flex-col gap-2 mb-4">
                    <span class="text-sm font-bold text-gray-700">사진 첨부</span>
                    <div class="flex items-center gap-3">
                        <label class="px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-sm font-bold cursor-pointer hover:bg-orange-100 transition-colors">
                            파일 선택
                            <input type="file" id="file-input" class="hidden" accept="image/*" onchange="handleImgUpload(this)">
                        </label>
                        <span id="file-name-display" class="text-xs text-gray-400">선택된 파일 없음</span>
                    </div>
                </div>

                <textarea id="comment-input" class="w-full p-5 border border-gray-200 rounded-2xl h-32 mb-4 focus:ring-1 focus:ring-orange-500 outline-none bg-white" placeholder="여행지의 생생한 후기를 남겨주세요."></textarea>
                
                <div id="preview-box" class="hidden relative w-24 h-24 mb-4 border rounded-xl overflow-hidden">
                    <img id="img-preview" src="" class="w-full h-full object-cover">
                    <button onclick="removePreview()" class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black"><i data-lucide="x" size="12"></i></button>
                </div>

                <div class="flex justify-end">
                    <button onclick="addComment(${id})" class="bg-orange-500 text-white px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95">등록하기</button>
                </div>
            </div>

            <div id="comment-list" class="mt-8 space-y-4">
                ${comments.map((c, index) => `
                    <div class="p-5 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
                        <button onclick="deleteComment(${id}, ${index})" class="absolute top-5 right-5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="trash-2" size="18"></i></button>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="flex text-yellow-400">${renderStars(c.rating)}</div>
                            <span class="text-xs font-bold text-gray-400 ml-1">방문자</span>
                        </div>
                        <p class="text-gray-700 text-sm leading-relaxed mb-3">${c.text}</p>
                        ${c.photo ? `<img src="${c.photo}" class="w-32 h-32 object-cover rounded-lg border mt-2">` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    lucide.createIcons();
};

// --- 기능 로직 ---
window.handleImgUpload = function(input) {
    const display = document.getElementById('file-name-display');
    if (input.files && input.files[0]) {
        display.innerText = input.files[0].name;
        const reader = new FileReader();
        reader.onload = e => { 
            currentUploadImg = e.target.result; 
            document.getElementById('img-preview').src = e.target.result; 
            document.getElementById('preview-box').classList.remove('hidden'); 
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        display.innerText = "선택된 파일 없음";
    }
};
window.removePreview = function() { 
    currentUploadImg = null; 
    document.getElementById('preview-box').classList.add('hidden'); 
    document.getElementById('file-input').value = ""; 
    document.getElementById('file-name-display').innerText = "선택된 파일 없음";
};
window.addComment = function(id) {
    const val = document.getElementById('comment-input').value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? ratingInput.value : 1;
    
    if(!val.trim()) return alert("후기 내용을 입력해 주세요.");
    if(!state.comments[id]) state.comments[id] = [];
    
    state.comments[id].unshift({ 
        text: val, 
        rating: parseInt(rating), 
        photo: currentUploadImg 
    });
    
    currentUploadImg = null; 
    openDetail(id);
};
window.deleteComment = function(id, idx) { if(confirm("삭제하시겠습니까?")) { state.comments[id].splice(idx, 1); openDetail(id); } };
window.toggleLike = function(id) {
    const d = mockDestinations.find(x => x.id === id);
    if(!state.likedItems.includes(id)) { state.likedItems.push(id); d.likes++; } 
    else { state.likedItems = state.likedItems.filter(v => v !== id); d.likes--; }
    openDetail(id); renderList();
};
window.closeDetail = function() { document.getElementById('home-view').classList.remove('hidden'); document.getElementById('detail-view').classList.add('hidden'); window.scrollTo(0,0); };

document.addEventListener('DOMContentLoaded', init);