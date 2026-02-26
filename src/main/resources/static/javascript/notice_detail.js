/* notice_detail.js */

document.addEventListener('DOMContentLoaded', () => {
    // 수정 버튼 이벤트
    const editBtn = document.getElementById('edit-notice');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log('수정 페이지로 이동합니다.');
            // location.href = 'notice_write.html';
        });
    }

    // 삭제 버튼 이벤트
    const deleteBtn = document.querySelector('.btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
                console.log('삭제 로직 실행');
                // 실제 삭제 처리 후 목록으로 이동
                // location.href = 'notice.html';
            }
        });
    }
});