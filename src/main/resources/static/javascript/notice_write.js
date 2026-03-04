document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('btn-save');

    if (saveBtn) {
        console.log("버튼 찾기 성공!");

        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("저장/수정 버튼이 클릭되었습니다.");

            // 💡 [필수] HTML 헤더에 심어둔 암호표(CSRF Token) 가져오기
            // (이게 없으면 403 에러가 발생합니다!)
            let token = $("meta[name='_csrf']").attr("content");
            let header = $("meta[name='_csrf_header']").attr("content");

            // 데이터 수집
            const ntcNo = document.getElementById('ntcNo').value;
            let title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            // modNo는 로그인한 유저 번호여야 하지만, 임시로 1로 두거나 컨트롤러에서 처리합니다.
            const modNo = 1;

            // --- [유지] 하니님이 만드신 상단 고정 로직 ---
            const isImportantCheck = document.getElementById('isImportant');
            if (isImportantCheck && isImportantCheck.checked) {
                if (!title.startsWith('[중요]')) {
                    title = "[중요] " + title;
                }
            } else {
                // 체크 해제 시 [중요] 제거 (공백 주의)
                title = title.replace('[중요] ', '').replace('[중요]', '').trim();
            }
            // ----------------------------------------

            const url = (ntcNo === "0" || ntcNo === "") ? "/notice/doSave.do" : "/notice/doUpdate.do";
            const mode = (ntcNo === "0" || ntcNo === "") ? "등록" : "수정";

            console.log("요청 주소:", url);

            $.ajax({
                type: "POST",
                url: url,
                data: {
                    ntcNo: ntcNo, // 0이면 등록, 아니면 수정
                    ntcTtl: title,
                    ntcCn: content,
                    modNo: modNo
                },
                // 💡 [핵심] 서버에 암호표 제출하기
                beforeSend: function(xhr) {
                    if (token && header) {
                        xhr.setRequestHeader(header, token);
                    }
                },
                success: function(res) {
                    console.log("서버 응답:", res);
                    // 서버에서 "저장 성공", "수정 성공" 텍스트를 리턴한다고 가정
                    if(res.includes("성공")) {
                        alert(mode + " 성공하였습니다!");
                        window.location.href = "/notice/notice";
                    } else {
                        alert("실패: " + res);
                    }
                },
                error: function(xhr) {
                    console.error("에러 상세 내용:", xhr.responseText);
                    alert("서버 에러가 발생했습니다. (관리자 문의)");
                }
            });
        });
    } else {
        console.error("btn-save 버튼을 찾을 수 없습니다.");
    }
});