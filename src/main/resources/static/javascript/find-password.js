document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("find-password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const nameEl  = document.getElementById("name");

    const email = (emailEl?.value || "").trim();
    const name  = (nameEl?.value  || "").trim();

    if (!email) {
      alert("이메일을 입력해주세요.");
      emailEl?.focus();
      return;
    }
    if (!name) {
      alert("이름을 입력해주세요.");
      nameEl?.focus();
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message || "이메일로 임시 비밀번호를 발송 하였습니다!");
        // 필요하면 로그인 화면으로 이동
        window.location.href = "/user/login";
      } else {
        alert(data.message || "일치하는 사용자가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  });
});