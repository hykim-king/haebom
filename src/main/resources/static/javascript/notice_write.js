document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('btn-save');
    const fileInput = document.getElementById('fileInput'); // 파일 입력창
    const btnFile = document.getElementById('btn-file');     // 가짜 버튼
    const fileList = document.getElementById('file-list');   // 파일 목록 표시

    // 1. 파일 첨부 버튼 클릭 이벤트 (가짜 버튼 -> 진짜 input 연결)
    if (btnFile) {
        btnFile.addEventListener('click', () => fileInput.click());
    }

    // 2. 파일 선택 시 화면에 파일명 띄워주기
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = "";
            for (let i = 0; i < this.files.length; i++) {
                fileList.innerHTML += `<div>📄 ${this.files[i].name}</div>`;
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();

            let token = $("meta[name='_csrf']").attr("content");
            let header = $("meta[name='_csrf_header']").attr("content");

            const ntcNo = document.getElementById('ntcNo').value;
            let title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;

            // --- [유지] 상단 고정 로직 ---
            const isImportantCheck = document.getElementById('isImportant');
            if (isImportantCheck && isImportantCheck.checked) {
                if (!title.startsWith('[중요]')) title = "[중요] " + title;
            } else {
                title = title.replace('[중요] ', '').replace('[중요]', '').trim();
            }

            // 💡 [핵심] 3. FormData 생성 (파일 + 텍스트 통합 바구니)
            const formData = new FormData();
            formData.append("ntcNo", ntcNo);
            formData.append("ntcTtl", title);
            formData.append("ntcCn", content);
            formData.append("modNo", 1); // 임시

            // 선택된 파일들을 FormData에 추가
            if (fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append("files", fileInput.files[i]);
                }
            }

            const url = (ntcNo === "0" || ntcNo === "") ? "/notice/doSave.do" : "/notice/doUpdate.do";
            const mode = (ntcNo === "0" || ntcNo === "") ? "등록" : "수정";

            $.ajax({
                type: "POST",
                url: url,
                // 💡 [필수] 파일 전송을 위한 2가지 설정
                processData: false, // 데이터를 쿼리 문자열로 변환하지 않음
                contentType: false, // 브라우저가 자동으로 multipart/form-data 설정
                data: formData,
                beforeSend: function(xhr) {
                    if (token && header) xhr.setRequestHeader(header, token);
                },
                success: function(res) {
                    if(res.includes("성공")) {
                        alert(mode + " 성공하였습니다!");
                        window.location.href = "/notice/notice";
                    } else {
                        alert("실패: " + res);
                    }
                },
                error: function(xhr) {
                    console.error("에러:", xhr.responseText);
                    alert("서버 에러가 발생했습니다.");
                }
            });
        });
    }
});