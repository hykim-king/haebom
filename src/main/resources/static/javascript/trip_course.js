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
    "대구": { temp: "28", status: "맑음", wind: "1.2", dust: "보통", dustColor: "bg-green-500" }
};

const mockDestinations = [
    {
        id: 1, title: "비토해양낚시공원", region: "경남", subRegion: "사천시", theme: "관광지",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        summary: "별주부전 전설을 간직한 사천의 명소",
        description: "비토해양낚시공원은 천혜의 자연경관과 전설이 살아있는 비토섬에 위치하고 있습니다. 해상 데크를 따라 걷는 산책로와 낚시 체험 공간이 마련되어 있어 가족 단위 여행객에게 인기가 많습니다.",
        likes: 6, views: '2.4K', address: "경남 사천시 서포면 비토길 49", phone: "055-833-0259",
        fullCourse: [
            { name: "비토섬 입구", desc: "해안 드라이브 코스", time: "10:00", lat: 34.9961, lng: 127.9811 },
            { name: "비토해양낚시공원", desc: "해상 낚시 체험", time: "13:00", lat: 34.9912, lng: 127.9785 },
            { name: "무지개 해안도로", desc: "일몰 감상 및 산책", time: "17:00", lat: 35.0055, lng: 128.0123 }
        ]
    },
    {
        id: 2, title: "별마당 도서관", region: "서울", subRegion: "강남구", theme: "문화시설",
        image: "https://images.unsplash.com/photo-1552568165-02cfdb51bc7d?w=800",
        summary: "코엑스 몰 중심의 열린 문화 공간",
        description: "책과 문화가 어우러진 서울의 랜드마크 도서관입니다. 13m 높이의 거대한 서가는 보는 이로 하여금 감탄을 자아내며, 누구나 자유롭게 책을 읽고 쉴 수 있는 도심 속 휴식처입니다.",
        likes: 12, views: '1.5K', address: "서울 강남구 영동대로 513", phone: "02-6002-3031",
        fullCourse: [
            { name: "봉은사", desc: "도심 속 힐링 산책", time: "11:00", lat: 37.5142, lng: 127.0573 },
            { name: "별마당 도서관", desc: "웅장한 서가 구경", time: "14:00", lat: 37.5118, lng: 127.0592 },
            { name: "코엑스 아쿠아리움", desc: "해양 생물 관람", time: "16:00", lat: 37.5131, lng: 127.0586 }
        ]
    }
];

// 2. 상태 관리
let state = { 
    mainRegion: '전체', 
    subRegion: '전체', 
    theme: '전체', 
    searchQuery: '', 
    likedItems: JSON.parse(localStorage.getItem('trip_likes')) || [], 
    comments: JSON.parse(localStorage.getItem('trip_comments')) || {}, 
    commentFilter: 'all'
};

// 3. 초기화 함수
function init() {
    const isDetailPage = document.getElementById('d-image');
    
    if (isDetailPage) {
        initDetailPage(); // 상세 페이지일 때 데이터 주입
    } else if (document.getElementById('dest-list')) { 
        renderMainTags();
        renderSubTags();
        renderThemeTags();
        renderList();
        updateWeatherUI('전체');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/** --- 상세 페이지 전용 로직 --- **/
function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 1;
    const data = mockDestinations.find(d => d.id === id);

    if (!data) return;

    // 상단 텍스트 및 이미지 주입
    if (document.getElementById('d-title')) document.getElementById('d-title').innerText = data.title;
    if (document.getElementById('d-region')) document.getElementById('d-region').innerText = `${data.region} ${data.subRegion}`;
    if (document.getElementById('d-summary')) document.getElementById('d-summary').innerText = data.summary;
    if (document.getElementById('d-image')) document.getElementById('d-image').src = data.image;
    if (document.getElementById('d-description')) document.getElementById('d-description').innerText = data.description;
    const viewEl = document.getElementById('d-views');

    // 코스 리스트 주입
    const courseListEl = document.getElementById('d-course-list');
    if (courseListEl && data.fullCourse) {
        courseListEl.innerHTML = data.fullCourse.map((step, idx) => `
            <div class="flex gap-6 relative">
                <div class="z-10 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    ${idx + 1}
                </div>
                <div class="pb-2">
                    <p class="text-sm font-bold text-gray-900">${step.name}</p>
                    <p class="text-xs text-gray-400 mt-1">${step.desc}</p>
                </div>
            </div>`).join('');
    }

    updateLikeUI(id);
    renderComments(id);
    setupImageHandler();
}

/** --- 후기 댓글 기능 --- **/
window.submitComment = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '1';
    const text = document.getElementById('comment-input').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const imagePreview = document.getElementById('img-preview').src;

    if (!rating || !text.trim()) return alert('별점과 내용을 입력해주세요.');
    
    if (!state.comments[id]) state.comments[id] = [];
    
    state.comments[id].unshift({ 
        rating: parseInt(rating), 
        text, 
        image: imagePreview.startsWith('data:') ? imagePreview : null, 
        date: new Date().toLocaleDateString() 
    });

    localStorage.setItem('trip_comments', JSON.stringify(state.comments));
    renderComments(id);

    // 입력창 초기화
    document.getElementById('comment-input').value = ''; 
    clearImage();
    document.querySelectorAll('input[name="rating"]').forEach(el => el.checked = false);
};

