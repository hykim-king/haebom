/* ===================================
   해봄트립 관리자 페이지 - JavaScript
   Admin Dashboard Functions

   주요 기능:
   1. 사용자 관리 (조회/검색/수정/삭제)
   2. 댓글 관리 (조회/검색/삭제)
   3. 신고 접수 (조회/필터링/상태변경/처리)
   4. 문의사항 (조회/필터링/답변등록)
   5. 데이터 통계 (차트 시각화)
=================================== */
let reportsData = [];

// ===================================
// 초기화 함수 - 페이지 로드 시 실행
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  loadUsers();
  loadReports(1);
  updateReportStats();

  if (window.lucide) {
    lucide.createIcons();
  }
});

// ===================================
// 네비게이션 - 사이드바 메뉴 클릭 처리
// ===================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');

      sections.forEach(section => section.classList.remove('active'));
      const sectionId = this.getAttribute('data-section');
      document.getElementById(`${sectionId}-section`).classList.add('active');

      const titles = {
        'users': '사용자 관리',
        'comments': '댓글 관리',
        'reports': '신고 접수',
        'inquiries': '문의사항',
        'statistics': '데이터 통계'
      };
      document.getElementById('page-title').textContent = titles[sectionId];

      if (sectionId === 'users') loadUsers();
      if (sectionId === 'comments') loadComments();
      if (sectionId === 'reports') {
        filterReports();
        updateReportStats();
      }
      if (sectionId === 'inquiries') loadInquiries(1);
      if (sectionId === 'statistics') initStatistics();

      if (window.lucide) lucide.createIcons();
    });
  });
}

// ===================================
// 사용자 관리 - 목록 조회 및 페이징
// ===================================
let currentUsersPage = 1;

function loadUsers(page = 1) {
  currentUsersPage = page;

  fetch(`/admin/users/api`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('users-table-body');

        tbody.innerHTML = data.map(user => `
        <tr>
          <td>${user.userNo}</td>
          <td>${user.userEmlAddr}</td>
          <td>${user.userNick}</td>
          <td>${user.userNm ?? ''}</td>
          <td>
            <span class="badge ${user.userDrmYn === 'Y' ? 'bg-secondary' : 'bg-success'}">
              ${user.userDrmYn === 'Y' ? '휴면' : '활동'}
            </span>
          </td>
          <td class="d-flex gap-2">
            <select id="status-${user.userNo}" class="form-select form-select-sm">
              <option value="N" ${user.userDrmYn === 'N' ? 'selected' : ''}>활동</option>
              <option value="Y" ${user.userDrmYn === 'Y' ? 'selected' : ''}>휴면</option>
            </select>
            <button class="btn btn-sm btn-warning" onclick="updateUserStatus(${user.userNo})">저장</button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.userNo})">삭제</button>
          </td>
        </tr>
      `).join('');
      })
      .catch(error => {
        console.error('목록 조회 실패:', error);
        document.getElementById('users-table-body').innerHTML =
            '<tr><td colspan="6" class="text-center text-danger">데이터 로드 중 오류가 발생했습니다.</td></tr>';
      });
}

