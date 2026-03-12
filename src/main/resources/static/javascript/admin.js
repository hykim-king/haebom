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
let inquiriesData = [];

// ===================================
// 초기화 함수 - 페이지 로드 시 실행
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  // 네비게이션 이벤트 초기화
  initNavigation();

  // 사용자 관리 페이지 초기 로드 (기본 페이지)
  loadUsers();

  // 신고 통계 미리 계산 (다른 섹션에서도 사용)
  updateReportStats();

  // Lucide 아이콘 초기화
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

      // 모든 메뉴의 활성화 상태 제거
      navItems.forEach(nav => nav.classList.remove('active'));
      // 클릭한 메뉴 활성화
      this.classList.add('active');

      // 모든 섹션 숨기기
      sections.forEach(section => section.classList.remove('active'));
      // 선택한 섹션만 표시
      const sectionId = this.getAttribute('data-section');
      document.getElementById(`${sectionId}-section`).classList.add('active');

      // 페이지 타이틀 변경
      const titles = {
        'users': '사용자 관리',
        'comments': '댓글 관리',
        'reports': '신고 접수',
        'inquiries': '문의사항',
        'statistics': '데이터 통계'
      };
      document.getElementById('page-title').textContent = titles[sectionId];

      // 섹션별 초기 데이터 로드
      if (sectionId === 'users') loadUsers();
      if (sectionId === 'comments') loadComments();
      if (sectionId === 'reports') {
        filterReports();
        updateReportStats();
      }
      if (sectionId === 'inquiries') filterInquiries();
      if (sectionId === 'statistics') initStatistics();

      // Lucide 아이콘 재초기화
      if (window.lucide) lucide.createIcons();
    });
  });
}

// ===================================
// 사용자 관리 - 목록 조회 및 페이징
// ===================================
let currentUsersPage = 1;

/**
 * 1. 서버에서 사용자 목록 가져오기
 */
function loadUsers(page = 1) {
  currentUsersPage = page;

  // 서버로 데이터 요청 (해당 URL은 백엔드 Controller와 일치해야 함)
  fetch(`/admin/users/api`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('users-table-body');

        // HTML 생성
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
        document.getElementById('users-table-body').innerHTML = '<tr><td colspan="6" class="text-center text-danger">데이터 로드 중 오류가 발생했습니다.</td></tr>';
      });
}

/**
 * 2. 상태 변경 (드롭다운)
 */
