const regionGroups = {
    '서울': ['강남구', '동대문구', '마포구', '종로구'],
    '부산': ['해운대구', '수영구'],
    '대구': ['중구','수성구'],
    '인천': ['계양구', '부평구'],
    '광주': [], '대전': [], '울산': [], '세종': [],
};

const themes = ['레포츠', '문화시설', '자연', '역사', '관광지', '체험', '숙박', '음식', '쇼핑'];
const mockTemps = { '서울': '4°C', '부산': '8°C', '광주': '7°C', '대전': '10°C', '세종': '3°C', '인천': '12°C' };

const mockDestinations = [
    { 
        id: 1, title: "비토해양낚시공원", region: "경남", subRegion: "사천시", theme: "관광지", 
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", 
        summary: "별주부전 전설을 간직한 사천의 명소", 
        description: "비토해양낚시공원은 천혜의 자연경관과 전설이 살아있는 비토섬에 위치하고 있습니다.", 
        likes: 6, views: '2.4K', address: "경남 사천시 서포면 비토길 49", phone: "055-833-0259"
    },
    { 
        id: 2, title: "별마당 도서관", region: "서울", subRegion: "강남구", theme: "문화시설", 
        image: "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?w=800", 
        summary: "코엑스 몰 중심의 열린 문화 공간", 
        description: "책과 문화가 어우러진 서울의 랜드마크 도서관입니다.", 
        likes: 12, views: '1.5K', address: "서울 강남구 영동대로 513", phone: "02-6002-3031" 
    },
    { 
        id: 3, title: "육전식당 1호점", region: "서울", subRegion: "동대문구", theme: "음식", 
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", 
        summary: "두툼한 목살과 삼겹살 명소", 
        description: "전문적인 그릴러가 직접 고기를 구워줍니다.", 
        likes: 45, views: '5.2K', address: "서울 동대문구 난계로30길 16", phone: "02-2253-6373" 
    }
];
let state = { mainRegion: '전체', subRegion: '전체', theme: '전체', searchQuery: '', comments: {}, likedItems: [] };

function init() {
    renderMainTags(); renderSubTags(); renderThemeTags(); renderList(); renderWeather();
    lucide.createIcons();
}

