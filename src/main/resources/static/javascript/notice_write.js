// [수정] DOM이 로드된 후 버튼 이벤트를 확실하게 연결합니다.
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('btn-save');

    if (saveBtn) {
        console.log("버튼 찾기 성공!");

        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("저장/수정 버튼이 클릭되었습니다.");

            // 데이터 수집
            const ntcNo = document.getElementById('ntcNo').value;
            let title = document.getElementById('postTitle').value; // [수정] const를 let으로 변경 (제목 수정을 위해)
            const content = document.getElementById('postContent').value;
            const modNo = 1;

            // --- [추가] 상단 고정 체크 여부에 따른 제목 처리 ---
            const isImportantCheck = document.getElementById('isImportant');
            if (isImportantCheck && isImportantCheck.checked) {
                // 제목이 이미 [중요]로 시작하지 않는 경우에만 붙여줍니다.
                if (!title.startsWith('[중요]')) {
                    title = "[중요] " + title;
                }
            } else {
                // 체크가 해제되어 있다면 제목에서 [중요] 머리말을 제거합니다.
                title = title.replace('[중요] ', '');
            }
            // ----------------------------------------------

            const url = (ntcNo === "0") ? "/notice/doSave.do" : "/notice/doUpdate.do";
            const mode = (ntcNo === "0") ? "등록" : "수정";

            console.log("요청 주소:", url);

            $.ajax({
                type: "POST",
                url: url,
                data: {
                    ntcNo: parseInt(ntcNo),
                    ntcTtl: title, // [확인] 중요 표시가 붙거나 떨어진 제목이 전송됩니다.
                    ntcCn: content,
                    modNo: modNo
                },
                success: function(res) {
                    console.log("서버 응답:", res);
                    if(res.indexOf("성공") !== -1) {
                        alert(mode + " 성공하였습니다!");
                        window.location.href = "/notice/notice";
                    } else {
                        alert("처리 결과: " + res);
                    }
                },
                error: function(xhr) {
                    console.error("에러 상세 내용:", xhr.responseText);
                    alert(mode + " 중 서버 에러가 발생했습니다. (F12 콘솔 확인)");
                }
            });
        });
    } else {
        console.error("btn-save 버튼을 찾을 수 없습니다. HTML의 id가 'btn-save'인지 확인하세요.");
    }
});