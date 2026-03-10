const tripCourseState = {
    pageNo: 1,
    pageSize: 10,
    searchWord: "",
    orderType: "new"
};

document.addEventListener("DOMContentLoaded", () => {
    loadLayoutFragments();
    initTripCoursePage();
    createLucideIcons();
});

function loadLayoutFragments() {
    const headerEl = document.getElementById("header");
    const footerEl = document.getElementById("footer");

    if (headerEl) {
        fetch("header.html")
            .then((res) => res.text())
            .then((html) => {
                headerEl.innerHTML = html;
            })
            .catch((err) => console.error("헤더 로드 실패:", err));
    }

    if (footerEl) {
        fetch("footer.html")
            .then((res) => res.text())
            .then((html) => {
                footerEl.innerHTML = html;
            })
            .catch((err) => console.error("푸터 로드 실패:", err));
    }
}

function createLucideIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

function initTripCoursePage() {
    fetchCourseList();
    bindSearchEvent();
    bindSortButtons();
    bindResetButton();
}

function bindSearchEvent() {
    const searchInput = document.getElementById("search-input");
    let searchTimer;

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            tripCourseState.searchWord = e.target.value.trim();
            tripCourseState.pageNo = 1;
            fetchCourseList();
        }, 300);
    });
}

function bindSortButtons() {
    document.querySelectorAll(".sort-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".sort-btn").forEach((b) => {
                b.classList.remove("text-gray-900", "font-bold", "underline");
                b.classList.add("hover:text-gray-900");
            });

            this.classList.add("text-gray-900", "font-bold", "underline");
            this.classList.remove("hover:text-gray-900");

            tripCourseState.orderType = this.dataset.sort;
            tripCourseState.pageNo = 1;

            fetchCourseList();
        });
    });
}

function bindResetButton() {
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.getElementById("search-input");

    if (!resetBtn) return;

    resetBtn.addEventListener("click", () => {
        if (searchInput) {
            searchInput.value = "";
        }

        tripCourseState.pageNo = 1;
        tripCourseState.searchWord = "";
        tripCourseState.orderType = "new";

        document.querySelectorAll(".sort-btn").forEach((btn) => {
            btn.classList.remove("text-gray-900", "font-bold", "underline");
            btn.classList.add("hover:text-gray-900");
        });

        const newBtn = document.querySelector('.sort-btn[data-sort="new"]');
        if (newBtn) {
            newBtn.classList.add("text-gray-900", "font-bold", "underline");
            newBtn.classList.remove("hover:text-gray-900");
        }

        fetchCourseList();
    });
}

function fetchCourseList() {
    const params = new URLSearchParams(tripCourseState).toString();

    fetch(`/trip_course/doRetrieve.do?${params}`)
        .then((res) => res.json())
        .then((data) => {
            renderCourseList(data);

            const totalCount = data.length > 0 ? (data[0].totalCnt || 0) : 0;

            const totalCountElem = document.getElementById("total-count");
            if (totalCountElem) {
                totalCountElem.innerText = totalCount;
            }

            renderCoursePagination(totalCount);
            createLucideIcons();
        })
        .catch((err) => console.error("여행코스 데이터 로드 실패:", err));
}

function renderCourseList(list) {
    const container = document.getElementById("dest-list");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center text-gray-400 font-medium font-bold">
                검색 결과가 없습니다.
            </div>
        `;
        return;
    }

    const defaultImg = "https://via.placeholder.com/400x300?text=No+Image";

    container.innerHTML = list.map((item) => `
        <div class="group flex flex-col md:flex-row gap-6 p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
             onclick="goCourseDetail(${item.courseNo})">

            <div class="shrink-0 overflow-hidden rounded-2xl w-full md:w-64 h-44 bg-gray-50">
                <img src="${item.coursePathNm || defaultImg}"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     onerror="this.onerror=null; this.src='${defaultImg}';">
            </div>

            <div class="flex flex-col justify-center flex-1">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        ${item.courseNm || ""}
                    </h3>
                    <span class="text-gray-400 text-sm font-medium">
                        코스번호 ${item.courseNo || ""}
                    </span>
                </div>

                <div class="mb-3 text-gray-500 text-sm leading-relaxed">
                    ${item.courseInfo || ""}
                </div>

                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span>거리 ${item.courseDstnc || "-"}</span>
                    <span>소요시간 ${item.courseReqTm || "-"}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function renderCoursePagination(totalCnt) {
    const totalPage = Math.ceil(totalCnt / tripCourseState.pageSize);
    const container = document.getElementById("pagination");

    if (!container || totalPage <= 1) {
        if (container) {
            container.innerHTML = "";
        }
        return;
    }

    const curr = tripCourseState.pageNo;
    const startPage = Math.max(1, curr - 2);
    const endPage = Math.min(totalPage, startPage + 4);

    let html = "";

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button type="button"
                    onclick="moveCoursePage(${i})"
                    class="w-10 h-10 border rounded-xl flex items-center justify-center transition-all cursor-pointer
                    ${i === curr ? "bg-gray-900 text-white font-bold" : "text-gray-400 bg-white hover:border-gray-900"}">
                ${i}
            </button>
        `;
    }

    container.innerHTML = html;
}

function moveCoursePage(num) {
    tripCourseState.pageNo = num;
    fetchCourseList();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function goCourseDetail(courseNo) {
    console.log("상세페이지 미구현, courseNo:", courseNo);
}