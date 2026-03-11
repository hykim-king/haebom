// 댓글 공통 JS (여행지 / 여행코스 공용)
document.addEventListener("DOMContentLoaded", () => {
    loadComments();

    // 비로그인 시 별점, 파일, 입력란, 등록버튼 비활성화
    const { userNo } = getCurrentUser();
    if (!userNo) {
        document.querySelectorAll('.star-rating-input input, .star-rating-input label').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.4';
        });
        const commentInput = document.getElementById('comment-input');
        if (commentInput) {
            commentInput.disabled = true;
            commentInput.placeholder = '로그인 후 후기를 남길 수 있습니다.';
        }
        const fileLabel = document.querySelector('label[for="comment-file"]');
        if (fileLabel) {
            fileLabel.style.pointerEvents = 'none';
            fileLabel.style.opacity = '0.4';
        }
    }

    // 파일 선택 이벤트 (최대 5개)
    document.getElementById('comment-file')?.addEventListener('change', function (e) {
        const files = e.target.files;
        const nameEl = document.getElementById('comment-file-name');
        const clearBtn = document.getElementById('comment-file-clear');
        if (files.length > 5) {
            alert("파일은 최대 5개까지 첨부할 수 있습니다.");
            this.value = '';
            nameEl.textContent = '선택된 파일 없음 (최대 5개)';
            clearBtn.classList.add('hidden');
            return;
        }
        if (files.length > 0) {
            nameEl.textContent = files.length === 1 ? files[0].name : `${files.length}개 파일 선택됨`;
            clearBtn.classList.remove('hidden');
        } else {
            nameEl.textContent = '선택된 파일 없음 (최대 5개)';
            clearBtn.classList.add('hidden');
        }
    });
});

function clearCommentFile() {
    const fileInput = document.getElementById('comment-file');
    if (fileInput) fileInput.value = '';
    document.getElementById('comment-file-name').textContent = '선택된 파일 없음 (최대 5개)';
    document.getElementById('comment-file-clear').classList.add('hidden');
}

function handleEditFileSelect(input, cmtNo) {
    const files = input.files;
    const nameEl = document.getElementById('edit-file-name-' + cmtNo);
    if (files.length > 5) {
        alert("파일은 최대 5개까지 첨부할 수 있습니다.");
        input.value = '';
        nameEl.textContent = '선택된 파일 없음 (최대 5개)';
        return;
    }
    if (files.length > 0) {
        nameEl.textContent = files.length === 1 ? files[0].name : `${files.length}개 파일 선택됨`;
    } else {
        nameEl.textContent = '선택된 파일 없음 (최대 5개)';
    }
}

function getCsrfToken() {
    return document.querySelector('meta[name="_csrf"]')?.content || '';
}

function getCsrfHeader() {
    return document.querySelector('meta[name="_csrf_header"]')?.content || 'X-CSRF-TOKEN';
}

function getCommentParams() {
    return {
        cmtClsf: parseInt(document.getElementById('cmtClsf')?.value || '0'),
        targetNo: parseInt(document.getElementById('targetNo')?.value || '0')
    };
}

function getCurrentUser() {
    return {
        userNo: parseInt(document.getElementById('currentUserNo')?.value || '0'),
        isAdmin: document.getElementById('currentUserAdmin')?.value === 'Y'
    };
}

// 댓글 목록 조회
function loadComments() {
    const { cmtClsf, targetNo } = getCommentParams();
    if (!targetNo) return;

    fetch(`/comment/getList.do?tripCourseNo=${targetNo}&cmtClsf=${cmtClsf}`)
        .then(res => res.json())
        .then(data => {
            const list = data.list || [];
            renderComments(list);
            const countEl = document.getElementById('comment-count');
            if (countEl) countEl.textContent = data.count || 0;
            updateAvgStar(list);
        })
        .catch(err => console.error("댓글 조회 실패:", err));
}

