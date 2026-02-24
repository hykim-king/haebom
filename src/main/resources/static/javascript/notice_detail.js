// 카테고리 버튼 선택 효과
const catBtns = document.querySelectorAll('.btn-category');
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 수정 버튼 클릭 시 작성 페이지로 이동하는 시뮬레이션
document.querySelector('.btn-edit').addEventListener('click', () => {
    console.log('수정 페이지로 이동합니다.');
    // window.location.href = 'write.html';
});