// 아이콘 초기화
lucide.createIcons();

// 1. 데이터 정의
const FAQ_DATA = [
    { q: "1) 화요일은 국밥", a: "화요일에는 따끈한 국밥 한 그릇 어떠신가요? 추천 맛집 리스트를 확인해보세요." },
    { q: "2) 수요일은 짬뽕", a: "수요일의 스트레스는 매콤한 짬뽕으로 날려버리세요! 전국 5대 짬뽕 가이드를 제공합니다." },
    { q: "3) 목요일은 닭가슴살", a: "건강을 생각하는 목요일, 맛있는 닭가슴살 요리법과 샐러드 맛집을 추천합니다." }
];

const INQUIRY_DATA = [
    { title: "문의 게시판 클릭", date: "2024.02.10", status: "답변완료" },
    { title: "무슨 문의?", date: "2024.02.09", status: "처리중" },
    { title: "ㅋㅋㅋㅋ", date: "2024.02.08", status: "답변완료" }
];

// 2. 탭 전환 로직
function switchTab(tabName) {
    // 모든 섹션 비활성화
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    // 모든 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (tabName === 'faq') {
        document.getElementById('faq-section').classList.add('active');
        document.getElementById('tab-faq').classList.add('active');
    } else {
        document.getElementById('inquiry-section').classList.add('active');
        document.getElementById('tab-inquiry').classList.add('active');
    }
}

// 3. FAQ 렌더링 (토글 기능 포함)
function renderFAQ() {
    const faqList = document.getElementById('faq-list');
    faqList.innerHTML = FAQ_DATA.map((item, index) => `
            <div class="faq-item" id="faq-${index}">
                <div class="faq-header" onclick="toggleFAQ(${index})">
                    <span>${item.q}</span>
                    <i data-lucide="chevron-down" class="chevron" size="20"></i>
                </div>
                <div class="faq-body">
                    ${item.a}
                </div>
            </div>
        `).join('');
    lucide.createIcons(); // 아이콘 재호출
}

function toggleFAQ(index) {
    const item = document.getElementById(`faq-${index}`);
    const isOpen = item.classList.contains('open');

    // 다른 것들은 닫기
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) {
        item.classList.add('open');
    }
}

// 4. 문의게시판 렌더링
function renderInquiry() {
    const inquiryList = document.getElementById('inquiry-list');
    inquiryList.innerHTML = INQUIRY_DATA.map(item => `
            <a href="#" class="inquiry-item">
                <div class="d-flex align-items-center gap-3">
                    <span class="badge ${item.status === '답변완료' ? 'bg-success' : 'bg-warning'} small">${item.status}</span>
                    <span class="inquiry-title">${item.title}</span>
                </div>
                <div class="text-muted small">${item.date}</div>
            </a>
        `).join('');
}

// 초기 실행
window.onload = () => {
    renderFAQ();
    renderInquiry();
};