// 댓글 등록 (FormData로 파일 포함 전송)
function submitComment() {
    const { userNo } = getCurrentUser();
    if (!userNo) {
        alert("로그인이 필요합니다.");
        return;
    }

    const { cmtClsf, targetNo } = getCommentParams();
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const contentEl = document.getElementById('comment-input');
    const fileInput = document.getElementById('comment-file');

    if (!ratingEl) {
        alert("별점을 선택해주세요.");
        return;
    }
    if (!contentEl || !contentEl.value.trim()) {
        alert("댓글 내용을 입력해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append('cmtCn', contentEl.value.trim());
    formData.append('cmtStarng', ratingEl.value);
    formData.append('cmtClsf', cmtClsf);
    formData.append('tripCourseNo', targetNo);

    if (fileInput && fileInput.files.length > 0) {
        const maxFiles = Math.min(fileInput.files.length, 5);
        for (let i = 0; i < maxFiles; i++) {
            formData.append('files', fileInput.files[i]);
        }
    }

    fetch('/comment/doSave.do', {
        method: 'POST',
        headers: {
            [getCsrfHeader()]: getCsrfToken()
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === -1) {
                alert("로그인이 필요합니다.");
                return;
            }
            if (data.status === -2) {
                alert("이미 후기를 등록하셨습니다.");
                return;
            }
            if (data.status === 1) {
                contentEl.value = '';
                if (ratingEl) ratingEl.checked = false;
                clearCommentFile();
                loadComments();
            } else {
                alert("등록에 실패했습니다.");
            }
        })
        .catch(err => {
            console.error("댓글 등록 실패:", err);
            alert("등록 중 오류가 발생했습니다.");
        });
}

// 댓글 수정 모드 전환
function startEdit(cmtNo, currentContent, currentStarng) {
    const row = document.getElementById('cmt-' + cmtNo);
    if (!row) return;

    const starsHtml = [5, 4, 3, 2, 1].map(i =>
        `<input type="radio" name="edit-rating-${cmtNo}" value="${i}" class="hidden" id="edit-st${i}-${cmtNo}" ${i === currentStarng ? 'checked' : ''}>` +
        `<label for="edit-st${i}-${cmtNo}" class="cursor-pointer text-gray-300 text-xl">★</label>`
    ).join('');

    row.innerHTML = `
        <div class="py-6">
            <div class="flex items-center gap-4 mb-3">
                <span class="text-sm font-bold text-gray-700">별점 수정</span>
                <div class="flex flex-row-reverse justify-end star-rating-input">${starsHtml}</div>
            </div>
            <div class="flex items-center gap-4 mb-3">
                <span class="text-sm font-bold text-gray-700">사진 변경</span>
                <label for="edit-file-${cmtNo}"
                    class="bg-white border px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors">파일 선택</label>
                <input type="file" id="edit-file-${cmtNo}" class="hidden" accept="image/*" multiple
                    onchange="handleEditFileSelect(this, ${cmtNo})">
                <span id="edit-file-name-${cmtNo}" class="text-xs text-gray-400">선택된 파일 없음 (최대 5개)</span>
            </div>
            <textarea id="edit-input-${cmtNo}"
                class="w-full p-4 border border-gray-200 rounded-xl h-24 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white transition-all text-sm"
            >${currentContent}</textarea>
            <div class="flex justify-end gap-2 mt-3">
                <button onclick="loadComments()"
                    class="px-6 py-2 rounded-lg text-sm text-gray-500 border hover:bg-gray-50 transition-colors">취소</button>
                <button onclick="saveEdit(${cmtNo})"
                    class="px-6 py-2 rounded-lg text-sm text-white bg-orange-500 hover:bg-orange-600 font-bold transition-colors">수정완료</button>
            </div>
        </div>
    `;
}

// 댓글 수정 저장 (FormData)
function saveEdit(cmtNo) {
    const contentEl = document.getElementById('edit-input-' + cmtNo);
    const ratingEl = document.querySelector(`input[name="edit-rating-${cmtNo}"]:checked`);
    const fileInput = document.getElementById('edit-file-' + cmtNo);
    const { cmtClsf, targetNo } = getCommentParams();

    if (!contentEl || !contentEl.value.trim()) {
        alert("댓글 내용을 입력해주세요.");
        return;
    }
    if (!ratingEl) {
        alert("별점을 선택해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append('cmtNo', cmtNo);
    formData.append('cmtCn', contentEl.value.trim());
    formData.append('cmtStarng', ratingEl.value);
    formData.append('cmtClsf', cmtClsf);
    formData.append('tripCourseNo', targetNo);

    if (fileInput && fileInput.files.length > 0) {
        const maxFiles = Math.min(fileInput.files.length, 5);
        for (let i = 0; i < maxFiles; i++) {
            formData.append('files', fileInput.files[i]);
        }
    }

    fetch('/comment/doUpdate.do', {
        method: 'POST',
        headers: {
            [getCsrfHeader()]: getCsrfToken()
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === -1) {
                alert("로그인이 필요합니다.");
                return;
            }
            if (data.status === 1) {
                loadComments();
            } else {
                alert("수정에 실패했습니다.");
            }
        })
        .catch(err => console.error("댓글 수정 실패:", err));
}

// 댓글 삭제
function deleteComment(cmtNo) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    fetch('/comment/doDelete.do', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [getCsrfHeader()]: getCsrfToken()
        },
        body: JSON.stringify({ cmtNo: cmtNo })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === -1) {
                alert("로그인이 필요합니다.");
                return;
            }
            if (data.status === 1) {
                loadComments();
            } else {
                alert("삭제에 실패했습니다.");
            }
        })
        .catch(err => console.error("댓글 삭제 실패:", err));
}

