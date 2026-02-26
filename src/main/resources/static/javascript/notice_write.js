/* notice_write.js */

document.addEventListener('DOMContentLoaded', () => {
    const writeForm = document.getElementById('writeForm');
    const fileAttachBtn = document.getElementById('fileAttachBtn');
    const fileInput = document.getElementById('fileInput');

    // 1. 파일 첨부 버튼 클릭 이벤트
    if (fileAttachBtn && fileInput) {
        fileAttachBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                alert(`선택된 파일: ${fileName}`);
                // 주석: 여기서 화면에 파일명을 표시하는 로직을 추가할 수 있습니다.
            }
        });
    }

    // 2. 폼 제출 핸들링
    if (writeForm) {
        writeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const category = document.getElementById('postCategory').value;
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;

            // 필수값 확인
            if (!title.trim() || !content.trim()) {
                alert('제목과 내용을 모두 입력해 주세요.');
                return;
            }

            // 실제 개발 시 API 전송 로직이 들어갈 자리
            console.log('데이터 전송:', { category, title, content });

            alert(`[${category}] "${title}" 글이 성공적으로 등록되었습니다!`);

            // 등록 완료 후 목록 페이지로 이동 (예시)
            // window.location.href = 'notice.html';
        });
    }
});