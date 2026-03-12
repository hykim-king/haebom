const tripCourseState = {
    pageNo: 1,
    pageSize: 7,
    searchWord: "",
    orderType: "new"
};

document.addEventListener("DOMContentLoaded", function () {
    initEvent();
    doRetrieve();
});

function initEvent() {
    const searchInput = document.getElementById("search-input");
    const resetBtn = document.getElementById("reset-btn");
    const sortBtns = document.querySelectorAll(".sort-btn");

    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(() => {
                tripCourseState.searchWord = e.target.value.trim();
                tripCourseState.pageNo = 1;
                doRetrieve();
            }, 300);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            tripCourseState.pageNo = 1;
            tripCourseState.pageSize = 7;
            tripCourseState.searchWord = "";
            tripCourseState.orderType = "new";

            if (searchInput) {
                searchInput.value = "";
            }

            updateSortButtonUI();
            doRetrieve();
        });
    }

        sortBtns.forEach((btn) => {
            btn.addEventListener("click", function () {
                const sortType = this.dataset.sort;

                tripCourseState.orderType = sortType;
                tripCourseState.pageNo = 1;

                updateSortButtonUI();
                doRetrieve();
            });
        });
}

function updateSortButtonUI() {
    const sortBtns = document.querySelectorAll(".sort-btn");

    sortBtns.forEach((btn) => {
        if (btn.dataset.sort === tripCourseState.orderType) {
            btn.classList.remove("text-gray-400");
            btn.classList.add("text-gray-900", "font-bold", "underline");
        } else {
            btn.classList.remove("text-gray-900", "font-bold", "underline");
            btn.classList.add("text-gray-400");
        }
    });
}

function doRetrieve() {
    const params = new URLSearchParams({
        pageNo: tripCourseState.pageNo,
        pageSize: tripCourseState.pageSize,
        searchWord: tripCourseState.searchWord,
        orderType: tripCourseState.orderType
    });

    fetch(`/trip_course/doRetrieve.do?${params.toString()}`, {
        method: "GET"
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("목록 조회 실패");
            }
            return response.json();
        })
        .then((data) => {
            renderDestList(data);

            const totalCnt = data && data.length > 0 ? Number(data[0].totalCnt) : 0;
            renderTotalCount(totalCnt);
            renderPagination(totalCnt);
        })
        .catch((error) => {
            console.error("doRetrieve error:", error);
            renderDestList([]);
            renderTotalCount(0);
            renderPagination(0);
        });
}

function renderDestList(data) {
    const destList = document.getElementById("dest-list");
    if (!destList) return;

    if (!data || data.length === 0) {
        destList.innerHTML = `
            <div class="text-center text-gray-500 py-10 border rounded-xl bg-gray-50">
                조회된 여행코스가 없습니다.
            </div>
        `;
        return;
    }

    let html = "";

    data.forEach((item) => {
        const imagePath = item.coursePathNm ? escapeHtml(item.coursePathNm) : "/images/no-image.png";
        const courseNm = item.courseNm ? escapeHtml(item.courseNm) : "코스명 없음";
        const courseNo = item.courseNo ?? "";
        const courseInqCnt = item.courseInqCnt ?? 0;

            html += `
            <article class="course-list-item" onclick="goCourseDetail(${courseNo})">
                <div class="course-thumb-wrap">
                    <img class="course-thumb"
                        src="${imagePath}"
                        alt="${courseNm}"
                        onerror="this.onerror=null; this.src='/images/no-image.png';">
                </div>

                <div class="course-body">
                    <div class="course-head">
                        <div>
                            <h3 class="course-title">${courseNm}</h3>

                            <div class="flex items-center gap-4 text-xs text-gray-400 mt-3">
                                <span class="flex items-center gap-1">
                                    <i data-lucide="eye" size="14"></i>
                                    조회 ${courseInqCnt}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    });

    destList.innerHTML = html;

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderTotalCount(totalCnt) {
    const totalCountEl = document.getElementById("total-count");
    if (totalCountEl) {
        totalCountEl.textContent = totalCnt.toLocaleString();
    }
}

function renderPagination(totalCnt) {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    const pageSize = tripCourseState.pageSize;
    const currentPage = tripCourseState.pageNo;
    const totalPage = Math.ceil(totalCnt / pageSize);
    const pageBlockSize = 5;

    if (totalPage === 0) {
        paginationEl.innerHTML = "";
        return;
    }

    const currentBlock = Math.ceil(currentPage / pageBlockSize);
    const startPage = (currentBlock - 1) * pageBlockSize + 1;
    const endPage = Math.min(startPage + pageBlockSize - 1, totalPage);

    let html = "";

    // 이전 페이지 그룹
    if (startPage > 1) {
        const prevBlockPage = startPage - 1;
        html += `
            <button type="button"
                    class="page-btn px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100"
                    onclick="movePage(${prevBlockPage})">
                &lt;
            </button>
        `;
    }

    // 페이지 번호 1~5
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100";

        html += `
            <button type="button"
                    class="page-btn min-w-[44px] h-[44px] rounded-xl border ${activeClass}"
                    onclick="movePage(${i})">
                ${i}
            </button>
        `;
    }

    // 다음 페이지 그룹
    if (endPage < totalPage) {
        const nextBlockPage = endPage + 1;
        html += `
            <button type="button"
                    class="page-btn px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100"
                    onclick="movePage(${nextBlockPage})">
                &gt;
            </button>
        `;
    }

    paginationEl.innerHTML = html;
}

function movePage(pageNo) {
    tripCourseState.pageNo = pageNo;
    doRetrieve();
}

function goCourseDetail(courseNo) {
    fetch(`/trip_course/doUpdateInqCnt.do?courseNo=${courseNo}`, {
        method: "GET"
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("조회수 증가 실패");
            }
            return response.text();
        })
        .then(() => {
            location.href = `/trip_course/detail?courseNo=${courseNo}`;
        })
        .catch((error) => {
            console.error("doUpdateInqCnt error:", error);

            // 조회수 증가 실패해도 상세페이지는 진입되게 처리
            location.href = `/trip_course/detail?courseNo=${courseNo}`;
        });
}

function escapeHtml(str) {
    if (str === null || str === undefined) return "";

    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}