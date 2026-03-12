document.addEventListener("DOMContentLoaded", function () {
    const courseNoEl = document.getElementById("courseNo");
    const stepNumberList = document.getElementById("stepNumberList");
    const stepCardList = document.getElementById("stepCardList");
    const stepEmpty = document.getElementById("stepEmpty");
    const prevBtn = document.getElementById("stepPrevBtn");
    const nextBtn = document.getElementById("stepNextBtn");

    const tripDetailName = document.getElementById("tripDetailName");
    const tripDetailAddr = document.getElementById("tripDetailAddr");
    const tripDetailImageList = document.getElementById("tripDetailImageList");

    if (!courseNoEl) {
        console.error("courseNo input을 찾을 수 없습니다.");
        return;
    }

    const courseNo = courseNoEl.value;

    if (!courseNo) {
        console.error("courseNo 값이 없습니다.");
        showEmpty();
        return;
    }

    // 기존 기능
    loadStepList(courseNo);

    // 찜 상태/찜 수 초기화 추가
    initFavorite(courseNo);

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            stepCardList.scrollBy({ left: -320, behavior: "smooth" });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            stepCardList.scrollBy({ left: 320, behavior: "smooth" });
        });
    }

    function loadStepList(courseNo) {
        fetch(`/trip_course/detail/steps?courseNo=${courseNo}`, {
            method: "GET"
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("STEP 목록 조회 실패");
                }
                return response.json();
            })
            .then((data) => {
                if (!data || data.length === 0) {
                    showEmpty();
                    return;
                }

                renderStepNumbers(data);
                renderStepCards(data);

                // 첫 번째 step 자동 선택
                const firstStep = data[0];
                if (firstStep && firstStep.tripContsId) {
                    setActiveStep(0);
                    loadTripDetail(firstStep.tripContsId);
                }
            })
            .catch((error) => {
                console.error("STEP 목록 조회 오류:", error);
                showEmpty();
            });
    }

    function renderStepNumbers(stepList) {
        stepNumberList.innerHTML = "";

        stepList.forEach((step, index) => {
            const numberItem = document.createElement("div");
            numberItem.className = "step-number-item" + (index === 0 ? " active" : "");
            numberItem.dataset.index = index;
            numberItem.dataset.tripContsId = step.tripContsId;

            numberItem.innerHTML = `
                <span class="step-number-circle">${step.ctOrder ?? index + 1}</span>
            `;

            numberItem.addEventListener("click", function () {
                setActiveStep(index);
                scrollToCard(index);
                loadTripDetail(step.tripContsId);
            });

            stepNumberList.appendChild(numberItem);
        });
    }

    function renderStepCards(stepList) {
        stepCardList.innerHTML = "";

        stepList.forEach((step, index) => {
            const card = document.createElement("div");
            card.className = "step-card" + (index === 0 ? " active" : "");
            card.dataset.index = index;
            card.dataset.tripContsId = step.tripContsId;

            const imageHtml = step.tripPathNm && step.tripPathNm.trim() !== ""
                ? `<img src="${step.tripPathNm}" alt="${escapeHtml(step.tripNm || '여행지 이미지')}" class="step-card-image">`
                : `<div class="step-card-no-image">이미지 없음</div>`;

            card.innerHTML = `
                <div class="step-card-thumb-wrap">
                    ${imageHtml}
                    <div class="step-card-overlay">
                        <span class="step-card-title">${escapeHtml(step.tripNm || "여행지명 없음")}</span>
                    </div>
                </div>
            `;

            card.addEventListener("click", function () {
                setActiveStep(index);
                loadTripDetail(step.tripContsId);
            });

            stepCardList.appendChild(card);
        });
    }

    function loadTripDetail(tripContsId) {
        fetch(`/trip_course/detail/trip?tripContsId=${tripContsId}`, {
            method: "GET"
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("여행지 상세 조회 실패");
                }
                return response.json();
            })
            .then((tripData) => {
                renderTripDetailInfo(tripData);
                return loadTripImages(tripContsId);
            })
            .catch((error) => {
                console.error("여행지 상세 조회 오류:", error);
                renderTripDetailError();
            });
    }

    function loadTripImages(tripContsId) {
        return fetch(`/trip_course/detail/images?tripContsId=${tripContsId}`, {
            method: "GET"
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("여행지 이미지 조회 실패");
                }
                return response.json();
            })
            .then((imageList) => {
                renderTripImages(imageList);
            })
            .catch((error) => {
                console.error("여행지 이미지 조회 오류:", error);
                renderTripImages([]);
            });
    }

    function renderTripDetailInfo(tripData) {
        if (!tripDetailName || !tripDetailAddr) return;

        tripDetailName.textContent = tripData?.tripNm || "여행지명 없음";
        tripDetailAddr.textContent = tripData?.tripAddr || "주소 정보가 없습니다.";
    }

    function renderTripImages(imageList) {
        if (!tripDetailImageList) return;

        tripDetailImageList.innerHTML = "";

        if (!imageList || imageList.length === 0) {
            tripDetailImageList.innerHTML = `
                <div class="trip-detail-empty-image">등록된 이미지가 없습니다.</div>
            `;
            return;
        }

        imageList.forEach((image) => {
            const item = document.createElement("div");
            item.className = "trip-detail-image-item";

            const imagePath = image.filePathNm && image.filePathNm.trim() !== ""
                ? image.filePathNm
                : "";

            item.innerHTML = imagePath
                ? `<img src="${imagePath}" alt="${escapeHtml(image.fileNm || '여행지 이미지')}" class="trip-detail-image">`
                : `<div class="trip-detail-empty-thumb">이미지 없음</div>`;

            tripDetailImageList.appendChild(item);
        });
    }

    function renderTripDetailError() {
        if (tripDetailName) {
            tripDetailName.textContent = "여행지 정보를 불러오지 못했습니다.";
        }
        if (tripDetailAddr) {
            tripDetailAddr.textContent = "잠시 후 다시 시도해주세요.";
        }
        if (tripDetailImageList) {
            tripDetailImageList.innerHTML = `
                <div class="trip-detail-empty-image">이미지를 불러오지 못했습니다.</div>
            `;
        }
    }

    function setActiveStep(activeIndex) {
        const numberItems = document.querySelectorAll(".step-number-item");
        const cards = document.querySelectorAll(".step-card");

        numberItems.forEach((item, index) => {
            item.classList.toggle("active", index === activeIndex);
        });

        cards.forEach((card, index) => {
            card.classList.toggle("active", index === activeIndex);
        });
    }

    function scrollToCard(index) {
        const cards = document.querySelectorAll(".step-card");
        if (!cards[index]) return;

        cards[index].scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    function showEmpty() {
        if (stepEmpty) stepEmpty.style.display = "block";
        if (stepNumberList) stepNumberList.innerHTML = "";
        if (stepCardList) stepCardList.innerHTML = "";
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    // =========================
    // 찜하기 관련 함수
    // =========================

    window.handleLike = function () {
        const courseNo = document.getElementById("courseNo")?.value;
        if (!courseNo) return;

        const icon = document.getElementById("like-icon");
        const isAdding = !icon?.classList.contains("text-red-500");

        if (!confirm(isAdding ? "찜 목록에 추가하시겠습니까?" : "찜을 취소하시겠습니까?")) return;

        fetch(`/trip_course/toggleFavorite.do?courseNo=${encodeURIComponent(courseNo)}`)
            .then(res => res.json())
            .then(data => {
                const status = data[0];
                const userTotal = data[1];
                const courseTotal = data[2];

                if (status === -1) {
                    alert("로그인이 필요합니다.");
                    return;
                }

                if (status === 1) {
                    if (isAdding && userTotal > 10) {
                        alert("찜 목록이 가득 찼습니다! (최대 10개)");
                        fetch(`/trip_course/toggleFavorite.do?courseNo=${encodeURIComponent(courseNo)}`);
                        return;
                    }

                    updateLikeUI(isAdding, courseTotal);
                    alert(isAdding ? "찜 목록에 추가되었습니다." : "찜이 취소되었습니다.");
                }
            })
            .catch(err => {
                console.error("찜 토글 실패:", err);
                alert("처리에 실패했습니다.");
            });
    };

    function updateLikeUI(isLiked, count) {
        const icon = document.getElementById("like-icon");
        const countSpan = document.getElementById("like-count");

        if (icon) {
            if (isLiked) {
                icon.classList.add("text-red-500", "fill-current");
            } else {
                icon.classList.remove("text-red-500", "fill-current");
            }

            if (window.lucide) {
                lucide.createIcons();
            }
        }

        if (countSpan && count !== undefined) {
            countSpan.innerText = count;
        }
    }

    function initFavorite(courseNo) {
        if (!courseNo) return;

        fetch(`/trip_course/favoriteStatus.do?courseNo=${encodeURIComponent(courseNo)}`)
            .then(res => res.text())
            .then(txt => {
                const exists = parseInt(txt, 10) > 0;
                updateLikeUI(exists);
            })
            .catch(err => console.error("찜 상태 조회 실패:", err));

        fetch(`/trip_course/getFavoriteCount.do?courseNo=${encodeURIComponent(courseNo)}`)
            .then(res => res.text())
            .then(count => {
                const countSpan = document.getElementById("like-count");
                if (countSpan) {
                    countSpan.innerText = count;
                }
            })
            .catch(err => console.error("찜 수 조회 실패:", err));
    }
});