window.deleteComment = function(id, index) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    state.comments[id].splice(index, 1);
    localStorage.setItem('trip_comments', JSON.stringify(state.comments));
    renderComments(id);
};

function renderComments(id) {
    const container = document.getElementById('comment-list');
    const badge = document.getElementById('comment-count-badge');
    const countText = document.getElementById('comment-count');
    let comments = state.comments[id] || [];
    
    if (badge) badge.innerText = comments.length;
    if (countText) countText.innerText = comments.length;

    // 사진 후기 필터링 적용
    if (state.commentFilter === 'photo') {
        comments = comments.filter(c => c.image);
    }

    if (comments.length === 0) {
        container.innerHTML = `<p class="text-center py-10 text-gray-400 text-sm">등록된 후기가 없습니다.</p>`;
        return;
    }

    container.innerHTML = comments.map((c, index) => `
        <div class="p-6 bg-white rounded-xl border border-gray-100 mb-4 shadow-sm relative">
            <div class="flex justify-between items-start">
                <div class="text-yellow-400 mb-2">${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</div>
                <button onclick="deleteComment('${id}', ${index})" class="text-gray-300 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <p class="text-sm mb-4 text-gray-700">${c.text}</p>
            ${c.image ? `<img src="${c.image}" class="w-32 h-32 object-cover rounded-lg border">` : ''}
            <p class="text-[10px] text-gray-300 mt-2">${c.date}</p>
        </div>`).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.setCommentFilter = function(unused, filterType) {
    const id = new URLSearchParams(window.location.search).get('id') || '1';
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

/** --- 이미지 핸들러 --- **/
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

window.clearImage = function() { 
    const input = document.getElementById('image-upload');
    if (input) input.value = '';
    document.getElementById('file-name').innerText = '선택된 파일 없음';
    document.getElementById('preview-box').classList.add('hidden'); 
    document.getElementById('img-preview').src = ''; 
};

/** --- 찜하기 기능 --- **/
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

/** --- 목록 페이지 필터 및 렌더링 --- **/
window.setMainRegion = function (reg) {
    state.mainRegion = reg; state.subRegion = '전체';
    updateWeatherUI(reg); renderMainTags(); renderSubTags(); renderList();
};
window.setSubRegion = function (sub) { state.subRegion = sub; renderSubTags(); renderList(); };
window.setTheme = function (t) { state.theme = (state.theme === t) ? '전체' : t; renderThemeTags(); renderList(); };

function renderMainTags() {
    const el = document.getElementById('main-region-tags');
    if(!el) return;
    el.innerHTML = ['전체', ...Object.keys(regionGroups)].map(reg => `
        <button onclick="setMainRegion('${reg}')" class="px-2 py-1 text-sm text-gray-400 font-bold ${state.mainRegion === reg ? 'text-orange-600 border-b-2 border-orange-500' : ''}">#${reg}</button>
    `).join('');
}

function renderSubTags() {
    const container = document.getElementById('sub-region-tags');
    if (!container || state.mainRegion === '전체') { if(container) container.innerHTML = ''; return; }
    container.innerHTML = ['전체', ...regionGroups[state.mainRegion]].map(sub => `
        <button onclick="setSubRegion('${sub}')" class="${state.subRegion === sub ? 'font-bold text-gray-900' : 'text-gray-400'}">${sub}</button>
    `).join('');
}

function renderThemeTags() {
    const el = document.getElementById('theme-tags');
    if(!el) return;
    el.innerHTML = themes.map(t => `
        <button onclick="setTheme('${t}')" class="text-sm hover:text-black ${state.theme === t ? 'font-bold text-orange-500' : 'text-gray-400'}">#${t}</button>
    `).join('');
}

function renderList() {
    const listEl = document.getElementById('dest-list');
    if(!listEl) return;
    const filtered = mockDestinations.filter(d =>
        (state.mainRegion === '전체' || d.region === state.mainRegion) &&
        (state.subRegion === '전체' || d.subRegion === state.subRegion) &&
        (state.theme === '전체' || d.theme === state.theme) &&
        (d.title.includes(state.searchQuery))
    );
    
    listEl.innerHTML = filtered.map(d => `
        <div class="flex flex-col md:flex-row gap-8 cursor-pointer group border-b pb-8" onclick="location.href='trip_course_detail.html?id=${d.id}'">
            <div class="w-full md:w-64 h-44 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                <img src="${d.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-bold mb-1 group-hover:text-orange-600">${d.title}</h3>
                    <span class="text-xs text-gray-400 mt-2">${d.region} ${d.subRegion}</span>
                </div>
                <p class="text-gray-600 line-clamp-2 text-sm">${d.summary}</p>
            </div>
        </div>`).join('');
}

function updateWeatherUI(regionName) {
    const data = weatherData[regionName] || weatherData['전체'];
    const nameEl = document.getElementById("selected-region-name");
    if (nameEl) nameEl.innerText = regionName === '전체' ? '전국' : regionName;
    const dustEl = document.getElementById("weather-dust");
    if (dustEl) {
        dustEl.innerText = data.dust;
        dustEl.className = `px-2 py-0.5 rounded-full text-[10px] text-white ${data.dustColor}`;
    }
}

// 초기 실행
document.addEventListener('DOMContentLoaded', init);