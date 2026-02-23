// Form Submission Handling
document.getElementById('writeForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (title && content) {
        // 실제 환경에서는 여기서 API 호출을 진행합니다.
        alert(`"${title}" 글이 성공적으로 등록되었습니다!`);
        // 등록 후 목록이나 상세페이지로 이동하는 로직 예시
        // window.location.href = 'index.html';
    }
});

// Category selection visual feedback
const catBtns = document.querySelectorAll('.btn-category');
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});