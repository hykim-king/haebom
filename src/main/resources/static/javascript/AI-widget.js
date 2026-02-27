(function() {
    const widgetConfig = {
        
        
    };

    
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    document.head.appendChild(style);

    if (typeof lucide === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/lucide@latest";
        document.head.appendChild(script);
    }

    
    


                


                    

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
        
        if (chatWindow.classList.contains('active')) {
            window.minimizeAIChat();
        } else {
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            chatWindow.style.visibility = 'visible';
            
            requestAnimationFrame(() => {
                chatWindow.classList.add('active');
            });
            
            fab.style.display = 'none';
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

        chatWindow.classList.remove('active');
        
        setTimeout(() => {
            chatWindow.style.visibility = 'hidden';
            chatWindow.classList.remove('mini');
            chatWindow.classList.remove('sidebar');
        }, 300);
    };

    /**
     */
    window.endAIChat = function() {
        window.minimizeAIChat();

        setTimeout(() => {
        }, 300);
    };

    /**
     */
    window.toggleSidebarMode = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const body = document.body;
        const width = getSidebarWidth();
        
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
        const message = inputField.value.trim(); // 앞뒤 공백 제거

        if (message) {
            // 1. 사용자 메시지를 화면에 즉시 표시
            appendMessage('user', message);
            
            // 2. 입력창 비우기
            inputField.value = '';
            
            fetchAIResponse(message);
        }
    };

    /**
     */
    window.sendSuggestion = function(text) {
    };

    /**
     */
    function appendMessage(type, text) {
        const messageList = document.getElementById('ai-message-list');
        
        
        const bubble = document.createElement('div');
        bubble.innerText = text;


        const chatBody = document.getElementById('ai-chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function fetchAIResponse(userMessage) {
        try {
            /*
            const response = await fetch(widgetConfig.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            */


            appendMessage('bot', botReply);

        } catch (error) {
        }
    }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 엔터 동작(줄바꿈) 방지
            handleSendMessage();
        }
    });

    }
    
})();
