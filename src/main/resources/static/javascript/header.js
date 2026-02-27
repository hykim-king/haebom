// header.js (세션 기반 + logout 버튼 연결 버전)

// ✅ (중요) 세션 기반 Thymeleaf UI를 쓰는 경우, auth-buttons를 innerHTML로 덮어쓰지 마세요.
// 기존 checkLoginStatus는 localStorage 기반으로 DOM을 갈아엎어서 Thymeleaf 분기를 깨뜨립니다.
// 따라서 checkLoginStatus는 "존재하면 lucide만 렌더링" 정도로 최소화합니다.

window.checkLoginStatus = function () {
  // 아이콘 렌더링만 (필요하면 유지)
  if (window.lucide) {
    lucide.createIcons();
  }
};

// ✅ 로그아웃 버튼(#logoutBtn) 클릭 시 서버로 POST /user/logout 요청
document.addEventListener("click", async (e) => {
  const target = e.target;

  // 버튼/링크 둘 다 대응 (button 안에 span 등 들어가도 대응하려면 closest 사용)
  const logoutBtn = target?.closest?.("#logoutBtn");
  if (!logoutBtn) return;

  // form submit과 중복 동작 방지
  e.preventDefault();

  try {
    const response = await fetch("/user/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        // ✅ CSRF 켜져 있으면 토큰 필요
        // header.html에 숨겨둔 input에서 읽어옵니다.
        ...(getCsrfHeader()),
      },
    });

    if (response.ok) {
      alert("로그아웃 되었습니다.");

      // localStorage 기반 로직은 이제 안 쓰면 제거해도 되지만,
      // 혹시 남아있을까봐 정리만 해둠 (있어도 무해)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");

      // 메인으로 이동(새로고침 대신 명시적 이동이 깔끔)
      window.location.href = "/main/main.do";
    } else {
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
    alert("로그아웃 중 문제가 발생했습니다.");
  }
});

function getCsrfHeader() {
  // header.html에 넣어둔 CSRF hidden input 사용
  // <input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}">
  const csrfInput = document.querySelector('input[name="_csrf"]');
  if (!csrfInput) return {};

  // Spring Security 기본 헤더명은 "X-CSRF-TOKEN"
  // 커스텀 설정이면 달라질 수 있음
  return { "X-CSRF-TOKEN": csrfInput.value };
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.checkLoginStatus === "function") {
    window.checkLoginStatus();
  }
});