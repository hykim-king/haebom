// [수정] DOM이 로드된 후 버튼 이벤트를 확실하게 연결합니다.
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('btn-save');

    if (saveBtn) {
        console.log("버튼 찾기 성공!"); // [확인용] 콘솔에 이 글자가 뜨나 보세요.

        saveBtn.addEventListener('click', function(e) {
            e.preventDefault(); // [추가] 버튼 클릭 시 기본 동작(폼 제출 등) 방지
            console.log("저장/수정 버튼이 클릭되었습니다.");

            // 데이터 수집
            const ntcNo = document.getElementById('ntcNo').value;
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const modNo = 1; // 혹은 실제 사용자 ID

            // [핵심 수정] url과 mode 변수를 여기서 정의해야 합니다!
            // ntcNo가 "0"이면 등록, 아니면 수정 주소를 선택합니다.
            const url = (ntcNo === "0") ? "/notice/doSave.do" : "/notice/doUpdate.do";
            const mode = (ntcNo === "0") ? "등록" : "수정";

            console.log("요청 주소:", url); // [확인용] 어느 주소로 가는지 확인

            $.ajax({
                type: "POST",
                url: url,
                data: {
                    ntcNo: parseInt(ntcNo),
                    ntcTtl: title,
                    ntcCn: content,
                    modNo: modNo
                },
                success: function(res) {
                    console.log("서버 응답:", res);
                    // [수정] res가 단순 문자열이므로 포함 여부 확인
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