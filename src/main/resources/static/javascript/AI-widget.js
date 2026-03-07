(function() {
    const widgetConfig = {
        // 기본 설정값 추가
        sidebarWidth: '300px',
        apiEndpoint: '/api/chat'
    };

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    document.head.appendChild(style);

    if (typeof lucide === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/lucide@latest";
        document.head.appendChild(script);
    }

    // 모바일 여부 판단 변수 추가 (toggleSidebarMode에서 사용됨)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    /**
     */
    function getSidebarWidth() {
        const style = getComputedStyle(document.documentElement);
        const val = style.getPropertyValue('--ai-sidebar-width').trim();
        return val ? val : widgetConfig.sidebarWidth;
    }

    /**
     */
    window.toggleAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');

        if (chatWindow && chatWindow.classList.contains('active')) {
            window.minimizeAIChat();
        } else if (chatWindow) {
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            chatWindow.style.visibility = 'visible';

            requestAnimationFrame(() => {
                chatWindow.classList.add('active');
            });

            if (fab) fab.style.display = 'none';
        }
    };

    /**
     */
    window.minimizeAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');
        const body = document.body;

        if (body.classList.contains('ai-sidebar-open')) {
            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');
        }

        if (chatWindow) {
            chatWindow.classList.remove('active');

            setTimeout(() => {
                chatWindow.style.visibility = 'hidden';
                chatWindow.classList.remove('mini');
                chatWindow.classList.remove('sidebar');
                if (fab) fab.style.display = 'flex'; // 닫을 때 버튼 다시 표시
            }, 300);
        }
    };

    /**
     */
    window.endAIChat = function() {
        window.minimizeAIChat();
    };

    /**
     */
    window.toggleSidebarMode = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const body = document.body;
        const width = getSidebarWidth();

        if (!chatWindow) return;

        const isSidebarMode = chatWindow.classList.contains('sidebar');

        if (isSidebarMode) {
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');

            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');

        } else {
            chatWindow.classList.remove('mini');
            chatWindow.classList.add('sidebar');

            if (!chatWindow.classList.contains('active')) {
                chatWindow.classList.add('active');
                chatWindow.style.visibility = 'visible';
            }

            if (!isMobile) {
                body.classList.add('ai-sidebar-open');
                body.style.marginRight = width;
            }
        }
    };

    /**
     */
    window.handleSendMessage = function() {
        const inputField = document.getElementById('ai-input-field');
        if (!inputField) return;

        const message = inputField.value.trim();

        if (message) {
            appendMessage('user', message);
            inputField.value = '';
            fetchAIResponse(message);
        }
    };

    /**
     */
    window.sendSuggestion = function(text) {
        if (text) {
            appendMessage('user', text);
            fetchAIResponse(text);
        }
    };

    /**
     */
    function appendMessage(type, text) {
        const messageList = document.getElementById('ai-message-list');
        if (!messageList) return;

        const bubble = document.createElement('div');
        // 수정한 부분: 메시지 타입(user/bot) 구분을 위한 클래스 추가 및 구조 완성
        bubble.className = `ai-message ${type}`;
        bubble.innerText = text;
        messageList.appendChild(bubble);

        const chatBody = document.getElementById('ai-chat-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    async function fetchAIResponse(userMessage) {
        try {
            // 수정한 부분: 봇의 응답 예시(botReply)가 정의되지 않아 에러가 날 수 있으므로 임시 변수 생성
            const botReply = "안녕하세요! 무엇을 도와드릴까요?";

            /* API 연동 시 아래 주석 해제
            const response = await fetch(widgetConfig.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await response.json();
            const botReply = data.reply;
            */

            appendMessage('bot', botReply);

        } catch (error) {
            console.error("AI 응답을 가져오는데 실패했습니다.", error);
        }
    }

    // 수정한 부분: 마지막 이벤트 리스너가 걸릴 대상(inputField)을 지정하고 null 체크 추가
    document.addEventListener('DOMContentLoaded', () => {
        const inputField = document.getElementById('ai-input-field');
        if (inputField) {
            inputField.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    window.handleSendMessage();
                }
            });
        }
    });

})();