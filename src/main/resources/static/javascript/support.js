// 1. FAQ 데이터 정의
const FAQ_DATA = [
    {q: "비밀번호를 잊어버렸어요. 어떻게 찾나요?", a: "로그인 화면 하단의 '비밀번호 찾기'를 이용해 주세요. 등록된 이메일로 임시 비밀번호가 발송됩니다."},
    {q: "여행 코스 추천은 어떻게 이용하나요?", a: "AI 기반 추천 시스템을 통해 하니님의 취향에 맞는 맞춤형 여행 코스를 바로 생성해 드립니다."},
    {q: "고객센터 운영 시간은 어떻게 되나요?", a: "평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)입니다. 문의게시판은 24시간 이용 가능합니다."},
    {q: "회원 탈퇴는 어디서 하나요?", a: "마이페이지 > 계정 설정 하단에서 탈퇴 신청이 가능합니다. 탈퇴 시 모든 데이터는 복구가 불가능합니다."}
];

// 2. CSRF 토큰 및 헤더 설정
const getCsrfToken = () => document.querySelector('meta[name="_csrf"]')?.content;
const getCsrfHeader = () => document.querySelector('meta[name="_csrf_header"]')?.content;

// 3. 탭 전환 로직
function switchTab(tabName) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const sectionId = `${tabName}-section`;
    const btnId = `tab-${tabName}`;

    const targetSection = document.getElementById(sectionId);
    const targetBtn = document.getElementById(btnId);

    if (targetSection && targetBtn) {
        targetSection.classList.add('active');
        targetBtn.classList.add('active');
    }
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
            <div class="faq-body">
                <div class="py-2">${item.a}</div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function toggleFAQ(index) {
    const targetItem = document.getElementById(`faq-${index}`);
    if (!targetItem) return;

    const isOpen = targetItem.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) targetItem.classList.add('open');
}

// 5. 문의게시판 토글 로직
function toggleInquiry(index) {
    const content = document.getElementById(`inquiry-content-${index}`);
    if (!content) return;

    const header = content.previousElementSibling;
    const isOpen = content.classList.contains('open');

    document.querySelectorAll('.inquiry-body').forEach(el => {
        if (el !== content) {
            el.classList.remove('open');
            if (el.previousElementSibling) el.previousElementSibling.classList.remove('active');
        }
    });

    if (!isOpen) {
        content.classList.add('open');
        header.classList.add('active');
    } else {
        content.classList.remove('open');
        header.classList.remove('active');
    }
}

// 6. 서버 통신 로직 (AJAX)
function doSaveInquiry() {
    const content = document.getElementById('modalInquiryContent').value;
    const token = getCsrfToken();
    const header = getCsrfHeader();

    if (!content.trim()) {
        alert("문의 내용을 입력해주세요!");
        return;
    }

    if (!confirm("문의사항을 등록하시겠습니까?")) return;

    fetch('/support/doSave.do', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        },
        body: JSON.stringify({supCn: content})
    })
        .then(res => res.text())
        .then(data => {
            if (data === "1") {
                alert("문의사항이 성공적으로 등록되었습니다.");
                location.reload();
            } else {
                alert("등록에 실패했습니다. (사유: " + data + ")");
            }
        })
        .catch(err => console.error("Error:", err));
}

function saveAnswer(supNo) {
    const answerInput = document.getElementById(`ans-input-${supNo}`);
    const answerContent = answerInput?.value;

    const token = getCsrfToken();
    const header = getCsrfHeader();

    fetch('/support/doUpdate.do', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [header]: token
        },
        body: JSON.stringify({
            supNo: supNo,
            supAnsCn: answerContent,
            supYn: 'Y' // 💡 답변 완료 상태로 변경
        })
    })
        .then(res => res.text())
        .then(data => {
            if (data === "1") {
                alert("답변이 성공적으로 등록되었습니다.");
                // 💡 탭 상태를 유지하며 새로고침
                location.href = "/support/support?tab=inquiry";
            }
        })
        .catch(err => console.error("[에러 발생]", err));
}

// 7. 초기화 (권한 인식 로직 강화)
document.addEventListener('DOMContentLoaded', () => {
    // 💡 1. URL 파라미터를 읽어 탭 상태 확인
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');

    // 💡 2. 탭 전환 처리
    if (activeTab === 'inquiry') {
        switchTab('inquiry');
    } else {
        renderFAQ();
    }

    // 💡 3. 관리자 권한 체크 (이 부분이 핵심입니다!)
    const adminInput = document.getElementById('is-admin-check');

    if (adminInput) {
        // 값 앞뒤 공백을 제거하고 대문자로 변환해서 비교합니다.
        const isAdmin = adminInput.value.trim().toUpperCase();
        console.log("실제 input에 담긴 값:", "[" + isAdmin + "]");

        if (isAdmin === 'Y') {
            console.log("관리자 확인됨: 박스를 표시합니다.");
            // 💡 관리자 박스는 보이고, 안내 문구는 숨김
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.setProperty('display', 'block', 'important');
            });
            document.querySelectorAll('.user-notice').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }
    } else {
        console.error("ID가 'is-admin-check'인 요소를 찾을 수 없습니다.");
    }

// 💡 0.1초 뒤에 다시 한번 값을 읽어보게 합니다.
    setTimeout(() => {
        const adminInput = document.getElementById('is-admin-check');
        const isAdmin = adminInput ? adminInput.value.trim() : "";
        console.log("재확인된 관리자 권한:", "[" + isAdmin + "]");

        if (isAdmin === 'Y') {
            // 관리자 박스 강제 노출
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.setProperty('display', 'block', 'important');
            });
            // 안내 문구 숨김
            document.querySelectorAll('.user-notice').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }
    }, 100);

    // 💡 4. 아이콘 생성
    if (window.lucide) lucide.createIcons();
});