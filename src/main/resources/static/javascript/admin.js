// Admin Dashboard Logic

// --- Mock Data ---
const MOCK_USERS = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: ['김철수', '이영희', '박민수', '최지은', '정우성'][i % 5] + (i > 4 ? i : ''),
    email: `user${i}@example.com`,
    joinDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
    status: i % 7 === 0 ? 'suspended' : 'active'
}));

const MOCK_POSTS = Array.from({ length: 10 }, (_, i) => ({
    id: 100 + i,
    title: `여행 후기 공유합니다 ${i + 1}`,
    author: `user${i}`,
    category: ['자유게시판', '여행후기', '동행찾기'][i % 3],
    views: Math.floor(Math.random() * 1000),
    date: `2024-02-${String(i + 1).padStart(2, '0')}`
}));

const MOCK_COMMENTS = Array.from({ length: 8 }, (_, i) => ({
    id: 500 + i,
    content: `정말 좋은 정보네요! ${i + 1}`,
    author: `user${i + 5}`,
    postTitle: `여행 후기 공유합니다 ${i % 3 + 1}`,
    date: `2024-02-${String(i + 1).padStart(2, '0')}`
}));

const MOCK_REPORTS = [
    { id: 1, type: '게시글', content: '광고성 글입니다.', target: '여행 후기 공유합니다 1', reporter: 'user1', status: 'pending', date: '2024-02-10' },
    { id: 2, type: '댓글', content: '욕설이 포함되어 있습니다.', target: '정말 좋은 정보네요!', reporter: 'user3', status: 'resolved', date: '2024-02-09' },
    { id: 3, type: '사용자', content: '비매너 사용자입니다.', target: 'user5', reporter: 'user2', status: 'pending', date: '2024-02-11' },
];

const MOCK_INQUIRIES = [
    { id: 1, title: '로그인이 안됩니다.', author: 'user99', status: 'pending', date: '2024-02-11' },
    { id: 2, title: '회원 탈퇴 방법 문의', author: 'user88', status: 'completed', date: '2024-02-08' },
];

