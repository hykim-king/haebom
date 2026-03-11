/**
 * trip_course.js
 * 여행 코스 목록 페이지 (코스 카드 + 검색 + 페이징)
 */

// ─────────────────────────────────────────
// 상태 변수
// ─────────────────────────────────────────
let currentPage   = 1;
const PAGE_SIZE   = 9;
let totalCount    = 0;
let currentFilter = {};

// ─────────────────────────────────────────
// 초기화
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadList();
    lucide.createIcons();
});

// ─────────────────────────────────────────
// 1. 목록 불러오기
// ─────────────────────────────────────────
function loadList(page) {
    if (page !== undefined) currentPage = page;

    var params = new URLSearchParams({
        pageNo:   currentPage,
        pageSize: PAGE_SIZE
    });

    if (currentFilter.searchDiv)  params.append('searchDiv',  currentFilter.searchDiv);
    if (currentFilter.searchWord) params.append('searchWord', currentFilter.searchWord);

    fetch('/course/doRetrieveJson.do?' + params)
        .then(function(r) { return r.json(); })
        .then(function(list) {
            list = list || [];
            totalCount = list.length > 0 ? (list[0].totalCnt || 0) : 0;

            document.getElementById('total-count').textContent = totalCount;

            var container = document.getElementById('dest-list');
            container.innerHTML = '';

            if (list.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-16 text-sm">검색 결과가 없습니다.</p>';
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            list.forEach(function(item) {
                container.insertAdjacentHTML('beforeend', buildCard(item));
            });

            renderPaging();
            lucide.createIcons();
        })
        .catch(function(err) {
            console.error('코스 목록 조회 실패:', err);
        });
}

// ─────────────────────────────────────────
// 2. 코스 카드 HTML 생성
// ─────────────────────────────────────────
function buildCard(item) {
    var imgSrc = item.coursePathNm || 'https://placehold.co/400x220?text=No+Image';
    var courseNm   = escHtml(item.courseNm   || '코스명 없음');
    var courseInfo = escHtml(item.courseInfo  || '');
    var dstnc  = item.courseDstnc  ? escHtml(item.courseDstnc)  : null;
    var reqTm  = item.courseReqTm  ? escHtml(item.courseReqTm)  : null;

    var badgeHtml = '';
    if (dstnc) {
        badgeHtml += '<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">'
            + '<i data-lucide="map" size="11" class="inline"></i> ' + dstnc + '</span>';
    }
    if (reqTm) {
        badgeHtml += '<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">'
            + '<i data-lucide="clock" size="11" class="inline"></i> ' + reqTm + '</span>';
    }

    return '<a href="/course/course_view?courseNo=' + item.courseNo + '" class="block group">'
        +   '<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200">'
        +     '<div class="relative overflow-hidden" style="height:180px;">'
        +       '<img src="' + imgSrc + '" alt="' + courseNm + '"'
        +            ' class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"'
        +            ' onerror="this.onerror=null;this.src=\'https://placehold.co/400x220?text=No+Image\'">'
        +     '</div>'
        +     '<div class="p-4">'
        +       '<h3 class="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">' + courseNm + '</h3>'
        +       (courseInfo ? '<p class="text-xs text-gray-500 line-clamp-2 mb-3">' + courseInfo + '</p>' : '<div class="mb-3"></div>')
        +       '<div class="flex flex-wrap gap-2">' + badgeHtml + '</div>'
        +     '</div>'
        +   '</div>'
        + '</a>';
}

// ─────────────────────────────────────────
// 3. 페이징
// ─────────────────────────────────────────
function renderPaging() {
    var totalPages = Math.ceil(totalCount / PAGE_SIZE);
    var el = document.getElementById('pagination');
    if (!el) return;

    if (totalPages <= 1) { el.innerHTML = ''; return; }

    var html = '<div class="flex justify-center items-center gap-1 mt-10">';

    // 이전 버튼
    if (currentPage > 1) {
        html += '<button onclick="loadList(' + (currentPage - 1) + ')"'
            + ' class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">'
            + '<i data-lucide="chevron-left" size="16"></i></button>';
    }

    // 페이지 번호 (최대 5개)
    var startPage = Math.max(1, currentPage - 2);
    var endPage   = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (var p = startPage; p <= endPage; p++) {
        var isActive = p === currentPage;
        html += '<button onclick="loadList(' + p + ')"'
            + ' class="px-3 py-2 rounded-lg text-sm font-medium ' + (isActive ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50') + '">'
            + p + '</button>';
    }

    // 다음 버튼
    if (currentPage < totalPages) {
        html += '<button onclick="loadList(' + (currentPage + 1) + ')"'
            + ' class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">'
            + '<i data-lucide="chevron-right" size="16"></i></button>';
    }

    html += '</div>';
    el.innerHTML = html;
    lucide.createIcons();
}

// ─────────────────────────────────────────
// 4. 검색 / 필터
// ─────────────────────────────────────────
function handleSearch(value) {
    currentFilter = value.trim()
        ? { searchDiv: '10', searchWord: value.trim() }
        : {};
    document.getElementById('view-title').textContent = value.trim() ? '"' + value.trim() + '"' : '전체';
    loadList(1);
}

function resetFilters() {
    currentFilter = {};
    document.getElementById('search-input').value = '';
    document.getElementById('view-title').textContent = '전체';
    loadList(1);
}

function setOrderType(type) {
    currentFilter = Object.assign({}, currentFilter, { orderType: type });
    loadList(1);
}

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}