function updateUserStatus(userNo) {
  const status = document.getElementById(`status-${userNo}`).value;

  if (!confirm('상태를 변경하시겠습니까?')) return;

  const token = document.querySelector('meta[name="_csrf"]').content;
  const header = document.querySelector('meta[name="_csrf_header"]').content;

  fetch(`/admin/users/${userNo}/status?status=${status}`, {
    method: 'PATCH',
    headers: {
      [header]: token
    }
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

/**
 * 3. 완전 삭제
 */
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
          loadUsers(1); // 삭제 후 첫 페이지로 이동
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

/**
 * 댓글 목록 조회
 */
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

/**
 * 댓글 테이블 렌더링
 */
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
    const tripContsId =
        comment.tripContsId ??
        comment.TRIPCONTSID ??
        comment.tripcontsid;

    const clsfText =
        cmtClsf == 10 ? '여행지' :
            cmtClsf == 20 ? '여행코스' :
                '';

    const detailUrl =
        cmtClsf == 10
            ? `/trip/trip_view?tripContsId=${tripCourseNo}`
            : cmtClsf == 20
                ? `/course/trip_course_view?courseNo=${tripCourseNo}`
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

/**
 * 댓글 검색
 */
function searchComments(page = 1) {
  currentCommentSearchDiv = document.getElementById('comment-search-div').value;
  currentCommentSearchWord = document.getElementById('comment-search-word').value.trim();
  loadComments(page);
}

/**
 * 댓글 검색 초기화
 */
function resetCommentSearch() {
  document.getElementById('comment-search-div').value = '';
  document.getElementById('comment-search-word').value = '';
  currentCommentSearchDiv = '';
  currentCommentSearchWord = '';
  loadComments(1);
}

/**
 * 댓글 숨김 / 노출 처리
 */
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

/**
 * 댓글 페이지네이션 렌더링
 */
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
let currentReportsPage = 1;        // 현재 페이지 번호
const reportsPerPage = 20;         // 페이지당 표시할 신고 수
let filteredReports = [...reportsData];  // 필터링된 신고 데이터

/**
 * 신고 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 */
function loadReports(page = 1) {
  currentReportsPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * reportsPerPage;
  const end = start + reportsPerPage;
  const paginatedReports = filteredReports.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('reports-table-body');
  
  // 신고 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedReports.map(report => `
    <tr>
      <td>${report.id}</td>
      <td>${getReportTypeText(report.type)}</td>
      <td>${report.target}</td>
      <td class="text-truncate" style="max-width: 200px;">${report.content}</td>
      <td>${report.reporter}</td>
      <td>${report.date}</td>
      <td>
        <span class="badge ${report.status === 'pending' ? 'bg-warning' : 'bg-success'}">
          ${report.status === 'pending' ? '대기중' : '처리완료'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewReportDetail(${report.id})">
          <i data-lucide="eye"></i> 상세
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderReportsPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 신고 필터링 (상태, 유형별)
 */
function filterReports() {
  const statusFilter = document.getElementById('report-status-filter').value;
  const typeFilter = document.getElementById('report-type-filter').value;
  
  // 필터 조건에 맞는 신고만 선택
  filteredReports = reportsData.filter(report => {
    const matchStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchType = typeFilter === 'all' || report.type === typeFilter;
    return matchStatus && matchType;
  });
  
  // 첫 페이지부터 다시 표시
  loadReports(1);
  
  // 통계 업데이트
  updateReportStats();
}

/**
 * 신고 통계 업데이트 (상단 카드)
 */
function updateReportStats() {
  // 미처리 신고 개수
  const pendingCount = reportsData.filter(r => r.status === 'pending').length;
  document.getElementById('pending-reports-count').textContent = pendingCount;
  
  // 오늘 접수된 신고 개수 (날짜가 2024-03-18인 것)
  const todayCount = reportsData.filter(r => r.date === '2024-03-18').length;
  document.getElementById('today-reports-count').textContent = todayCount;
  
  // 이번주 처리완료 신고 개수 (3월 11일 ~ 18일)
  const weekCompleted = reportsData.filter(r => {
    const reportDate = new Date(r.date);
    const startOfWeek = new Date('2024-03-11');
    const endOfWeek = new Date('2024-03-18');
    return r.status === 'completed' && reportDate >= startOfWeek && reportDate <= endOfWeek;
  }).length;
  document.getElementById('week-completed-count').textContent = weekCompleted;
}

/**
 * 신고 상세 정보 모달 열기
 * @param {number} id - 신고 ID
 */
function viewReportDetail(id) {
  const report = reportsData.find(r => r.id === id);
  if (!report) return;
  
  // 모달에 신고 정보 입력
  document.getElementById('report-id').value = report.id;
  document.getElementById('report-type').textContent = getReportTypeText(report.type);
  document.getElementById('report-target').textContent = report.target;
  document.getElementById('report-content').textContent = report.content;
  document.getElementById('report-reporter').textContent = report.reporter;
  document.getElementById('report-date').textContent = report.date;
  document.getElementById('report-status-select').value = report.status;
  
  // Bootstrap 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('reportDetailModal'));
  modal.show();
}

/**
 * 신고 상태 업데이트 (모달에서 저장 버튼 클릭 시)
 */
function updateReportStatus() {
  const id = parseInt(document.getElementById('report-id').value);
  const newStatus = document.getElementById('report-status-select').value;
  
  const reportIndex = reportsData.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    // 신고 상태 업데이트
    reportsData[reportIndex].status = newStatus;
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportDetailModal'));
    modal.hide();
    
    // 테이블 및 통계 새로고침
    filterReports();
    
    alert('신고 상태가 업데이트되었습니다.');
  }
}

/**
 * 신고된 콘텐츠 삭제
 */
function deleteReportedContent() {
  if (confirm('신고된 콘텐츠를 삭제하시겠습니까?')) {
    // 실제로는 해당 댓글이나 게시물을 삭제하는 API 호출
    alert('신고된 콘텐츠가 삭제되었습니다.');
    
    // 신고 상태를 처리완료로 변경
    const id = parseInt(document.getElementById('report-id').value);
    const reportIndex = reportsData.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      reportsData[reportIndex].status = 'completed';
    }
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportDetailModal'));
    modal.hide();
    
    // 새로고침
    filterReports();
  }
}

/**
 * 신고 페이지네이션 렌더링
 */
function renderReportsPagination() {
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const pagination = document.getElementById('reports-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentReportsPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadReports(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  pagination.innerHTML = html;
}

/**
 * 신고 유형 코드를 한글로 변환
 * @param {string} type - 신고 유형 코드
 * @returns {string} 한글 유형 텍스트
 */
function getReportTypeText(type) {
  switch(type) {
    case 'spam': return '스팸';
    case 'abuse': return '욕설/비방';
    case 'inappropriate': return '부적절한 내용';
    case 'etc': return '기타';
    default: return type;
  }
}

// ===================================
// 문의사항 - 목록 조회 및 답변 등록
// ===================================
let currentInquiriesPage = 1;      // 현재 페이지 번호
const inquiriesPerPage = 20;       // 페이지당 표시할 문의 수
let filteredInquiries = [...inquiriesData];  // 필터링된 문의 데이터

/**
 * 문의사항 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 */
function loadInquiries(page = 1) {
  currentInquiriesPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * inquiriesPerPage;
  const end = start + inquiriesPerPage;
  const paginatedInquiries = filteredInquiries.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('inquiries-table-body');
  
  // 문의 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedInquiries.map(inquiry => `
    <tr>
      <td>${inquiry.id}</td>
      <td class="text-truncate" style="max-width: 250px;">${inquiry.title}</td>
      <td>${inquiry.author}</td>
      <td>${inquiry.email}</td>
      <td>${inquiry.date}</td>
      <td>
        <span class="badge ${inquiry.status === 'pending' ? 'bg-warning' : 'bg-success'}">
          ${inquiry.status === 'pending' ? '답변 대기' : '답변 완료'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="replyInquiry(${inquiry.id})">
          <i data-lucide="message-circle"></i> ${inquiry.status === 'pending' ? '답변' : '보기'}
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderInquiriesPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 문의사항 필터링 (상태별)
 */
function filterInquiries() {
  const statusFilter = document.getElementById('inquiry-status-filter').value;
  
  // 필터 조건에 맞는 문의만 선택
  filteredInquiries = inquiriesData.filter(inquiry => {
    return statusFilter === 'all' || inquiry.status === statusFilter;
  });
  
  // 첫 페이지부터 다시 표시
  loadInquiries(1);
}

/**
 * 문의 답변 모달 열기
 * @param {number} id - 문의 ID
 */
function replyInquiry(id) {
  const inquiry = inquiriesData.find(i => i.id === id);
  if (!inquiry) return;
  
  // 모달에 문의 정보 입력
  document.getElementById('inquiry-id').value = inquiry.id;
  document.getElementById('inquiry-title').textContent = inquiry.title;
  document.getElementById('inquiry-content').textContent = inquiry.content;
  document.getElementById('inquiry-author').textContent = `${inquiry.author} (${inquiry.email})`;
  document.getElementById('inquiry-reply').value = inquiry.reply || '';
  
  // 답변 완료된 경우 읽기 전용
  if (inquiry.status === 'completed') {
    document.getElementById('inquiry-reply').readOnly = true;
  } else {
    document.getElementById('inquiry-reply').readOnly = false;
  }
  
  // Bootstrap 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('inquiryReplyModal'));
  modal.show();
}

/**
 * 문의 답변 등록
 */
function submitInquiryReply() {
  const id = parseInt(document.getElementById('inquiry-id').value);
  const reply = document.getElementById('inquiry-reply').value.trim();
  
  // 답변 내용 유효성 검사
  if (!reply) {
    alert('답변 내용을 입력해주세요.');
    return;
  }
  
  const inquiryIndex = inquiriesData.findIndex(i => i.id === id);
  if (inquiryIndex !== -1) {
    // 문의 답변 등록 및 상태 변경
    inquiriesData[inquiryIndex].reply = reply;
    inquiriesData[inquiryIndex].status = 'completed';
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('inquiryReplyModal'));
    modal.hide();
    
    // 테이블 새로고침
    filterInquiries();
    
    alert('답변이 등록되었습니다.');
  }
}

/**
 * 문의사항 페이지네이션 렌더링
 */
function renderInquiriesPagination() {
  const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);
  const pagination = document.getElementById('inquiries-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
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
// 데이터 통계 - 차트 시각화
// ===================================

/**
 * 통계 섹션 초기화 (모든 차트 생성)
 */
function initStatistics() {
  initSignupChart();       // 회원가입자 수 차트
  initActivityChart();     // 활동 통계 차트
  initReportTypeChart();   // 신고 유형 분포 차트
}

/**
 * 회원가입자 수 차트 (라인 차트)
 * 최근 6개월 데이터 표시
 */
function initSignupChart() {
  const ctx = document.getElementById('signupChart');
  if (!ctx) return;
  
  // 최근 6개월 라벨 및 데이터 생성
  const labels = [];
  const data = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(`${date.getMonth() + 1}월`);
    // 랜덤 데이터 생성 (실제로는 DB에서 가져옴)
    data.push(Math.floor(Math.random() * 100) + 50);
  }
  
  // Chart.js 라인 차트 생성
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '회원가입자 수',
        data: data,
        borderColor: 'rgba(249, 115, 22, 1)',           // 해봄트립 오렌지
        backgroundColor: 'rgba(249, 115, 22, 0.1)',     // 배경 투명 오렌지
        borderWidth: 3,
        fill: true,
        tension: 0.4,                                   // 곡선 정도
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
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
}

/**
 * 월별 활동 통계 차트 (막대 차트)
 * 이번 달과 지난 달 비교
 */
function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;
  
  // Chart.js 막대 차트 생성
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['댓글', '게시물', '좋아요', '공유'],
      datasets: [{
        label: '이번 달',
        data: [245, 189, 567, 123],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        borderRadius: 8
      }, {
        label: '지난 달',
        data: [198, 156, 489, 98],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * 신고 유형 분포 차트 (도넛 차트)
 */
function initReportTypeChart() {
  const ctx = document.getElementById('reportTypeChart');
  if (!ctx) return;

  // 신고 유형별 개수 집계
  const reportCounts = {
    spam: 0,
    abuse: 0,
    inappropriate: 0,
    etc: 0
  };

  reportsData.forEach(report => {
    reportCounts[report.type]++;
  });

  // Chart.js 도넛 차트 생성
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['스팸', '욕설/비방', '부적절한 내용', '기타'],
      datasets: [{
        data: [
          reportCounts.spam,
          reportCounts.abuse,
          reportCounts.inappropriate,
          reportCounts.etc
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',      // 빨간색
          'rgba(249, 115, 22, 0.8)',     // 오렌지색
          'rgba(139, 92, 246, 0.8)',     // 보라색
          'rgba(59, 130, 246, 0.8)'      // 파란색
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
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    }
  });
}
