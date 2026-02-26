(function() {
    /**
     * [설정 영역]
     * 위젯의 기본 설정값들을 관리하는 객체입니다.
     * 백엔드 연결 시 이 객체의 값을 실제 서버 정보로 수정하세요.
     */
    const widgetConfig = {
        // 봇 기본 정보 (이름, 프로필 사진, 환영 메시지)
        botName: "AI 가이드",
        botProfileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&auto=format&fit=crop&q=60", 
        greetingMessage: "안녕하세요! 여행의 모든 것, 무엇이든 물어보세요.",
        
        // 백엔드 API 설정 (추후 연동 시 사용할 API 주소)
        apiEndpoint: "/api/chat", 
        
        // UI 설정 (사이드바 모드일 때의 너비)
        sidebarWidth: "400px" 
    };

    // =========================================================================
    // 1. 리소스 로드 (CSS 및 아이콘)
    // =========================================================================
    
    // CSS 스타일시트 파일을 동적으로 생성하여 헤더에 추가합니다.
    // 이를 통해 HTML 파일에 별도로 <link> 태그를 넣지 않아도 스타일이 적용됩니다.
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'css/ai-widget.css';
    document.head.appendChild(style);

    // Lucide 아이콘 라이브러리가 로드되지 않았을 경우, CDN을 통해 스크립트를 로드합니다.
    if (typeof lucide === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/lucide@latest";
        document.head.appendChild(script);
        // 스크립트 로드 완료 후 아이콘을 렌더링합니다.
        script.onload = () => lucide.createIcons();
    }

    // =========================================================================
    // 2. HTML 구조 생성 및 주입
    // =========================================================================
    
    // 위젯 전체를 감싸는 컨테이너 요소를 생성합니다.
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'ai-widget-root';
    
    // 위젯의 내부 HTML 구조를 정의합니다.
    // - ai-fab: 우측 하단 둥근 플로팅 버튼
    // - ai-chat-window: 채팅창 메인 컨테이너 (헤더, 본문, 입력창)
    widgetContainer.innerHTML = `
        <!-- 플로팅 액션 버튼 (우측 하단 원형 버튼) -->
        <div id="ai-fab" class="ai-fab-container">
            <button class="ai-fab-btn" onclick="toggleAIChat()" aria-label="AI 채팅 열기">
                 <i data-lucide="message-circle-more"></i>
            </button>
        </div>

        <!-- 채팅 메인 윈도우 -->
        <div id="ai-chat-window" class="ai-chat-window">
            <!-- 헤더 영역: 봇 이름과 제어 버튼들(사이드바, 최소화, 닫기)이 위치함 -->
            <div class="ai-header">
                <div class="ai-title">
                    <i data-lucide="sparkles" size="18"></i>
                    <span id="ai-bot-name">${widgetConfig.botName}</span>
                </div>
                <div class="ai-controls">
                    <!-- 사이드바 모드 전환 버튼 -->
                    <button class="ai-btn-icon" onclick="toggleSidebarMode()" title="사이드바 모드 전환">
                        <i data-lucide="panel-right-open"></i>
                    </button>
                    <!-- 최소화 버튼 (대화 내용 유지) -->
                    <button class="ai-btn-icon" onclick="minimizeAIChat()" title="채팅창 숨기기 (대화 유지)">
                        <i data-lucide="minus"></i>
                    </button>
                    <!-- 종료 버튼 (대화 내용 초기화) -->
                    <button class="ai-btn-icon" onclick="endAIChat()" title="대화 종료 (초기화)">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            </div>

            <!-- 채팅 내용 영역: 메시지 목록과 추천 질문 버튼들이 표시됨 -->
            <div class="ai-body" id="ai-chat-body">
                <!-- 환영 메시지 및 프로필 이미지 -->
                <div class="ai-welcome">
                    <div class="ai-profile-container">
                        <img src="${widgetConfig.botProfileImage}" class="ai-mascot-lg" alt="AI 프로필" id="aiProfileImg">
                    </div>
                    <h3 id="ai-greeting-text">${widgetConfig.greetingMessage}</h3>
                </div>
                
                <!-- 추천 질문 버튼 목록: 사용자가 클릭하면 바로 질문이 전송됨 -->
                <div class="ai-suggestions" id="ai-suggestions">
                    <button class="ai-suggestion-btn" onclick="sendSuggestion('제주도 2박 3일 힐링 코스 추천해줘')">
                        <i data-lucide="map-pin"></i>
                        <span>제주도 여행 코스 추천해줘</span>
                    </button>
                    <button class="ai-suggestion-btn" onclick="sendSuggestion('지금 보고 있는 여행지 사진 더 보여줘')">
                        <i data-lucide="camera"></i>
                        <span>지금 보고 있는 여행지 사진 더 보여줘</span>
                    </button>
                    <button class="ai-suggestion-btn" onclick="sendSuggestion('주변 맛집이랑 카페 추천해줘')">
                        <i data-lucide="utensils"></i>
                        <span>주변 맛집이랑 카페 추천해줘</span>
                    </button>
                </div>

                <!-- 사용자와 봇의 메시지가 동적으로 추가될 영역 -->
                <div id="ai-message-list"></div>
            </div>

            <!-- 입력 영역 (푸터): 텍스트 입력창과 전송 버튼이 위치함 -->
            <div class="ai-footer">
                <div class="ai-input-box">
                    <div class="ai-input-tag">
                        <span>AI Assistant</span>
                    </div>
                    <textarea id="ai-input-field" class="ai-textarea" placeholder="메시지를 입력하세요..." rows="1"></textarea>
                    
                    <!-- 입력창 하단 버튼 영역: 전송 버튼을 우측 정렬로 배치 -->
                    <div class="ai-input-actions" style="justify-content: flex-end;">
                        <!-- 파일 첨부 버튼 제거됨 -->
                        <button class="ai-send-btn" id="ai-send-btn" title="전송" onclick="handleSendMessage()">
                            <i data-lucide="arrow-up" size="18"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 생성한 위젯을 HTML body의 맨 끝에 추가하여 화면에 표시합니다.
    document.body.appendChild(widgetContainer);

    // =========================================================================
    // 3. UI 제어 로직 (열기, 최소화, 종료, 사이드바 확장/축소)
    // =========================================================================

    /**
     * CSS 변수(--ai-sidebar-width)에서 사이드바 너비 값을 가져옵니다.
     * 값이 없으면 설정 객체(widgetConfig)의 기본값을 사용합니다.
     */
    function getSidebarWidth() {
        const style = getComputedStyle(document.documentElement);
        const val = style.getPropertyValue('--ai-sidebar-width').trim();
        return val ? val : widgetConfig.sidebarWidth;
    }

    /**
     * 채팅창 열기/닫기 토글 함수 (우측 하단 FAB 버튼 클릭 시 실행)
     * - 이미 열려있으면 최소화합니다.
     * - 닫혀있거나 최소화된 상태면 '미니 모드'로 엽니다.
     */
    window.toggleAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');
        
        if (chatWindow.classList.contains('active')) {
            // 이미 열려있으면 최소화 (대화 내용 유지)
            window.minimizeAIChat();
        } else {
            // 열기 (기본값: 미니 모드)
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            chatWindow.style.visibility = 'visible';
            
            // 트랜지션 애니메이션을 위해 약간의 지연 후 active 클래스 추가
            requestAnimationFrame(() => {
                chatWindow.classList.add('active');
            });
            
            // 채팅창이 열리면 플로팅 버튼은 숨깁니다.
            fab.style.display = 'none';
        }
    };

    /**
     * [기능 1] 최소화 함수
     * - 채팅창을 화면에서 숨기지만, 대화 내용은 그대로 유지합니다.
     * - 사이드바 모드였다면 밀려났던 본문 레이아웃을 원래대로 되돌립니다.
     */
    window.minimizeAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');
        const body = document.body;

        // 사이드바 모드였을 경우, 밀려난 본문을 복귀시킵니다.
        if (body.classList.contains('ai-sidebar-open')) {
            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');
        }

        // 활성화 상태 제거 (애니메이션 시작)
        chatWindow.classList.remove('active');
        
        // 애니메이션(0.3초)이 끝난 후 요소를 완전히 숨기고 플로팅 버튼을 다시 표시합니다.
        setTimeout(() => {
            chatWindow.style.visibility = 'hidden';
            chatWindow.classList.remove('mini');
            chatWindow.classList.remove('sidebar');
            fab.style.display = 'flex'; 
        }, 300);
    };

    /**
     * [기능 2] 대화 종료 (닫기) 함수
     * - 채팅창을 닫고, 대화 내용을 모두 지워 초기화합니다.
     */
    window.endAIChat = function() {
        // 1. UI 숨기기 (최소화 로직 재사용)
        window.minimizeAIChat();

        // 2. 내용 초기화 (창이 닫히는 애니메이션 동안 깜빡이지 않도록 0.3초 뒤에 실행)
        setTimeout(() => {
            document.getElementById('ai-message-list').innerHTML = ''; // 메시지 목록 삭제
            document.getElementById('ai-input-field').value = '';      // 입력창 비우기
            console.log("AI 대화 내용이 초기화되었습니다.");
        }, 300);
    };

    /**
     * [기능 3] 사이드바 모드 토글 (확장/축소) 함수
     * - '미니 모드'일 때 클릭하면 -> '사이드바 모드'로 확장
     * - '사이드바 모드'일 때 클릭하면 -> '미니 모드'로 축소
     */
    window.toggleSidebarMode = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const body = document.body;
        const width = getSidebarWidth();
        const isMobile = window.innerWidth <= 768; // 모바일 환경 체크
        
        // 현재 사이드바 모드인지 확인
        const isSidebarMode = chatWindow.classList.contains('sidebar');

        if (isSidebarMode) {
            // [사이드바 -> 미니 모드] 전환
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            
            // 본문 레이아웃 복귀 (본문 밀어냄 해제)
            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');
            
        } else {
            // [미니 모드 -> 사이드바 모드] 전환
            chatWindow.classList.remove('mini');
            chatWindow.classList.add('sidebar');
            
            // 만약 창이 닫혀있었다면 보이게 처리 (예외 처리)
            if (!chatWindow.classList.contains('active')) {
                chatWindow.classList.add('active');
                chatWindow.style.visibility = 'visible';
            }

            // 데스크탑 환경에서는 본문을 왼쪽으로 밀어내어 채팅창 공간을 확보합니다.
            if (!isMobile) {
                body.classList.add('ai-sidebar-open');
                body.style.marginRight = width;
            }
        }
    };

    // =========================================================================
    // 4. 채팅 비즈니스 로직 (메시지 전송 및 백엔드 연동)
    // =========================================================================

    /**
     * 사용자가 전송 버튼을 누르거나 엔터키를 쳤을 때 실행되는 메인 핸들러
     */
    window.handleSendMessage = function() {
        const inputField = document.getElementById('ai-input-field');
        const message = inputField.value.trim(); // 앞뒤 공백 제거

        if (message) {
            // 1. 사용자 메시지를 화면에 즉시 표시
            appendMessage('user', message);
            
            // 2. 입력창 비우기
            inputField.value = '';
            
            // 3. AI 응답 요청 시작
            fetchAIResponse(message);
        }
    };

    /**
     * 추천 질문 버튼을 클릭했을 때 실행되는 핸들러
     * @param {string} text - 버튼에 적힌 질문 내용
     */
    window.sendSuggestion = function(text) {
        appendMessage('user', text); // 사용자 메시지로 표시
        fetchAIResponse(text);       // AI 응답 요청
    };

    /**
     * 화면에 메시지 말풍선을 추가하는 함수
     * @param {string} type - 'user'(사용자) 또는 'bot'(AI)
     * @param {string} text - 표시할 메시지 내용
     */
    function appendMessage(type, text) {
        const messageList = document.getElementById('ai-message-list');
        const msgDiv = document.createElement('div');
        
        const isUser = type === 'user';
        
        // 메시지 정렬 (사용자는 오른쪽, 봇은 왼쪽)
        msgDiv.style.cssText = `
            display: flex;
            justify-content: ${isUser ? 'flex-end' : 'flex-start'};
            margin-bottom: 12px;
            padding: 0 10px;
        `;

        // 말풍선 스타일 정의
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            background-color: ${isUser ? '#F97316' : '#F3F4F6'}; /* 사용자는 주황색, 봇은 회색 */
            color: ${isUser ? '#FFFFFF' : '#1F2937'};
            border-bottom-${isUser ? 'right' : 'left'}-radius: 4px; /* 말꼬리 효과 */
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        `;
        bubble.innerText = text;

        msgDiv.appendChild(bubble);
        messageList.appendChild(msgDiv);

        // 새 메시지가 추가되면 스크롤을 맨 아래로 이동
        const chatBody = document.getElementById('ai-chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    /**
     * [백엔드 통신 함수]
     * 사용자 메시지를 서버로 보내고 AI 응답을 받아옵니다.
     */
    async function fetchAIResponse(userMessage) {
        try {
            // TODO: 실제 서비스 배포 시 아래 주석을 해제하고 백엔드 API와 연동하세요.
            /*
            const response = await fetch(widgetConfig.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await response.json();
            const botReply = data.reply;
            */

            // 현재는 테스트용 더미 응답(1초 지연)을 반환합니다.
            await new Promise(resolve => setTimeout(resolve, 1000));
            const botReply = `"${userMessage}"에 대한 답변입니다. (백엔드 연결이 필요합니다)`;

            // AI 응답을 화면에 표시
            appendMessage('bot', botReply);

        } catch (error) {
            console.error('AI 응답 오류:', error);
            appendMessage('bot', '죄송합니다. 오류가 발생했습니다.');
        }
    }

    // =========================================================================
    // 5. 이벤트 리스너 등록
    // =========================================================================

    // 입력창에서 Enter 키 입력 시 메시지 전송 (Shift+Enter는 줄바꿈)
    document.getElementById('ai-input-field').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 엔터 동작(줄바꿈) 방지
            handleSendMessage();
        }
    });

    // 아이콘 라이브러리 초기화 (동적으로 추가된 아이콘을 렌더링)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
})();
