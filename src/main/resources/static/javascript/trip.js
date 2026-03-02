/**
 * 해봄트립 통합 JavaScript
 */
const tripState = {
    pageNo: 1,
    pageSize: 10,
    searchWord: "",
    tripTag: "",    
    tripCtpv: 0,    
    tripGungu: 0,   
    orderType: "new" 
};

let searchTimer;

document.addEventListener("DOMContentLoaded", () => {
    // Lucide 아이콘 초기화
    if (window.lucide) lucide.createIcons();
    initListPage();
});

function initListPage() {
    fetchAreaTags();     // 1. 시도 목록 로드
    renderThemeTags();   // 2. 테마 목록 로드
    fetchList();         // 3. 첫 화면 리스트 로드

// 검색어 실시간 입력 (기존 로직)
const searchInput = document.getElementById("search-input");
let searchTimer; // 상단에 선언되어 있다고 가정

searchInput?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        tripState.searchWord = e.target.value.trim();
        tripState.pageNo = 1;
        fetchList(); 
    }, 300);
});
// 리셋 버튼 클릭 이벤트
const clearBtn = document.getElementById("clear-btn");

clearBtn?.addEventListener("click", () => {
    // 1. 입력창 텍스트 비우기
    searchInput.value = "";
    // 2. 상태(State) 초기화
    tripState.searchWord = "";
    tripState.pageNo = 1;
    // 3. 즉시 목록 갱신 (리셋은 지연 시간 없이 바로 실행하는 게 좋습니다)
    fetchList();
    // 4. 입력창에 다시 포커스 (사용자 편의성)
    searchInput.focus();
});

    // 정렬 버튼 클릭 이벤트
    document.querySelectorAll(".sort-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".sort-btn").forEach(b => 
                b.classList.remove("text-gray-900", "font-bold", "underline"));
            this.classList.add("text-gray-900", "font-bold", "underline");
            
            tripState.orderType = this.dataset.sort;
            tripState.pageNo = 1;
            fetchList();
        });
    });
}

// [조회] 시도(CTPV) 목록 로드
function fetchAreaTags() {
    fetch('/trip/getCtpvList.do')
        .then(res => res.json())
        .then(areas => {
            const container = document.getElementById("main-region-tags");
            if (!container) return;
            let html = `<button class="area-tag text-orange-500 font-bold border-b-2 border-orange-500 pb-1 cursor-pointer" onclick="handleCityClick(0, '전체', this)">#전체</button>`;
            html += areas.map(area => `
                <button class="area-tag text-gray-400 hover:text-orange-500 pb-1 transition-all cursor-pointer" 
                        onclick="handleCityClick(${area.tripCtpv}, '${area.tripCtpvNm}', this)">
                    #${area.tripCtpvNm}
                </button>
            `).join("");
            container.innerHTML = html;
        });
}

// [기능] 시도 클릭 -> 군구 로드 및 필터 적용
function handleCityClick(ctpvCode, ctpvNm, btnElem) {
    document.querySelectorAll(".area-tag").forEach(b => {
        b.classList.remove("text-orange-500", "font-bold", "border-b-2", "border-orange-500");
        b.classList.add("text-gray-400");
    });
    btnElem.classList.replace("text-gray-400", "text-orange-500");
    btnElem.classList.add("font-bold", "border-b-2", "border-orange-500");

    tripState.tripCtpv = parseInt(ctpvCode);
    tripState.tripGungu = 0; 
    tripState.pageNo = 1;
    document.getElementById("view-title").innerText = ctpvNm;

    const subContainer = document.getElementById("sub-region-tags");
    if (tripState.tripCtpv === 0) {
        subContainer.classList.add("hidden");
        fetchList(); 
        return;
    }

    // 군구(GNGU) 데이터 fetch (AreaVO 필드명 사용)
    fetch(`/trip/getGnguList.do?tripCtpv=${tripState.tripCtpv}`)
        .then(res => res.json())
        .then(gngus => {
            if(gngus && gngus.length > 0) {
                subContainer.classList.remove("hidden");
                let html = `<button onclick="handleGnguClick(0, this)" class="gngu-btn font-bold text-gray-900 cursor-pointer">전체</button>`;
                html += gngus.map(g => `
                    <button onclick="handleGnguClick(${g.tripGungu}, this)" class="gngu-btn hover:text-gray-900 cursor-pointer">
                        ${g.tripGunguNm}
                    </button>
                `).join("");
                subContainer.innerHTML = html;
            } else {
                subContainer.classList.add("hidden");
            }
            fetchList(); 
        });
}

