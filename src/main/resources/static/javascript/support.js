/**
 * 해봄트립 고객지원 스크립트 (최종 통합본)
 */

// 1. FAQ 데이터 정의
const FAQ_DATA = [
    {q: "비밀번호를 잊어버렸어요. 어떻게 찾나요?", a: "로그인 화면 하단의 '비밀번호 찾기' 버튼을 클릭하여 가입하신 이메일로 임시 비밀번호를 받으실 수 있습니다."},
    {q: "고객센터 운영 시간은 어떻게 되나요?", a: "평일 오전 9시부터 오후 6시까지 운영되며, 주말 및 공휴일은 휴무입니다. 문의게시판을 이용해 주시면 순차적으로 답변해 드립니다."},
    {q: "예약 취소는 언제까지 가능한가요?", a: "여행 상품마다 취소 규정이 다를 수 있습니다. 마이페이지의 예약 상세 내역에서 해당 상품의 취소 정책을 확인해 주세요."},
    {q: "해봄트립의 멤버십 혜택이 궁금해요.", a: "가입 즉시 웰컴 쿠폰이 발급되며, 여행 후기를 작성하시면 다음 여행에서 사용 가능한 포인트를 적립해 드립니다."}
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

// 6. 문의글 등록
function doSaveInquiry() {
    const content = document.getElementById('modalInquiryContent').value.trim();
    const files = document.getElementById('modalAttachFile').files;

    const isLogin = document.getElementById('is-login-check').value;
    if (isLogin !== 'Y') {
        alert('로그인이 필요합니다.');
        return;
    }

    if (!content) {
        alert('문의 내용을 입력해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('supCn', content);
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    fetch('/support/doSave.do', {
        method: 'POST',
        headers: {
            [document.querySelector('meta[name="_csrf_header"]').content]:
            document.querySelector('meta[name="_csrf"]').content
        },
        body: formData
    })
        .then(res => res.text())
        .then(result => {
            if (result > 0) {
                alert('문의가 등록되었습니다.');
                location.reload();
            } else {
                alert('등록 실패: ' + result);
            }
        });
}

// 7. 답변 등록 - ✅ /support/support → /support 수정
function saveAnswer(supNo) {
    const answerInput = document.getElementById(`ans-input-${supNo}`);
    const answerContent = answerInput?.value.trim();

    if (!answerContent) return alert("답변 내용을 입력해주세요!");
    if (!confirm("이 답변을 등록하시겠습니까?")) return;

    const urlParams = new URLSearchParams(window.location.search);
    let currentPageNo = urlParams.get('pageNo');
    if (!currentPageNo) {
        const activePageBtn = document.querySelector('.pagination .page-item.active .page-link');
        currentPageNo = activePageBtn ? activePageBtn.innerText.trim() : '1';
    }

    fetch('/support/doUpdate.do', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', [getCsrfHeader()]: getCsrfToken()},
        body: JSON.stringify({supNo: supNo, supAnsCn: answerContent, supYn: 'Y'})
    })
        .then(res => res.text())
        .then(data => {
            if (data === "1") {
                alert("답변이 성공적으로 등록되었습니다.");
                // ✅ /support/support → /support 수정
                location.href = `/support?pageNo=${currentPageNo}&tab=inquiry&lastSupNo=${supNo}#inquiry-section`;
            } else {
                alert("등록 실패: " + data);
            }
        })
        .catch(err => console.error("Error:", err));
}

// 8. 초기화 및 상태 유지
document.addEventListener('DOMContentLoaded', () => {
    renderFAQ();

    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    const pageNo = urlParams.get('pageNo');
    const lastSupNo = urlParams.get('lastSupNo');

    if (activeTab === 'inquiry' || pageNo) {
        switchTab('inquiry');

        if (lastSupNo) {
            setTimeout(() => {
                const targetTextarea = document.getElementById(`ans-input-${lastSupNo}`);
                if (targetTextarea) {
                    const header = targetTextarea.closest('.inquiry-body').previousElementSibling;
                    header.click();
                    window.scrollTo({top: header.offsetTop - 120, behavior: 'smooth'});
                }
            }, 300);
        } else if (window.location.hash === '#inquiry-section' || pageNo) {
            setTimeout(() => {
                const target = document.getElementById('inquiry-section');
                if (target) window.scrollTo({top: target.offsetTop - 100, behavior: 'smooth'});
            }, 150);
        }
    } else {
        switchTab('faq');
    }

    // 관리자 UI 제어
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