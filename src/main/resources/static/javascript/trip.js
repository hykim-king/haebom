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
    // 1. Lucide 아이콘 초기화 (공통)
    if (window.lucide) lucide.createIcons();

    // 2. 리스트 페이지 전용 초기화 (요소가 있을 때만 실행)
    if (document.getElementById("search-input")) {
        initListPage();
    }
    // 상세 페이지에만 있는 'detail-list' ID를 체크합니다.
    const detailList = document.getElementById("detail-list");
    if (detailList) {
        // Thymeleaf가 렌더링한 hidden input이나 URL 파라미터에서 ID를 가져와야 합니다.
        // 가장 쉬운 방법은 HTML 어딘가에 ID를 심어두는 것입니다.
        const tripId = document.querySelector('input[name="tripContsId"]')?.value
            || new URLSearchParams(window.location.search).get('tripContsId');

        if (tripId) {
            fetchDetailData(tripId);
            initFavorite(tripId);
        }
    }
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
    // 리셋 버튼 클릭 이벤트 (모든 필터 초기화)
    const clearBtn = document.getElementById("clear-btn");

    clearBtn?.addEventListener("click", () => {
        // 1. 입력창 텍스트 비우기
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";

        // 2. 상태(State) 모두 초기값으로 되돌리기
        tripState.searchWord = "";
        tripState.tripTag = ""; // 테마 초기화
        tripState.tripCtpv = 0;  // 시도 초기화
        tripState.tripGungu = 0;  // 군구 초기화
        tripState.pageNo = 1;  // 1페이지로

        // 3. UI 텍스트 복구
        document.getElementById("view-title").innerText = "전체";
        document.getElementById("sub-region-tags").classList.add("hidden"); // 군구 목록 숨기기

        // 4. 모든 버튼의 활성화(주황색/굵게) 스타일 제거
        // 지역 버튼, 테마 버튼, 군구 버튼 모두 찾아서 회색으로 변경
        document.querySelectorAll(".area-tag, .theme-btn, .gngu-btn").forEach(btn => {
            btn.classList.remove("text-orange-500", "text-orange-600", "font-bold", "border-b-2", "border-orange-500", "text-gray-900");
            btn.classList.add("text-gray-400");
        });

        // 5. '전체' 지역 버튼만 다시 활성화 상태로 만들기
        const allBtn = document.querySelector(".area-tag"); // 보통 첫 번째 버튼이 '전체'
        if (allBtn) {
            allBtn.classList.replace("text-gray-400", "text-orange-500");
            allBtn.classList.add("font-bold", "border-b-2", "border-orange-500");
        }

        // 6. 즉시 목록 갱신 (서버에는 빈 파라미터들이 전달되어 전체 리스트가 옵니다)
        fetchList();

        // 7. 입력창에 다시 포커스
        searchInput?.focus();
    });

    // 정렬 버튼 클릭 이벤트
    document.querySelectorAll(".sort-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".sort-btn").forEach(b =>
                b.classList.remove("text-gray-900", "font-bold", "underline"));
            this.classList.add("text-gray-900", "font-bold", "underline");

            tripState.orderType = this.dataset.sort;
            tripState.pageNo = 1;
            fetchList();
        });
    });
}

