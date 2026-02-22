window.checkLoginStatus = function() {
  const authButtons = document.getElementById("auth-buttons");
  if (!authButtons) return;

  // login.js에서 사용하는 키값 "accessToken" 확인
  const token = localStorage.getItem("accessToken");

  if (token) {
    authButtons.innerHTML = `
      <a href="#" id="logoutBtn">로그아웃</a>
      <a href="mypage.html" class="highlight">마이페이지</a>
    `;

    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      location.reload();
    });
  } else {
    authButtons.innerHTML = `
      <a href="../html/login.html">로그인</a>
      <a href="../html/signup.html">회원가입</a>
    `;
  }
  if (window.lucide) lucide.createIcons();
};

// 일반 로드 시에도 실행 시도
document.addEventListener("DOMContentLoaded", window.checkLoginStatus);