function updateUserStatus(userNo) {
  const status = document.getElementById(`status-${userNo}`).value;

  if (!confirm('상태를 변경하시겠습니까?')) return;

  const token = document.querySelector('meta[name="_csrf"]').content;
  const header = document.querySelector('meta[name="_csrf_header"]').content;

  fetch(`/admin/users/${userNo}/status?status=${status}`, {
    method: 'PATCH',
    headers: { [header]: token }
  })
      .then(response => {
        if (response.ok) {
          alert('상태가 변경되었습니다.');
          loadUsers(currentUsersPage);
        } else {
          alert(`상태 변경 실패: ${response.status}`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
      });
}

function deleteUser(userNo) {
  if (!confirm('정말로 삭제하시겠습니까? 데이터는 복구되지 않습니다.')) return;

  const token = document.querySelector('meta[name="_csrf"]').content;
  const header = document.querySelector('meta[name="_csrf_header"]').content;

  fetch(`/admin/users/${userNo}`, {
    method: 'DELETE',
    headers: { [header]: token }
  })
      .then(response => {
        if (response.ok) {
          alert('삭제가 완료되었습니다.');
          loadUsers(1);
        } else {
          alert('삭제 실패');
        }
      })
      .catch(error => console.error('Error:', error));
}

// ===================================
// 댓글 관리 - 목록 조회 및 페이징
// ===================================
let currentCommentsPage = 1;
const commentsPerPage = 10;
let currentCommentSearchDiv = '';
let currentCommentSearchWord = '';
let currentCommentsTotalCnt = 0;

function loadComments(page = 1) {
  currentCommentsPage = page;

  const params = new URLSearchParams({
    pageNo: currentCommentsPage,
    pageSize: commentsPerPage,
    searchDiv: currentCommentSearchDiv,
    searchWord: currentCommentSearchWord
  });

  fetch(`/admin/comments/api?${params.toString()}`)
      .then(response => {
        if (!response.ok) throw new Error('댓글 목록 조회 실패');
        return response.json();
      })
      .then(data => {
        const list = data.list || [];
        currentCommentsTotalCnt = data.totalCnt || 0;

        renderCommentsTable(list);
        renderCommentsPagination(currentCommentsTotalCnt, currentCommentsPage, commentsPerPage);
      })
      .catch(error => {
        console.error('댓글 목록 조회 오류:', error);
        document.getElementById('comments-table-body').innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            댓글 데이터를 불러오는 중 오류가 발생했습니다.
          </td>
        </tr>
      `;
        document.getElementById('comments-pagination').innerHTML = '';
      });
}

function renderCommentsTable(list) {
  const tbody = document.getElementById('comments-table-body');

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">조회된 댓글이 없습니다.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(comment => {
    const cmtNo = comment.cmtNo ?? comment.CMTNO;
    const cmtCn = comment.cmtCn ?? comment.CMTCN;
    const cmtStarng = comment.cmtStarng ?? comment.CMTSTARNG;
    const cmtClsf = comment.cmtClsf ?? comment.CMTCLSF;
    const cmtHideYn = comment.cmtHideYn ?? comment.CMTHIDEYN ?? 'N';
    const tripCourseNo = comment.tripCourseNo ?? comment.TRIPCOURSENO;
    const cmtReg = comment.cmtReg ?? comment.CMTREG;

    const clsfText =
        cmtClsf == 1 ? '여행지' :
            cmtClsf == 2 ? '여행코스' : '';

    const detailUrl =
        cmtClsf == 1
            ? `/trip/trip_view?tripContsId=${tripCourseNo}`
            : cmtClsf == 2
                ? `/course/course_view?courseNo=${tripCourseNo}`
                : '#';

    const tripCourseCell = tripCourseNo
        ? `<a href="${detailUrl}">${tripCourseNo}</a>`
        : '';

    return `
      <tr>
        <td class="text-truncate" style="max-width: 250px;">${cmtCn ?? ''}</td>
        <td>${cmtStarng ?? ''}</td>
        <td>${clsfText}</td>
        <td>
          <span class="badge ${cmtHideYn === 'Y' ? 'bg-secondary' : 'bg-success'}">
            ${cmtHideYn === 'Y' ? '숨김' : '노출'}
          </span>
        </td>
        <td>${tripCourseCell}</td>
        <td>${cmtReg ?? ''}</td>
        <td>
          <button
            class="btn btn-sm ${cmtHideYn === 'Y' ? 'btn-success' : 'btn-warning'}"
            onclick="toggleCommentHide(${cmtNo}, '${cmtHideYn}')">
            <i data-lucide="${cmtHideYn === 'Y' ? 'eye' : 'eye-off'}"></i>
            ${cmtHideYn === 'Y' ? '노출' : '숨김'}
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function searchComments(page = 1) {
  currentCommentSearchDiv = document.getElementById('comment-search-div').value;
  currentCommentSearchWord = document.getElementById('comment-search-word').value.trim();
  loadComments(page);
}

function resetCommentSearch() {
  document.getElementById('comment-search-div').value = '';
  document.getElementById('comment-search-word').value = '';
  currentCommentSearchDiv = '';
  currentCommentSearchWord = '';
  loadComments(1);
}

function toggleCommentHide(cmtNo, currentHideYn) {
  const nextHideYn = currentHideYn === 'Y' ? 'N' : 'Y';
  const actionText = nextHideYn === 'Y' ? '숨김 처리' : '노출 처리';

  if (!confirm(`댓글을 ${actionText} 하시겠습니까?`)) return;

  const tokenMeta = document.querySelector('meta[name="_csrf"]');
  const headerMeta = document.querySelector('meta[name="_csrf_header"]');
  const headers = {};

  if (tokenMeta && headerMeta) {
    headers[headerMeta.content] = tokenMeta.content;
  }

  fetch(`/admin/comments/${cmtNo}/hide?cmtHideYn=${nextHideYn}`, {
    method: 'PATCH',
    headers: headers
  })
      .then(response => {
        if (!response.ok) throw new Error(`${actionText} 실패`);
        return response.text();
      })
      .then(() => {
        alert(`${actionText}되었습니다.`);
        loadComments(currentCommentsPage);
      })
      .catch(error => {
        console.error('숨김 상태 변경 오류:', error);
        alert(`${actionText} 중 오류가 발생했습니다.`);
      });
}

function renderCommentsPagination(totalCnt, pageNo, pageSize) {
  const totalPages = Math.ceil(totalCnt / pageSize);
  const pagination = document.getElementById('comments-pagination');

  if (totalPages <= 0) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === pageNo ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadComments(${i}); return false;">${i}</a>
      </li>
    `;
  }

  pagination.innerHTML = html;
}

// ===================================
// 신고 접수 - 목록 조회 및 필터링
// ===================================
let currentReportsPage = 1;
const reportsPerPage = 20;

function loadReports(page = 1) {
  currentReportsPage = page;

  const statusRaw = document.getElementById('report-status-filter').value;
  const typeRaw = document.getElementById('report-type-filter').value;

  const statusMap = { all: '', pending: 'N', completed: 'Y' };
  const typeMap = { all: '', spam: '10', abuse: '20', inappropriate: '30', etc: '50' };

  const repStatYn = statusMap[statusRaw] ?? '';
  const repClsf = typeMap[typeRaw] ?? '';

  const params = new URLSearchParams({ pageNo: page, pageSize: reportsPerPage });
  if (repStatYn) params.append('repStatYn', repStatYn);
  if (repClsf) params.append('repClsf', repClsf);

  fetch(`/admin/reports/list?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
        renderReportsTable(data.list || []);
        renderReportsPagination(data.totalCnt || 0);
      })
      .catch(err => {
        console.error("신고 목록 로드 오류:", err);
        const tbody = document.getElementById('reports-table-body');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">데이터 로드 실패</td></tr>';
        }
      });
}

function renderReportsTable(reports) {
  const tbody = document.getElementById('reports-table-body');
  if (!tbody) return;

  if (!reports || reports.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">조회된 신고 내역이 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = reports.map(report => {
    const rNo = report.REPNO ?? report.repNo;
    const rCn = report.REPCN ?? report.repCn;
    const rStat = report.REPSTATYN ?? report.repStatYn;
    const rClsf = report.REPCLSF ?? report.repClsf;
    const rReg = report.REPREG ?? report.repReg;
    const cmtNo = report.CMTNO ?? report.cmtNo;
    const regNo = report.REGNO ?? report.regNo;

    return `
      <tr>
        <td>${rNo}</td>
        <td>${getReportTypeText(rClsf)}</td>
        <td>댓글 #${cmtNo}</td>
        <td class="text-truncate" style="max-width: 200px;">${rCn}</td>
        <td>${regNo}</td>
        <td>${rReg}</td>
        <td>
          <span class="badge ${rStat === 'N' ? 'bg-warning' : 'bg-success'}">
            ${rStat === 'N' ? '대기중' : '처리완료'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="viewReportDetail(${rNo})">상세</button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function updateReportStats() {
  fetch('/admin/reports/stats')
      .then(res => res.json())
      .then(data => {
        const elPending = document.getElementById('pending-reports-count');
        const elToday = document.getElementById('today-reports-count');
        const elWeek = document.getElementById('week-completed-count');

        if (elPending) elPending.textContent = data.pendingCount || 0;
        if (elToday) elToday.textContent = data.todayCount || 0;
        if (elWeek) elWeek.textContent = data.weekSuccessCount || 0;
      })
      .catch(err => {
        console.error("통계 업데이트 오류:", err);
      });
}

function viewReportDetail(repNo) {
  fetch(`/admin/reports/${repNo}`)
      .then(res => res.json())
      .then(data => {
        const elNo = document.getElementById('modalRepNo');
        const elCn = document.getElementById('modalRepCn');
        const elCmt = document.getElementById('modalCmtCn');
        const elStat = document.getElementById('modalRepStat');
        const btn = document.getElementById('processReportBtn');

        if (elNo) elNo.textContent = data.repNo;
        if (elCn) elCn.textContent = data.repCn;
        if (elCmt) elCmt.textContent = data.cmtCn || "삭제된 댓글이거나 내용을 불러올 수 없습니다.";

        if (elStat) {
          elStat.textContent = data.repStatYn === 'Y' ? '처리완료' : '미처리';
          elStat.className = data.repStatYn === 'Y' ? 'badge bg-success' : 'badge bg-warning';
        }

        if (btn) {
          if (data.repStatYn === 'Y') {
            btn.style.display = 'none';
          } else {
            btn.style.display = 'block';
            btn.onclick = function() {
              if (confirm("이 신고를 처리 완료하시겠습니까?")) {
                executeProcess(data.repNo);
              }
            };
          }
        }

        const modalEl = document.getElementById('reportDetailModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      })
      .catch(err => console.error("상세조회 에러:", err));
}

function executeProcess(repNo) {
  const csrfMeta = document.querySelector('meta[name="_csrf"]');
  const csrfHeaderMeta = document.querySelector('meta[name="_csrf_header"]');

  if (!csrfMeta || !csrfHeaderMeta) {
    alert("CSRF 메타 태그를 찾을 수 없습니다.");
    return;
  }

  const token = csrfMeta.getAttribute('content');
  const header = csrfHeaderMeta.getAttribute('content');

  fetch('/admin/reports/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [header]: token
    },
    body: JSON.stringify({
      repNo: repNo,
      repStatYn: 'Y'
    })
  })
      .then(async res => {
        if (res.ok) {
          alert("신고 처리가 완료되었습니다.");
          const modalEl = document.getElementById('reportDetailModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();

          loadReports(currentReportsPage);
          updateReportStats();
        } else {
          const text = await res.text();
          console.error("처리 실패 응답:", res.status, text);
          alert(`처리 실패: ${res.status}`);
        }
      })
      .catch(err => {
        console.error(err);
        alert("처리 중 오류가 발생했습니다.");
      });
}

function deleteReportedContent() {
  if (confirm('신고된 콘텐츠를 삭제하시겠습니까?')) {
    alert('신고된 콘텐츠가 삭제되었습니다.');

    const id = parseInt(document.getElementById('report-id').value);
    const reportIndex = reportsData.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      reportsData[reportIndex].status = 'completed';
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('reportDetailModal'));
    modal.hide();
  }
}

function renderReportsPagination(totalCnt) {
  const totalPages = Math.ceil(totalCnt / reportsPerPage);
  const pagination = document.getElementById('reports-pagination');
  if (!pagination) return;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentReportsPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadReports(${i}); return false;">${i}</a>
      </li>
    `;
  }
  pagination.innerHTML = html;
}

function filterReports() {
  loadReports(1);
}

function getReportTypeText(type) {
  switch (String(type)) {
    case '10': return '스팸';
    case '20': return '욕설/비방';
    case '30': return '부적절한 내용';
    case '40': return '음란성/선정성';
    case '50': return '기타';
    default: return '-';
  }
}

// ===================================
// 문의사항 - 목록 조회 및 답변 등록
// ===================================
let currentInquiriesPage = 1;
const inquiriesPerPage = 20;

function loadInquiries(page = 1) {
  currentInquiriesPage = page;

  const statusFilterEl = document.getElementById('inquiry-status-filter');
  const statusRaw = statusFilterEl ? statusFilterEl.value : 'all';

  const params = new URLSearchParams({
    pageNo: page,
    pageSize: inquiriesPerPage
  });

  if (statusRaw === 'pending') params.append('supYn', 'N');
  if (statusRaw === 'completed') params.append('supYn', 'Y');

  fetch(`/admin/inquiries/api?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('문의 목록 조회 실패');
        return res.json();
      })
      .then(data => {
        const list = data.list || [];
        const tbody = document.getElementById('inquiries-table-body');

        if (!tbody) return;

        if (list.length === 0) {
          tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center">조회된 문의사항이 없습니다.</td>
          </tr>
        `;
          renderInquiriesPagination(0);
          return;
        }

        tbody.innerHTML = list.map(item => `
        <tr>
          <td class="text-truncate" style="max-width:300px">${item.supCn ?? ''}</td>
          <td>${item.supReg ?? ''}</td>
          <td>
            <span class="badge ${item.supYn === 'N' ? 'bg-warning text-dark' : 'bg-success'}">
              ${item.supYn === 'N' ? '답변 대기' : '답변 완료'}
            </span>
          </td>
          <td>
            <button class="btn btn-sm ${item.supYn === 'N' ? 'btn-warning' : 'btn-primary'}"
                    onclick="replyInquiry(${item.supNo}, '${item.supYn}')">
              ${item.supYn === 'N' ? '답변하기' : '보기'}
            </button>
          </td>
        </tr>
      `).join('');

        renderInquiriesPagination(data.totalCnt || 0);
        if (window.lucide) lucide.createIcons();
      })
      .catch(err => {
        console.error("문의 조회 실패:", err);
        const tbody = document.getElementById('inquiries-table-body');
        if (tbody) {
          tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger">문의 데이터를 불러오는 중 오류가 발생했습니다.</td>
          </tr>
        `;
        }
        const pagination = document.getElementById('inquiries-pagination');
        if (pagination) pagination.innerHTML = '';
      });
}

function filterInquiries() {
  loadInquiries(1);
}

function replyInquiry(supNo, supYn) {
  const tokenMeta  = document.querySelector('meta[name="_csrf"]');
  const headerMeta = document.querySelector('meta[name="_csrf_header"]');
  const csrfHeaders = {};
  if (tokenMeta && headerMeta) {
    csrfHeaders[headerMeta.content] = tokenMeta.content;
  }

  fetch('/support/doSelectOne.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...csrfHeaders },
    body: JSON.stringify({ supNo: supNo })
  })
      .then(res => {
        if (!res.ok) throw new Error('문의 상세 조회 실패');
        return res.json();
      })
      .then(inquiry => {
        const isCompleted = (inquiry.supYn ?? supYn) === 'Y';

        // 기본 정보 세팅
        document.getElementById('inquiry-id').value = inquiry.supNo;
        document.getElementById('inquiry-content').textContent = inquiry.supCn ?? '';

        // 모달 제목 & 배지
        const modalLabel = document.getElementById('inquiryReplyModalLabel');
        if (modalLabel) {
          modalLabel.innerHTML = isCompleted
              ? `<span class="badge bg-success me-2">답변 완료</span> 문의 상세보기`
              : `<span class="badge bg-warning text-dark me-2">답변 대기</span> 답변 등록`;
        }

        // 작성자 정보
        const authorEl = document.getElementById('inquiry-author');
        if (authorEl) authorEl.textContent = `작성자: ${inquiry.regNo ?? '-'}`;

        // 작성일 표시
        const dateEl = document.getElementById('inquiry-date');
        if (dateEl) dateEl.textContent = `작성일: ${inquiry.supReg ?? '-'}`;

        if (isCompleted) {
          // ── 답변 완료 모드: 문의 내용 + 답변 내용 읽기 전용 ──
          const replyArea = document.getElementById('inquiry-reply');
          if (replyArea) {
            replyArea.value = inquiry.supAnsCn ?? '';
            replyArea.readOnly = true;
            replyArea.classList.add('bg-light');
          }

          const replyLabel = document.getElementById('inquiry-reply-label');
          if (replyLabel) replyLabel.textContent = '답변 내용';

          const ansDateEl = document.getElementById('inquiry-ans-date');
          if (ansDateEl) {
            ansDateEl.style.display = '';
            ansDateEl.textContent = inquiry.supAnsReg ? `답변일: ${inquiry.supAnsReg}` : '';
          }

          // 제출 버튼 숨기기
          const submitBtn = document.getElementById('inquiry-submit-btn');
          if (submitBtn) submitBtn.style.display = 'none';

        } else {
          // ── 답변 대기 모드: 답변 입력 가능 ──
          const replyArea = document.getElementById('inquiry-reply');
          if (replyArea) {
            replyArea.value = '';
            replyArea.readOnly = false;
            replyArea.classList.remove('bg-light');
            replyArea.placeholder = '답변 내용을 입력해주세요.';
          }

          const replyLabel = document.getElementById('inquiry-reply-label');
          if (replyLabel) replyLabel.textContent = '답변 작성';

          const ansDateEl = document.getElementById('inquiry-ans-date');
          if (ansDateEl) ansDateEl.style.display = 'none';

          const submitBtn = document.getElementById('inquiry-submit-btn');
          if (submitBtn) submitBtn.style.display = '';
        }

        const modal = new bootstrap.Modal(document.getElementById('inquiryReplyModal'));
        modal.show();
      })
      .catch(err => {
        console.error('문의 상세 조회 실패:', err);
        alert('문의 상세 조회 중 오류가 발생했습니다.');
      });
}

function submitInquiryReply() {
  const supNo = parseInt(document.getElementById('inquiry-id').value, 10);
  const reply = document.getElementById('inquiry-reply').value.trim();

  if (!reply) {
    alert('답변 내용을 입력해주세요.');
    return;
  }

  const tokenMeta = document.querySelector('meta[name="_csrf"]');
  const headerMeta = document.querySelector('meta[name="_csrf_header"]');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (tokenMeta && headerMeta) {
    headers[headerMeta.content] = tokenMeta.content;
  }

  fetch(`/admin/inquiries/${supNo}/reply`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      supAnsCn: reply,
      supYn: 'Y'
    })
  })
      .then(res => {
        if (!res.ok) throw new Error('답변 등록 실패');
        return res.text();
      })
      .then(result => {
        if (String(result).trim() === '1') {
          alert('답변이 등록되었습니다.');
          const modal = bootstrap.Modal.getInstance(document.getElementById('inquiryReplyModal'));
          if (modal) modal.hide();
          loadInquiries(currentInquiriesPage);
        } else {
          alert('답변 등록에 실패했습니다.');
        }
      })
      .catch(err => {
        console.error('문의 답변 등록 실패:', err);
        alert('답변 등록 중 오류가 발생했습니다.');
      });
}

function renderInquiriesPagination(totalCnt) {
  const totalPages = Math.ceil(totalCnt / inquiriesPerPage);
  const pagination = document.getElementById('inquiries-pagination');
  if (!pagination) return;

  if (totalPages <= 0) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentInquiriesPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadInquiries(${i}); return false;">${i}</a>
      </li>
    `;
  }
  pagination.innerHTML = html;
}

// ===================================
// 데이터 통계 - 차트 시각화 (AJAX)
// ===================================
let signupChartData = null;
let activityChartData = null;
let reportChartData = null;
let signupChart = null;
let activityChart = null;
let reportTypeChart = null;

function initStatistics() {
  const statisticType = document.getElementById('statistic-type');
  const statisticMonth = document.getElementById('statistic-month');
  const statisticYear = document.getElementById('statistic-year');
  const nowMonth = document.getElementById('nowMonth');

  if (!statisticYear) return;

  // 년도 셀렉트 초기화
  if (statisticYear.options.length === 0) {
    yearSelect();
  }

  // 이벤트 리스너 (중복 방지)
  if (!statisticType._listenerAdded) {
    statisticType.addEventListener('change', function () {
      if (this.value === 'day') {
        statisticMonth.style.display = '';
      } else {
        statisticMonth.style.display = 'none';
      }
    });
    statisticType._listenerAdded = true;
  }

  if (nowMonth && !nowMonth._listenerAdded) {
    nowMonth.addEventListener('click', function () {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      statisticMonth.style.display = '';
      statisticType.value = 'day';
      statisticYear.value = year;
      statisticMonth.value = month;
      statisticsAjax();
    });
    nowMonth._listenerAdded = true;
  }

  statisticsAjax();
}

function yearSelect() {
  const yearSelect = document.getElementById('statistic-year');
  if (!yearSelect) return;
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '';
  for (let i = 0; i <= 5; i++) {
    const year = currentYear - i;
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year + ' 년';
    yearSelect.appendChild(option);
  }
}

function statisticsSearch() {
  statisticsAjax();
}

function statisticsAjax() {
  const statisticType = document.getElementById('statistic-type');
  const statisticYear = document.getElementById('statistic-year');
  const statisticMonth = document.getElementById('statistic-month');

  if (!statisticType || !statisticYear) return;

  const param = {
    type: statisticType.value,
    year: statisticYear.value,
    month: statisticMonth ? statisticMonth.value : '1'
  };

  const token = $('meta[name="_csrf"]').attr('content');
  const header = $('meta[name="_csrf_header"]').attr('content');

  $.ajax({
    url: '/admin/statisticData',
    type: 'POST',
    data: param,
    dataType: 'json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader(header, token);
    },
    success: function (res) {
      if (res.result == 1) {
        signupChartData = res.signupChartData || [];
        activityChartData = res.activityChartData || [];
        reportChartData = res.reportChartData || [];
        initSignupChart();
        initActivityChart();
        initReportTypeChart();
      } else {
        alert(res.message || '통계 데이터를 불러오지 못했습니다.');
      }
    },
    error: function (xhr) {
      let msg = '오류가 발생했습니다.';
      if (xhr.responseJSON && xhr.responseJSON.message) {
        msg += '\nmessage: ' + xhr.responseJSON.message;
      }
      alert(msg);
    }
  });
}

function initSignupChart() {
  const ctx = document.getElementById('signupChart');
  if (!ctx) return;

  const labels = [];
  const data = [];

  const type = document.getElementById('statistic-type').value;
  const year = document.getElementById('statistic-year').value;
  const month = document.getElementById('statistic-month').value;

  for (let i = 0; i < signupChartData.length; i++) {
    if (type === 'month') {
      labels.push(signupChartData[i].MONTH + '월');
    } else {
      labels.push(signupChartData[i].DAY + '일');
    }
    data.push(signupChartData[i].CNT);
  }

  if (type === 'month') {
    document.querySelector('#statistics-section .card .card-header h5').textContent = `${year}년도 회원가입자 수`;
  } else {
    document.querySelector('#statistics-section .card .card-header h5').textContent = `${year}년 ${month}월 회원가입자 수`;
  }

  if (signupChart) {
    signupChart.destroy();
  }

  signupChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '회원가입자 수',
        data: data,
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 20 } } }
    }
  });
}

function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  if (activityChart) {
    activityChart.destroy();
  }

  const currentData = activityChartData.current || [245, 189, 567, 123];
  const previousData = activityChartData.previous || [198, 156, 489, 98];

  activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['댓글', '게시물', '좋아요', '공유'],
      datasets: [{
        label: '이번 달',
        data: currentData,
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        borderRadius: 8
      }, {
        label: '지난 달',
        data: previousData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true, position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function initReportTypeChart() {
  const ctx = document.getElementById('reportTypeChart');
  if (!ctx) return;

  if (reportTypeChart) {
    reportTypeChart.destroy();
  }

  const labels = [];
  const data = [];

  for (let i = 0; i < reportChartData.length; i++) {
    labels.push(reportChartData[i].TYPE);
    data.push(reportChartData[i].CNT);
  }

  reportTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: true, position: 'bottom' } }
    }
  });
}