function fetchDetailData(tripContsId) {
    if (!tripContsId) return;

    fetch(`/trip/getTripDetail.do?tripContsId=${tripContsId}`)
        .then(res => res.json())
        .then(detail => {
            console.log("서버 응답 데이터:", detail); // 여기서 데이터가 나오는지 꼭 확인!

            const listContainer = document.getElementById("detail-list");
            if (!listContainer) return;

            // 오른쪽 소개글 영역 업데이트
            const infoElem = document.getElementById("detail-info");
            if (infoElem && detail.tripdtlInfo) {
                infoElem.innerText = detail.tripdtlInfo;
            }

            // 출력할 필드와 라벨 매핑 (TripDetailVO 필드명과 정확히 일치)
            const labelMap = {
                tripdtlTel: { label: '문의처', icon: 'phone' },
                tripdtlOperHr: { label: '이용시간', icon: 'clock' },
                tripdtlDyoffYmd: { label: '휴무일', icon: 'calendar-x' },
                tripdtlPrkPsblty: { label: '주차여부', icon: 'car' },
                tripdtlPet: { label: '반려동물', icon: 'dog' },
                tripdtlCrg: { label: '이용요금', icon: 'credit-card' },
                tripdtlHmpg: { label: '홈페이지', icon: 'globe' },
                tripdtlStroller: { label: '유모차 대여', icon: 'baby' }
            };

            // VO의 모든 필드를 돌면서 값이 있으면 HTML 생성
            Object.keys(labelMap).forEach(key => {
                const value = detail[key];

                // 값이 null이 아니고, 'null' 문자열이 아니고, 빈 값이 아닐 때만!
                if (value && String(value).trim() !== '' && String(value) !== 'null') {
                    const item = labelMap[key];
                    const html = `
                        <div class="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div class="p-2 bg-gray-50 rounded-lg">
                                <i data-lucide="${item.icon}" class="text-gray-400" size="20"></i>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-gray-800">${item.label}</p>
                                <p class="text-gray-500 text-sm mt-1">${value}</p>
                            </div>
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', html);
                }
            });

            // 아이콘 새로고침
            if (window.lucide) lucide.createIcons();
        })
        .catch(err => console.error("AJAX 호출 에러:", err));
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
            if (gngus && gngus.length > 0) {
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
    // 1. 이미 선택된 태그를 다시 눌렀는지 확인 (해제 로직)
    const isSame = (tripState.tripTag === tag);

    // 2. 모든 테마 버튼의 디자인 초기화
    document.querySelectorAll(".theme-btn").forEach(b => {
        b.classList.remove("text-orange-600", "font-bold");
        b.classList.add("text-gray-400");
    });

    if (isSame) {
        // 이미 선택된 걸 다시 누르면 -> 선택 해제 (전체 보기)
        tripState.tripTag = "";
    } else {
        // 새로운 태그 선택
        tripState.tripTag = tag;
        // 선택된 버튼만 강조
        btnElem.classList.remove("text-gray-400");
        btnElem.classList.add("text-orange-600", "font-bold");
    }

    // 3. 페이지 1로 초기화 후 리스트 새로고침
    tripState.pageNo = 1;
    fetchList();
}

// trip.js의 fetchList 함수 수정
function fetchList() {
    const params = new URLSearchParams(tripState).toString();
    fetch(`/trip/doRetrieveJson.do?${params}`)
        .then(res => res.json())
        .then(data => {
            renderDestList(data);
            const totalCount = data.length > 0 ? (data[0].totalCnt || 0) : 0;

            // [수정] 요소가 존재할 때만 innerText 설정 (상세페이지 에러 방지)
            const totalCountElem = document.getElementById("total-count");
            if (totalCountElem) {
                totalCountElem.innerText = totalCount;
            }

            renderPagination(totalCount);
        })
        .catch(err => console.error("데이터 로드 실패:", err)); // 여기서 에러가 잡힘
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
                        ${item.tripAddr ? item.tripAddr.split(' ').slice(0, 2).join(' ') : ''}
                    </span>
                </div>
                <div class="mb-4">
                    <span class="px-3 py-1 bg-orange-50 text-orange-600 font-bold text-xs rounded-lg border border-orange-100">
                        ${item.tripTagNm || '관련 테마 없음'}
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
    if (!container || totalPage <= 1) { if (container) container.innerHTML = ""; return; }

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

// ✅ UI 업데이트 공통 함수 (숫자 반영 로직 포함)
function updateLikeUI(isLiked, count) {
    const icon = document.getElementById("like-icon");
    const countSpan = document.getElementById("like-count");

    if (icon) {
        if (isLiked) {
            icon.classList.add("text-red-500", "fill-current");
        } else {
            icon.classList.remove("text-red-500", "fill-current");
        }
        // Lucide 아이콘 다시 렌더링
        if (window.lucide) lucide.createIcons();
    }

    // 💡 이 부분이 핵심입니다: 서버에서 받은 전체 찜수를 화면에 반영
    if (countSpan && count !== undefined) {
        countSpan.innerText = count;
    }
}

function initFavorite(tripContsId) {

    // 1. 찜 상태(하트 색상) 가져오기
    fetch(`/trip/favoriteStatus.do?tripContsId=${encodeURIComponent(tripContsId)}`)
        .then(res => res.text())
        .then(txt => {
            const exists = parseInt(txt, 10) > 0;
            updateLikeUI(exists); // 초기 로딩 시 상태 반영
        });

    // 2. 총 찜수(숫자) 가져오기
    fetch(`/trip/getCount.do?tripContsId=${encodeURIComponent(tripContsId)}`)
        .then(res => res.text())
        .then(count => {
            const countSpan = document.getElementById("like-count");
            if (countSpan) {
                countSpan.innerText = count; // 0으로 되어있던 숫자를 실제 데이터로 변경
            }
        });
}

function handleLike() {
    const tripContsId = new URLSearchParams(window.location.search).get("tripContsId");
    if (!tripContsId) return;

    const icon = document.getElementById("like-icon");
    const isAdding = !icon.classList.contains("text-red-500");

    if (!confirm(isAdding ? "찜 목록에 추가하시겠습니까?" : "찜을 취소하시겠습니까?")) return;

    fetch(`/trip/toggleFavorite.do?tripContsId=${encodeURIComponent(tripContsId)}`)
        .then(res => res.json())
        .then(data => {
            const status = data[0];
            const userTotal = data[1];
            const tripTotal = data[2]; // 서버에서 보낸 해당 여행지의 전체 찜수

            if (status === -1) {
                alert("로그인이 필요합니다.");
                return;
            }

            if (status === 1) {
                if (isAdding && userTotal > 10) {
                    alert("찜 목록이 가득 찼습니다! (최대 10개)");
                    fetch(`/trip/toggleFavorite.do?tripContsId=${encodeURIComponent(tripContsId)}`);
                    return;
                }

                // ✅ 성공 시 하트 상태와 'tripTotal(전체 찜수)'을 함께 전달
                updateLikeUI(isAdding, tripTotal);
                alert(isAdding ? "찜 목록에 추가되었습니다." : "찜이 취소되었습니다.");
            }
        })
        .catch(err => alert("처리에 실패했습니다."));
}