function renderMainTags() {
    document.getElementById('main-region-tags').innerHTML = ['전체', ...Object.keys(regionGroups)].map(reg => `
        <button onclick="setMainRegion('${reg}')" class="px-2 py-1 text-sm text-gray-400 font-bold ${state.mainRegion === reg ? 'tag-active px-3' : ''}">#${reg}</button>
    `).join('');
}
function renderSubTags() {
    const container = document.getElementById('sub-region-tags');
    if (state.mainRegion === '전체') { container.innerHTML = ''; return; }
    container.innerHTML = ['전체', ...regionGroups[state.mainRegion]].map(sub => `
        <button onclick="setSubRegion('${sub}')" class="${state.subRegion === sub ? 'sub-tag-active px-2 text-gray-900' : 'hover:text-gray-900'}">${sub}</button>
    `).join('');
}
function renderThemeTags() {
    document.getElementById('theme-tags').innerHTML = themes.map(t => `
        <button onclick="setTheme('${t}')" class="hover:text-black ${state.theme === t ? 'theme-active' : ''}">#${t}</button>
    `).join('');
}
function renderWeather() {
    const container = document.getElementById('temperature-list');
    if(!container) return;
    container.innerHTML = Object.entries(mockTemps).map(([city, temp]) => {
        const isSelected = state.mainRegion === city;
        return `<div class="flex justify-between items-center px-3 py-2 rounded-lg text-xs transition-all ${isSelected ? 'temp-focus font-bold shadow-sm' : 'bg-gray-100 text-gray-500'}"><span>${city}</span><span>${temp}</span></div>`;
    }).join('');
}
// --- 필터 & 검색 로직 ---
window.setMainRegion = function(reg) { 
    state.mainRegion = reg; state.subRegion = '전체'; 
    document.getElementById('view-title').innerText = reg;
    const tempBanner = document.getElementById('selected-city-temp');
    if(reg !== '전체' && mockTemps[reg]) { 
        tempBanner.classList.replace('hidden', 'flex'); 
        document.getElementById('target-temp-val').innerText = `${reg} ${mockTemps[reg]}`;
    } else tempBanner.classList.replace('flex', 'hidden');
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

window.toggleLike = function(id) {
    const d = mockDestinations.find(x => x.id === id);
    const index = state.likedItems.indexOf(id);
    if (index > -1) { state.likedItems.splice(index, 1); d.likes--; } 
    else { state.likedItems.push(id); d.likes++; }
    openDetail(id); renderList();
};

window.openDetail = function(id) {
    const d = mockDestinations.find(x => x.id === id);
    const isLiked = state.likedItems.includes(id);
    const comments = state.comments[id] || [];
    
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    window.scrollTo(0,0);

    const renderStars = (rating) => {
        let stars = '';
        for(let i=1; i<=5; i++) stars += `<i data-lucide="star" size="14" class="${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}"></i>`;
        return stars;
    };

    document.getElementById('detail-content').innerHTML = `
        <div class="text-center mb-10">
            <p class="text-gray-500 mb-2">${d.region} ${d.subRegion}</p>
            <h1 class="text-4xl font-bold mb-4">${d.title}</h1>
            <div class="px-4 py-1 bg-orange-50 text-orange-600 border-b-2 border-orange-100 font-bold inline-block text-sm mb-3">${d.summary}</div>
            
            <div class="mt-2 flex justify-center">
                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">#${d.theme}</span>
            </div>
        </div>

        <div class="flex justify-between items-center mb-6 pb-4 border-b">
            <div class="flex gap-6 text-gray-500 text-sm font-bold">
                <button onclick="toggleLike(${d.id})" class="flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}">
                    <i data-lucide="heart" size="18" class="${isLiked ? 'fill-current' : ''}"></i> <span>${d.likes}</span>
                </button>
                <span class="flex items-center gap-1"><i data-lucide="eye" size="18"></i> ${d.views}</span>
            </div>
            <button onclick="closeDetail()" class="flex items-center gap-1 font-bold text-blue-600 hover:underline"><i data-lucide="list" size="18"></i> 목록보기</button>
        </div>

        <img src="${d.image}" class="w-full h-[500px] object-cover rounded-3xl shadow-lg mb-12">

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

        <div class="max-w-3xl mx-auto border-t pt-10 mb-20">
            <h3 class="font-bold text-xl mb-6">후기 및 댓글 <span class="text-orange-500 text-sm ml-2">${comments.length}</span></h3>
            <div class="bg-gray-50 p-6 rounded-2xl border mb-8 shadow-sm">
                <div class="flex items-center gap-4 mb-4">
                    <span class="text-sm font-bold text-gray-700">평점 선택</span>
                    <div class="star-rating">
                        <input type="radio" id="star5" name="rating" value="5"><label for="star5"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="star4" name="rating" value="4"><label for="star4"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="star3" name="rating" value="3"><label for="star3"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="star2" name="rating" value="2"><label for="star2"><i data-lucide="star" size="24"></i></label>
                        <input type="radio" id="star1" name="rating" value="1" checked><label for="star1"><i data-lucide="star" size="24"></i></label>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">사진 첨부</label>
                    <input type="file" id="image-upload" accept="image/*" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100">
                </div>

                <textarea id="comment-input" class="w-full p-4 border rounded-xl h-24 mb-3 outline-none focus:ring-1 focus:ring-orange-500 bg-white" placeholder="여행지의 생생한 후기를 남겨주세요."></textarea>
                <div class="flex justify-end">
                    <button onclick="addComment(${id})" class="bg-orange-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">등록하기</button>
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

window.addComment = function(id) {
    const input = document.getElementById('comment-input');
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const fileInput = document.getElementById('image-upload');
    
    if(!input.value.trim()) { alert("후기 내용을 입력해주세요."); return; }
    
    const saveComment = (photoUrl = null) => {
        if(!state.comments[id]) state.comments[id] = [];
        state.comments[id].unshift({ 
            text: input.value, 
            rating: parseInt(ratingInput.value),
            photo: photoUrl 
        });
        openDetail(id);
    };

    if(fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => saveComment(e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveComment();
    }
};

window.deleteComment = function(id, index) {
    if(confirm("이 후기를 삭제하시겠습니까?")) {
        state.comments[id].splice(index, 1);
        openDetail(id);
    }
};

window.closeDetail = function() { 
    document.getElementById('home-view').classList.remove('hidden'); 
    document.getElementById('detail-view').classList.add('hidden'); 
    window.scrollTo(0,0); 
};

document.addEventListener('DOMContentLoaded', init);