// [기능] 군구 클릭
function handleGnguClick(gnguCode, btnElem) {
    document.querySelectorAll(".gngu-btn").forEach(b => b.classList.remove("font-bold", "text-gray-900"));
    btnElem.classList.add("font-bold", "text-gray-900");
    tripState.tripGungu = parseInt(gnguCode);
    tripState.pageNo = 1;
    fetchList();
}

// [기능] 테마 클릭 (TripVO tripTag 연동)
function filterTheme(tag, btnElem) {
    const isSame = (tripState.tripTag === tag);
    
    document.querySelectorAll(".theme-btn").forEach(b => {
        b.classList.remove("text-orange-600", "font-bold");
        b.classList.add("text-gray-400");
    });

    if (isSame) {
        tripState.tripTag = ""; 
    } else {
        tripState.tripTag = tag;
        btnElem.classList.replace("text-gray-400", "text-orange-600");
        btnElem.classList.add("font-bold");
    }
    tripState.pageNo = 1;
    fetchList();
}

// [메인] 데이터 fetch 및 화면 갱신
function fetchList() {
    const params = new URLSearchParams(tripState).toString();
    fetch(`/trip/doRetrieveJson.do?${params}`)
        .then(res => res.json())
        .then(data => {
            renderDestList(data);
            const totalCount = data.length > 0 ? (data[0].totalCnt || 0) : 0;
            document.getElementById("total-count").innerText = totalCount;
            renderPagination(totalCount);
        })
        .catch(err => console.error("데이터 로드 실패:", err));
}

// [렌더링] 리스트 출력
function renderDestList(list) {
    const container = document.getElementById("dest-list");
    if (!container) return;
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="py-20 text-center text-gray-400 font-medium font-bold">검색 결과가 없습니다.</div>';
        return;
    }

    const defaultImg = 'https://via.placeholder.com/400x300?text=No+Image';

    container.innerHTML = list.map(item => `
        <div class="group flex flex-col md:flex-row gap-6 p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all cursor-pointer" 
             onclick="location.href='/trip/trip_view?tripContsId=${item.tripContsId}'">
            <div class="shrink-0 overflow-hidden rounded-2xl w-full md:w-64 h-44 bg-gray-50">
                <img src="${item.tripPathNm || defaultImg}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onerror="this.onerror=null; this.src='${defaultImg}';">
            </div>
            <div class="flex flex-col justify-center flex-1">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">${item.tripNm}</h3>
                    <span class="text-gray-400 text-sm font-medium">
                        ${item.tripAddr ? item.tripAddr.split(' ').slice(0,2).join(' ') : ''}
                    </span>
                </div>
                <div class="mb-4">
                    <span class="px-3 py-1 bg-orange-50 text-orange-600 font-bold text-xs rounded-lg border border-orange-100">
                        ${item.tripTag || '관련 테마 없음'}
                    </span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span class="flex items-center gap-1"><i data-lucide="eye" size="14"></i> 조회 ${item.tripInqCnt || 0}</span>
                </div>
            </div>
        </div>
    `).join("");
    
    if (window.lucide) lucide.createIcons();
}

// [렌더링] 페이징
function renderPagination(totalCnt) {
    const totalPage = Math.ceil(totalCnt / tripState.pageSize);
    const container = document.getElementById("pagination");
    if (!container || totalPage <= 1) { if(container) container.innerHTML = ""; return; }

    const curr = tripState.pageNo;
    const startPage = Math.max(1, curr - 2);
    const endPage = Math.min(totalPage, startPage + 4);

    let html = "";
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button onclick="movePage(${i})" 
                class="w-10 h-10 border rounded-xl flex items-center justify-center transition-all cursor-pointer
                ${i === curr ? 'bg-gray-900 text-white font-bold' : 'text-gray-400 bg-white hover:border-gray-900'}">
                ${i}
            </button>`;
    }
    container.innerHTML = html;
}

function movePage(num) {
    tripState.pageNo = num;
    fetchList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderThemeTags() {
    fetch('/trip/getTripTags.do')
        .then(res => res.json())
        .then(tags => {
            const container = document.getElementById("theme-tags");
            if (!container || !tags) return;

            container.innerHTML = tags.map(tag => `
                <button onclick="filterTheme('${tag}', this)" 
                        class="theme-btn hover:text-orange-500 transition-colors cursor-pointer text-gray-400">
                    #${tag}
                </button>
            `).join("");
        })
}