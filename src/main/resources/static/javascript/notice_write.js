document.addEventListener('DOMContentLoaded', function () {

    // ── 파일 버튼 클릭 시 파일 탐색기 열기 ──
    const btnFile  = document.getElementById('btn-file');
    const fileInput = document.getElementById('fileInput');
    const fileList  = document.getElementById('file-list');

    if (btnFile && fileInput) {
        btnFile.addEventListener('click', () => fileInput.click());

        // 선택된 파일명 화면에 표시
        fileInput.addEventListener('change', function () {
            fileList.innerHTML = '';
            Array.from(fileInput.files).forEach(file => {
                const div = document.createElement('div');
                div.textContent = '📎 ' + file.name;
                fileList.appendChild(div);
            });
        });
    }

    // ── 저장 / 수정완료 버튼 ──
    const btnSave = document.getElementById('btn-save');
    if (!btnSave) return;

    btnSave.addEventListener('click', function () {
        const ntcNo   = document.getElementById('ntcNo').value;
        const title   = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();

        if (!title)   { alert('제목을 입력해주세요.'); return; }
        if (!content) { alert('내용을 입력해주세요.'); return; }

        const csrfToken  = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        /*
         * FormData 사용 필수!
         * - 파일(multipart)과 일반 필드를 함께 서버로 전달
         * - contentType: false  → jQuery가 boundary를 자동 설정
         * - processData: false  → FormData를 문자열로 변환하지 않음
         */
        const formData = new FormData(document.getElementById('writeForm'));
        const url = (ntcNo == 0) ? '/notice/doSave.do' : '/notice/doUpdate.do';

        const ajaxOpts = {
            url,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (result) {
                if (result.includes('성공')) {
                    alert(ntcNo == 0 ? '등록되었습니다.' : '수정되었습니다.');
                    window.location.href = '/notice/notice';
                } else {
                    alert('처리 실패: ' + result);
                }
            },
            error: function (xhr) {
                alert('오류 발생: ' + xhr.status);
            }
        };

        if (csrfToken && csrfHeader) {
            ajaxOpts.beforeSend = xhr => xhr.setRequestHeader(csrfHeader, csrfToken);
        }

        $.ajax(ajaxOpts);
    });
});