// 신고 팝업 열기
function openReport(cmtNo) {
    const { userNo } = getCurrentUser();
    if (!userNo) {
        alert("로그인이 필요합니다.");
        return;
    }
    window.open(
        '/report/popup?cmtNo=' + cmtNo,
        'reportPopup',
        'width=450,height=500,scrollbars=yes,resizable=no'
    );
}

// 평균 별점 업데이트
function updateAvgStar(list) {
    const ratedList = list.filter(c => c.cmtStarng > 0);
    const count = ratedList.length;
    const avg = count > 0 ? (ratedList.reduce((sum, c) => sum + c.cmtStarng, 0) / count) : 0;

    const displayEl = document.getElementById('avg-star-display');
    const scoreEl = document.getElementById('avg-star-score');
    const countEl = document.getElementById('avg-star-count');

    if (displayEl) {
        const full = Math.round(avg);
        displayEl.textContent = '★'.repeat(full) + '☆'.repeat(5 - full);
    }
    if (scoreEl) scoreEl.textContent = avg.toFixed(1);
    if (countEl) countEl.textContent = count;
}

// 댓글 목록 렌더링
function renderComments(list) {
    const container = document.getElementById('comment-list');
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="py-12 text-center text-gray-400 text-sm">아직 등록된 후기가 없습니다.</div>';
        return;
    }

    const { userNo, isAdmin } = getCurrentUser();

    container.innerHTML = list.map(c => {
        const stars = '★'.repeat(c.cmtStarng) + '☆'.repeat(5 - c.cmtStarng);
        const today = new Date();
        const todayStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
        const date = c.cmtReg
            ? (c.cmtReg === todayStr && c.cmtRegHm
                ? `${c.cmtRegHm.substring(0,2)}:${c.cmtRegHm.substring(2,4)}`
                : `${c.cmtReg.substring(0,4)}.${c.cmtReg.substring(4,6)}.${c.cmtReg.substring(6,8)}`)
            : '';

        const isOwner = userNo > 0 && userNo === c.regNo;
        const canManage = isOwner || isAdmin;

        const escapedContent = c.cmtCn.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        let actionButtons = '';
        if (canManage) {
            actionButtons += isOwner ? `<button onclick="startEdit(${c.cmtNo}, '${escapedContent}', ${c.cmtStarng})"
                    class="text-xs text-gray-400 hover:text-orange-500 transition-colors">수정</button>` : '';
            actionButtons += `<button onclick="deleteComment(${c.cmtNo})"
                    class="text-xs text-gray-400 hover:text-red-500 transition-colors">삭제</button>`;
        }
        if (userNo > 0 && !isOwner) {
            actionButtons += `<button onclick="openReport(${c.cmtNo})"
                    class="text-xs text-gray-400 hover:text-red-500 transition-colors">신고</button>`;
        }

        let imageHtml = '';
        if (c.filePathList) {
            const paths = c.filePathList.split('||');
            imageHtml = `<div class="flex flex-wrap gap-2 mt-3">${paths.map(p =>
                `<img src="/comment/image?path=${encodeURIComponent(p)}"
                    class="max-w-xs max-h-48 rounded-lg object-cover border border-gray-100"
                    onerror="this.style.display='none'">`
            ).join('')}</div>`;
        }

        return `
            <div class="py-6" id="cmt-${c.cmtNo}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-bold text-gray-800 text-sm">${c.userNick || '익명'}</span>
                        <span class="text-orange-400 ml-2 text-sm">${stars}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-400">${date}</span>
                        ${actionButtons}
                    </div>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">${c.cmtCn}</p>
                ${imageHtml}
            </div>
        `;
    }).join('');
}
