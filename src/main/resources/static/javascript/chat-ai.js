document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("#chat-app") || document.body;

    // 이미 있으면 중복 생성 방지
    if (document.getElementById("chatbot-container")) return;

    const html = `
        <div id="chatbot-container">
        <button class="chatbot-toggler">
            <span class="material-symbols-rounded">Chat</span>
        </button>
        <div class="chatbot">
            <header>
            <h2>해봄트립 챗봇</h2>
            </header>
            <ul class="chatbox">
            <li class="chat incoming">
                <p>안녕하세요! 무엇을 도와드릴까요? 😊</p>
            </li>
            </ul>
            <div class="chat-input">
            <textarea placeholder="메시지를 입력하세요..." required></textarea>
            <span id="send-btn" class="material-symbols-rounded">Send</span>
            </div>
        </div>
        </div>
    `.trim();

    root.insertAdjacentHTML("beforeend", html);


    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbot = document.querySelector(".chatbot");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // 1. 챗봇 창 토글 (열기/닫기)
    chatbotToggler.addEventListener("click", () => {
        // console.log(chatbot.style.display);
        chatbot.style.display = chatbot.style.display === "none" || chatbot.style.display === "" ? "flex" : "none";
    });

    // 초기 상태는 숨김 (CSS에서 설정해도 됨)
    //chatbot.style.display = "none";

    // 2. 말풍선 생성 함수
    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        chatLi.innerHTML = `<p>${message}</p>`;
        return chatLi;
    }

    // 3. 메시지 전송 로직

    let isSending = false;

    const handleChat = () => {
        const userMessage = chatInput.value.trim();
        if(!userMessage || isSending) return; // 전송 중이면 무시

        isSending = true; // 잠금 시작
        chatInput.value = "";
        
        // 메시지 추가 로직...
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));

        // 서버 응답이 오거나 딜레이가 끝난 후 해제
        setTimeout(() => {
            

            const incomingChatLi = createChatLi("<span class=\"shine-text\">검색 중 입니다.</span>", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            
            // 실제 API 연동 시 이 부분을 fetch()로 교체

            // fetch("http://192.168.100.195:8000/api/v1/chat", {
            // fetch("http://localhost:8000/api/v1/chat", {
			fetch("http://3.38.29.80:8000/api/v1/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, userCode: userCode }) // userCode는 실제로는 로그인한 사용자 ID 등으로 대체
            })
            .then(res => {
                if (!res.ok) throw new Error('서버 응답 에러');
                return res.json();s
            })
            .then(data => {
            const rawReply = data.reply;
            const formattedReply = rawReply.replace(/\[(.*?)\]\((http[s]?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" style="color: #007bff; text-decoration: underline;">$1</a>');

            // 2. textContent 대신 innerHTML을 사용하여 HTML 태그를 렌더링합니다.
            incomingChatLi.querySelector("p").innerHTML = formattedReply;
            //sincomingChatLi.querySelector("p").textContent = data.reply;
            isSending = false; // 잠금 해제
            })
            .catch(error => {
                console.error('에러 발생:', error);
                incomingChatLi.querySelector("p").textContent = "서버와 연결할 수 없습니다. 다시 시도해 주세요.";
            })
            .finally(() => {
                isSending = false; // 전송 완료 후 잠금 해제 (setTimeout 밖으로 뺄 수도 있음)
                chatbox.scrollTo(0, chatbox.scrollHeight);
            });
            //incomingChatLi.querySelector("p").textContent = "답변을 준비 중입니다!";
        }, 500); 
        
        // 챗박스의 전체 높이값만큼 스크롤을 아래로 내림
        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: "smooth" // 부드럽게 스크롤되길 원하면 추가
        });
    }

    /*
    const handleChat = () => {
        const userMessage = chatInput.value.trim();
        if(!userMessage) return;

        // 입력창 비우기
        chatInput.value = "";

        // 사용자 메시지 추가
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // 가짜 응답 생성 (여기에 나중에 백엔드 API를 연결하세요)
        setTimeout(() => {
            const incomingChatLi = createChatLi("생각 중...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            
            // 실제 API 연동 시 이 부분을 fetch()로 교체
            incomingChatLi.querySelector("p").textContent = "답변을 준비 중입니다!";
        }, 600);
    }
    */

    // 전송 버튼 클릭 및 엔터키 이벤트
    sendChatBtn.addEventListener("click", handleChat);
    chatInput.addEventListener("keydown", (e) => {
        // 한글 입력 중(조합 중)일 때는 아래 로직을 실행하지 않음
        if (e.isComposing) return; 

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // 엔터 시 줄바꿈 방지
            handleChat();       // 전송 함수 호출
        }
    });

    function generateSectionCode(sections = [4,4,4]) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';
        let first = true;

        sections.forEach((len, idx) => {
            let part = '';

            for (let i = 0; i < len; i++) {
            if (first && i === 0) {
                // 첫 글자는 영문
                part += letters[Math.floor(Math.random() * letters.length)];
            } else {
                part += chars[Math.floor(Math.random() * chars.length)];
            }
            }

            first = false;
            result += part;

            if (idx < sections.length - 1) {
            result += '-';
            }
        });

        return result;
    }
    userCode = generateSectionCode();

    // 페이지 로드시 실행
    // let userCode = localStorage.getItem("sectionCode");

    // if (!code) {
    //     userCode = generateSectionCode([4,4,4]);
    //     localStorage.setItem("sectionCode", userCode);
    // }

    // console.log(userCode);

});