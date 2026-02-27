/**
 * 해봄트립 고객지원 스크립트 (최종 통합본)
 * [수정사항] 답변 등록 후 현재 페이지 유지 + 방금 답변한 글 자동 펼침 추가 [cite: 2026-02-21]
 */

// 1. FAQ 데이터 정의
const FAQ_DATA = [
    { q: "비밀번호를 잊어버렸어요. 어떻게 찾나요?", a: "로그인 화면 하단의 '비밀번호 찾기' 버튼을 클릭하여 가입하신 이메일로 임시 비밀번호를 받으실 수 있습니다." },
    { q: "고객센터 운영 시간은 어떻게 되나요?", a: "평일 오전 9시부터 오후 6시까지 운영되며, 주말 및 공휴일은 휴무입니다. 문의게시판을 이용해 주시면 순차적으로 답변해 드립니다." },
    { q: "예약 취소는 언제까지 가능한가요?", a: "여행 상품마다 취소 규정이 다를 수 있습니다. 마이페이지의 예약 상세 내역에서 해당 상품의 취소 정책을 확인해 주세요." },
    { q: "해봄트립의 멤버십 혜택이 궁금해요.", a: "가입 즉시 웰컴 쿠폰이 발급되며, 여행 후기를 작성하시면 다음 여행에서 사용 가능한 포인트를 적립해 드립니다." }
];

// 2. CSRF 유틸리티
const getCsrfToken = () => document.querySelector('meta[name="_csrf"]')?.content;
const getCsrfHeader = () => document.querySelector('meta[name="_csrf_header"]')?.content;

// 3. 탭 전환 로직
function switchTab(tabName) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${tabName}-section`)?.classList.add('active');
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
}

// 4. FAQ 렌더링 및 토글
function renderFAQ() {
    const faqList = document.getElementById('faq-list');
    if (!faqList) return;
    faqList.innerHTML = FAQ_DATA.map((item, index) => `
        <div class="faq-item" id="faq-${index}">
            <div class="faq-header" onclick="toggleFAQ(${index})">
                <span><i data-lucide="help-circle" size="18" class="me-2 text-warning"></i>${item.q}</span>
                <i data-lucide="chevron-down" class="chevron" size="20"></i>
            </div>
            <div class="faq-body"><div class="py-2">${item.a}</div></div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

function toggleFAQ(index) {
    const targetItem = document.getElementById(`faq-${index}`);
    const isOpen = targetItem?.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) targetItem?.classList.add('open');
}

// 5. 문의게시판 토글 로직
function toggleInquiry(index) {
    const content = document.getElementById(`inquiry-content-${index}`);
    const header = content?.previousElementSibling;
    const isOpen = content?.classList.contains('open');

    document.querySelectorAll('.inquiry-body').forEach(el => {
        el.classList.remove('open');
        el.previousElementSibling?.classList.remove('active');
    });

    if (!isOpen && content) {
        content.classList.add('open');
        header?.classList.add('active');
    }
}

// 6. 서버 통신 로직
function doSaveInquiry() {
    const content = document.getElementById('modalInquiryContent').value;
    if (!content.trim()) return alert("문의 내용을 입력해주세요!");
    if (!confirm("문의사항을 등록하시겠습니까?")) return;

    fetch('/support/doSave.do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [getCsrfHeader()]: getCsrfToken() },
        body: JSON.stringify({supCn: content})
    })
        .then(res => res.text())
        .then(data => data === "1" ? (location.href = "/support/support?tab=inquiry#inquiry-section") : alert("실패: " + data));
}

// 💡 [핵심 수정] 답변 등록 시 현재 페이지와 글 번호를 들고 이동하는 함수
function saveAnswer(supNo) {
    const answerInput = document.getElementById(`ans-input-${supNo}`);
    const answerContent = answerInput?.value.trim();

    if (!answerContent) return alert("답변 내용을 입력해주세요!");
    if (!confirm("이 답변을 등록하시겠습니까?")) return;

    // 현재 페이지 번호 찾기
    const urlParams = new URLSearchParams(window.location.search);
    let currentPageNo = urlParams.get('pageNo');
    if (!currentPageNo) {
        const activePageBtn = document.querySelector('.pagination .page-item.active .page-link');
        currentPageNo = activePageBtn ? activePageBtn.innerText.trim() : '1';
    }

    fetch('/support/doUpdate.do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [getCsrfHeader()]: getCsrfToken() },
        body: JSON.stringify({ supNo: supNo, supAnsCn: answerContent, supYn: 'Y' })
    })
        .then(res => res.text())
        .then(data => {
            if (data === "1") {
                alert("답변이 성공적으로 등록되었습니다.");
                // 💡 리다이렉트 시 pageNo와 더불어 'lastSupNo'를 파라미터로 추가합니다.
                location.href = `/support/support?pageNo=${currentPageNo}&tab=inquiry&lastSupNo=${supNo}#inquiry-section`;
            } else {
                alert("등록 실패: " + data);
            }
        })
        .catch(err => console.error("Error:", err));
}

// 7. 초기화 및 상태 유지
document.addEventListener('DOMContentLoaded', () => {
    renderFAQ();

    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    const pageNo = urlParams.get('pageNo');
    const lastSupNo = urlParams.get('lastSupNo'); // 💡 방금 작업한 글 번호

    if (activeTab === 'inquiry' || pageNo) {
        switchTab('inquiry');

        // 💡 특정 글 자동 펼침 로직
        if (lastSupNo) {
            setTimeout(() => {
                // 해당 글 번호의 input 요소를 찾아 그 부모 컨테이너의 인덱스를 알아내거나 직접 클릭
                const targetTextarea = document.getElementById(`ans-input-${lastSupNo}`);
                if (targetTextarea) {
                    const header = targetTextarea.closest('.inquiry-body').previousElementSibling;
                    header.click(); // 헤더를 강제로 클릭하여 펼칩니다.

                    // 펼쳐진 글로 부드럽게 스크롤
                    window.scrollTo({
                        top: header.offsetTop - 120,
                        behavior: 'smooth'
                    });
                }
            }, 300); // 렌더링 시간을 고려해 0.3초 뒤 실행
        } else if (window.location.hash === '#inquiry-section' || pageNo) {
            setTimeout(() => {
                const target = document.getElementById('inquiry-section');
                if (target) window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
            }, 150);
        }
    } else {
        switchTab('faq');
    }

    // 관리자 UI 제어 (기존 유지)
    const checkAdmin = () => {
        const adminInput = document.getElementById('is-admin-check');
        if (adminInput && adminInput.value.trim().toUpperCase() === 'Y') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.setProperty('display', 'block', 'important'));
            document.querySelectorAll('.user-notice').forEach(el => el.style.setProperty('display', 'none', 'important'));
        }
    };
    checkAdmin();
    setTimeout(checkAdmin, 100);
    if (window.lucide) lucide.createIcons();
});