// --- Router ---
function router(page) {
    // 1. Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.target === page) {
            el.classList.add('active');
        }
    });

    // 2. Update Page Title
    const titles = {
        'dashboard': '대시보드',
        'users': '사용자 관리',
        'posts': '게시글 관리',
        'comments': '댓글 관리',
        'reports': '신고 접수',
        'inquiries': '문의 사항',
        'stats': '통계'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Admin';

    // 3. Render Content
    const container = document.getElementById('main-container');
    container.innerHTML = ''; // Clear

    switch(page) {
        case 'dashboard':
            renderDashboard(container);
            break;
        case 'users':
            renderUsers(container);
            break;
        case 'posts':
            renderPosts(container);
            break;
        case 'comments':
            renderComments(container);
            break;
        case 'reports':
            renderReports(container);
            break;
        case 'inquiries':
            renderInquiries(container);
            break;
        case 'stats':
            renderStats(container);
            break;
        default:
            renderDashboard(container);
    }

    // Re-init Icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- Render Functions ---

function renderDashboard(container) {
    const template = document.getElementById('tpl-dashboard');
    container.appendChild(template.content.cloneNode(true));
}

function renderUsers(container) {
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden fade-in">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center">
                <input type="text" placeholder="이름 또는 이메일 검색" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-orange-500 w-64">
                <button class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">사용자 추가</button>
            </div>
            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>가입일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${MOCK_USERS.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td class="font-bold text-slate-700">${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.joinDate}</td>
                                <td>
                                    <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">
                                        ${user.status === 'active' ? '정상' : '정지'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-icon" title="수정"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                    <button class="btn-icon delete" title="삭제"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="p-4 border-t border-slate-100 flex justify-center">
                <div class="flex gap-1">
                    <button class="px-3 py-1 text-sm text-slate-400 hover:text-orange-600">&lt;</button>
                    <button class="px-3 py-1 text-sm bg-orange-50 text-orange-600 font-bold rounded">1</button>
                    <button class="px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 rounded">2</button>
                    <button class="px-3 py-1 text-sm text-slate-400 hover:text-orange-600">&gt;</button>
                </div>
            </div>
        </div>
    `;
}

function renderPosts(container) {
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden fade-in">
             <div class="p-4 border-b border-slate-100 flex justify-between items-center">
                <div class="flex gap-2">
                    <select class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <option>전체 카테고리</option>
                        <option>자유게시판</option>
                        <option>여행후기</option>
                    </select>
                </div>
                <button class="text-slate-500 hover:text-slate-800"><i data-lucide="refresh-cw" class="w-4 h-4"></i></button>
            </div>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>카테고리</th>
                        <th>조회수</th>
                        <th>작성일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    ${MOCK_POSTS.map(post => `
                        <tr>
                            <td>${post.id}</td>
                            <td class="font-bold text-slate-700 truncate max-w-xs">${post.title}</td>
                            <td>${post.author}</td>
                            <td><span class="badge badge-neutral">${post.category}</span></td>
                            <td>${post.views}</td>
                            <td>${post.date}</td>
                            <td>
                                <button class="btn-icon" title="보기"><i data-lucide="eye" class="w-4 h-4"></i></button>
                                <button class="btn-icon delete" title="삭제"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderComments(container) {
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden fade-in">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>내용</th>
                        <th>작성자</th>
                        <th>원글 제목</th>
                        <th>작성일</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    ${MOCK_COMMENTS.map(comment => `
                        <tr>
                            <td>${comment.id}</td>
                            <td class="truncate max-w-xs text-slate-600">${comment.content}</td>
                            <td>${comment.author}</td>
                            <td class="text-xs text-slate-500">${comment.postTitle}</td>
                            <td>${comment.date}</td>
                            <td>
                                <button class="btn-icon delete" title="삭제"><i data-lucide="x-circle" class="w-4 h-4"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderReports(container) {
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            <!-- Stats -->
            <div class="bg-red-50 p-6 rounded-xl border border-red-100">
                <h3 class="text-red-800 font-bold mb-1">미처리 신고</h3>
                <p class="text-3xl font-black text-red-600">3건</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-100">
                <h3 class="text-slate-800 font-bold mb-1">오늘 접수</h3>
                <p class="text-3xl font-black text-slate-700">1건</p>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-100">
                <h3 class="text-slate-800 font-bold mb-1">이번주 처리완료</h3>
                <p class="text-3xl font-black text-slate-700">12건</p>
            </div>

            <!-- List -->
            <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-4 border-b border-slate-100 font-bold text-slate-800">신고 목록</div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>유형</th>
                            <th>대상</th>
                            <th>신고 사유</th>
                            <th>신고자</th>
                            <th>날짜</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${MOCK_REPORTS.map(report => `
                            <tr>
                                <td><span class="badge badge-neutral">${report.type}</span></td>
                                <td class="font-bold text-slate-700">${report.target}</td>
                                <td class="text-red-500">${report.content}</td>
                                <td>${report.reporter}</td>
                                <td>${report.date}</td>
                                <td>
                                    <span class="badge ${report.status === 'pending' ? 'badge-danger' : 'badge-success'}">
                                        ${report.status === 'pending' ? '대기중' : '처리완료'}
                                    </span>
                                </td>
                                <td>
                                    <button class="px-3 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-900">상세</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderInquiries(container) {
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden fade-in">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>날짜</th>
                        <th>상태</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    ${MOCK_INQUIRIES.map(inq => `
                        <tr>
                            <td>${inq.id}</td>
                            <td class="font-bold text-slate-700">${inq.title}</td>
                            <td>${inq.author}</td>
                            <td>${inq.date}</td>
                            <td>
                                <span class="badge ${inq.status === 'pending' ? 'badge-warning' : 'badge-success'}">
                                    ${inq.status === 'pending' ? '답변대기' : '답변완료'}
                                </span>
                            </td>
                            <td>
                                <button onclick="alert('답변 모달 오픈')" class="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">답변하기</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderStats(container) {
    container.innerHTML = `
        <div class="space-y-6 fade-in">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Daily Signups Chart -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 class="font-bold text-slate-800 mb-4">일별 가입자 수 (최근 7일)</h3>
                    <canvas id="chart-daily"></canvas>
                </div>
                <!-- Monthly Signups Chart -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 class="font-bold text-slate-800 mb-4">월별 가입자 추이 (2024년)</h3>
                    <canvas id="chart-monthly"></canvas>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 class="font-bold text-slate-800 mb-4">연도별 성장 (누적)</h3>
                <canvas id="chart-yearly" height="100"></canvas>
            </div>
        </div>
    `;

    // Wait for DOM update then render charts
    setTimeout(() => {
        initCharts();
    }, 0);
}

function initCharts() {
    // Daily Chart
    new Chart(document.getElementById('chart-daily'), {
        type: 'bar',
        data: {
            labels: ['2/5', '2/6', '2/7', '2/8', '2/9', '2/10', '2/11'],
            datasets: [{
                label: '신규 가입자',
                data: [12, 19, 15, 25, 22, 30, 45],
                backgroundColor: '#f97316',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    // Monthly Chart
    new Chart(document.getElementById('chart-monthly'), {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [{
                label: '가입자',
                data: [150, 230, 180, 320, 450, 500],
                borderColor: '#ea580c',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
    
    // Yearly Chart
    new Chart(document.getElementById('chart-yearly'), {
        type: 'bar',
        data: {
            labels: ['2022', '2023', '2024'],
            datasets: [{
                label: '총 사용자',
                data: [5000, 12000, 24593],
                backgroundColor: ['#cbd5e1', '#cbd5e1', '#f97316'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    router('dashboard');
});