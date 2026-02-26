// 카테고리 버튼 선택 효과
const catBtns = document.querySelectorAll('.btn-category');
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// [수정] 페이지가 완전히 로드된 후(DOMContentLoaded) 실행되도록 설정합니다.
document.addEventListener('DOMContentLoaded', function() {

    // 1. 수정 버튼 이벤트 연결
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.addEventListener('click', function() { // [수정] 'click' 이벤트를 사용해야 합니다.
            const ntcNoElement = document.getElementById('ntcNo');

            if (ntcNoElement && ntcNoElement.value) {
                const ntcNo = ntcNoElement.value;
                console.log('수정 페이지 이동 번호:', ntcNo);
                // [수정] 컨트롤러 주소(/notice/noticeWrite)로 이동합니다.
                window.location.href = "/notice/noticeWrite?ntcNo=" + ntcNo;
            } else {
                alert('게시글 번호를 찾을 수 없습니다.');
            }
        });
    }

    // 2. 삭제 버튼 이벤트 연결
    const deleteBtn = document.querySelector('.btn-delete'); // HTML에 class="btn-delete" 추가 필요
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm("정말로 삭제하시겠습니까?")) {
                const ntcNo = document.getElementById('ntcNo').value;
                // [수정] 삭제 처리를 담당하는 컨트롤러 주소로 이동합니다.
                window.location.href = "/notice/doDelete.do?ntcNo=" + ntcNo;
            }
        });
    }
});