/* support.js */

// 1. 데이터 정의
const FAQ_DATA = [
    { q: "비밀번호를 잊어버렸어요. 어떻게 찾나요?", a: "로그인 화면 하단의 '비밀번호 찾기'를 이용해 주세요. 등록된 이메일로 임시 비밀번호가 발송됩니다." },
    { q: "여행 코스 추천은 어떻게 이용하나요?", a: "AI 기반 추천 시스템을 통해 하니님의 취향에 맞는 맞춤형 여행 코스를 바로 생성해 드립니다." },
    { q: "고객센터 운영 시간은 어떻게 되나요?", a: "평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)입니다. 문의게시판은 24시간 이용 가능합니다." },
    { q: "회원 탈퇴는 어디서 하나요?", a: "마이페이지 > 계정 설정 하단에서 탈퇴 신청이 가능합니다. 탈퇴 시 모든 데이터는 복구가 불가능합니다." }
];

const INQUIRY_DATA = [
    { title: "시스템 점검 관련 문의 드립니다.", date: "2026.02.24", status: "답변완료" },
    { title: "제주도 맛집 데이터 수정 요청", date: "2026.02.23", status: "처리중" },
    { title: "로그인 오류 현상 발생", date: "2026.02.22", status: "답변완료" }
];

// 2. 탭 전환 로직
function switchTab(tabName) {
    // 모든 섹션 및 버튼 비활성화
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const sectionId = `${tabName}-section`;
    const btnId = `tab-${tabName}`;

    document.getElementById(sectionId).classList.add('active');
    document.getElementById(btnId).classList.add('active');
}

// 3. FAQ 렌더링 및 토글
function renderFAQ() {
    const faqList = document.getElementById('faq-list');
    if (!faqList) return;

    faqList.innerHTML = FAQ_DATA.map((item, index) => `
        <div class="faq-item" id="faq-${index}">
            <div class="faq-header" onclick="toggleFAQ(${index})">
                <span><i data-lucide="help-circle" size="18" class="me-2 text-warning"></i>${item.q}</span>
                <i data-lucide="chevron-down" class="chevron" size="20"></i>
            </div>
            <div class="faq-body">
                <div class="py-2">${item.a}</div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function toggleFAQ(index) {
    const targetItem = document.getElementById(`faq-${index}`);
    const isOpen = targetItem.classList.contains('open');

    // 다른 FAQ 닫기 (원할 경우 주석 처리)
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) {
        targetItem.classList.add('open');
    }
}

// 4. 문의게시판 렌더링
function renderInquiry() {
    const inquiryList = document.getElementById('inquiry-list');
    if (!inquiryList) return;

    inquiryList.innerHTML = INQUIRY_DATA.map(item => {
        const isDone = item.status === '답변완료';
        const badgeClass = isDone ? 'badge-done' : 'badge-processing';

        return `
            <a href="#" class="inquiry-item">
                <div class="d-flex align-items-center gap-3">
                    <span class="badge small ${badgeClass}">${item.status}</span>
                    <span class="inquiry-title">${item.title}</span>
                </div>
                <div class="text-muted small">${item.date}</div>
            </a>
        `;
    }).join('');
}