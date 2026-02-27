/**
 * ===================================
 * AI 챗봇 위젯 JavaScript
 * ===================================
 * 작성자: 해봄트립 개발팀
 * 설명: AI 여행 가이드 채팅 위젯의 모든 동적 기능 제어
 * 
 * 주요 기능:
 * 1. 위젯 초기화 및 리소스 로드
 * 2. 채팅창 열기/닫기/최소화
 * 3. 미니 모드 ↔ 사이드바 모드 전환
 * 4. 메시지 송수신 및 화면 표시
 * 5. 백엔드 API 통신 (연동 대기)
 * 
 * 사용 방법:
 * - ai-widget.html이 main.html에서 동적으로 로드됨
 * - ai-widget.css가 head에서 로드됨
 * - 이 스크립트는 페이지 로드 후 자동으로 이벤트 리스너 등록
 * ===================================
 */

(function() {
    /* ===================================
       [설정 영역] 위젯 기본 설정
       백엔드 연결 시 이 값들을 수정하세요
    =================================== */
    const widgetConfig = {
        // 봇 기본 정보
        botName: "AI 해봄",                          // 헤더에 표시될 봇 이름
        botProfileImage: "/img/haebom_hello.png",          // 프로필 이미지 확인해야함
        greetingMessage: " 여행의 모든 것, 무엇이든 해봄이에게 물어보세요!", // 환영 메시지
        
        // 백엔드 API 설정
        apiEndpoint: "/api/chat",                      // 메시지 전송 API 주소 (추후 연동)
        
        // UI 설정
        sidebarWidth: "400px"                          // 사이드바 모드일 때 너비
    };

    /* ===================================
       [초기화 영역] 페이지 로드 시 실행
    =================================== */

    /* [초기화 영역] */
    function loadCSS() {
        if (!document.querySelector('link[href*="ai_widget.css"]')) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = '/static/css/ai_widget.css';
            document.head.appendChild(style);
        }
    }

    /**
     * Lucide 아이콘 라이브러리 로드
     * - 이미 로드되어 있으면 건너뜀
     */
    function loadLucideIcons() {
        if (typeof lucide === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://unpkg.com/lucide@latest";
            document.head.appendChild(script);
            script.onload = () => {
                lucide.createIcons();
                console.log('✅ Lucide 아이콘 로드 완료');
            };
        } else {
            lucide.createIcons();
        }
    }

    /**
     * HTML 구조 동적 로드 및 삽입
     * - ai-widget.html 파일을 가져와서 body에 추가
     */
    function loadWidgetHTML() {
        // 1. 이미 위젯이 로드되어 있는지 확인
        if (document.getElementById('ai-widget-root')) return;

        fetch('/html/ai_widget.html') // 경로를 프로젝트 구조에 맞게 (절대경로 시작)
            .then(response => {
                if (!response.ok) throw new Error('HTML 로드 실패');
                return response.text();
            })
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);

                // 핵심: 렌더링을 보장하기 위해 0ms(다음 이벤트 루프)에 실행
                setTimeout(() => {
                    applyConfig();
                    if (window.lucide) window.lucide.createIcons();
                    initEventListeners();
                    console.log('✅ 위젯 초기화 완료');
                }, 0);
            })
            .catch(err => console.error("❌ 위젯 로딩 에러:", err));
    }

// 초기화 실행
loadCSS();
loadWidgetHTML();

    /**
     * 설정값을 HTML 요소에 적용
     * - widgetConfig의 값들을 실제 화면에 반영
     */
    function applyConfig() {
        const botNameElement = document.getElementById('ai-bot-name');
        const greetingElement = document.getElementById('ai-greeting-text');
        const profileImg = document.getElementById('aiProfileImg');

        if (botNameElement) botNameElement.textContent = widgetConfig.botName;
        if (greetingElement) greetingElement.textContent = widgetConfig.greetingMessage;
        function applyConfig() {
            const profileImg = document.getElementById('aiProfileImg');
            if (profileImg) {
                profileImg.src = widgetConfig.botProfileImage;
                // 이미지 로드 실패 시 무한 호출 방지 및 기본 아이콘 처리
                profileImg.onerror = function() {
                    this.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
                    this.onerror = null;
                };
            }

            // 이미지 로드 실패 시 실행되는 로직
            profileImg.onerror = function() {
                console.warn("⚠️ 프로필 이미지를 찾을 수 없습니다. 경로를 확인하세요.");
                // 해결책: 서버에 없는 파일 대신, 외부의 무료 아이콘 주소를 임시로 넣거나
                // onerror를 null로 만들어 반복 호출을 차단합니다.
                this.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
                this.onerror = null; // 중요: 이 라인이 없으면 404가 계속 뜹니다.
            };

        }

        // setProperty 사용
        document.documentElement.style.setProperty('--ai-sidebar-width', widgetConfig.sidebarWidth);
    }
    /* ===================================
       [UI 제어 함수] 채팅창 열기/닫기/모드 전환
    =================================== */

    /**
     * CSS 변수에서 사이드바 너비 가져오기
     * @returns {string} 사이드바 너비 (예: "400px")
     */
    function getSidebarWidth() {
        const style = getComputedStyle(document.documentElement);
        const val = style.getPropertyValue('--ai-sidebar-width').trim();
        return val ? val : widgetConfig.sidebarWidth;
    }

    /**
     * [함수 1] 채팅창 열기/닫기 토글
     * - FAB 버튼 클릭 시 실행
     * - 열려있으면 최소화, 닫혀있으면 미니 모드로 열기
     */
    window.toggleAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');
        
        if (!chatWindow || !fab) return;
        
        if (chatWindow.classList.contains('active')) {
            // 이미 열려있으면 최소화
            window.minimizeAIChat();
        } else {
            // 닫혀있으면 미니 모드로 열기
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            chatWindow.style.visibility = 'visible';
            
            // 부드러운 애니메이션을 위한 지연
            requestAnimationFrame(() => {
                chatWindow.classList.add('active');
            });
            
            // FAB 버튼 숨김
            fab.style.display = 'none';
            
            console.log('💬 채팅창 열림 (미니 모드)');
        }
    };

    /**
     * [함수 2] 채팅창 최소화
     * - 대화 내용은 유지하고 화면에서만 숨김
     * - 사이드바 모드였다면 본문 레이아웃 복귀
     */
    window.minimizeAIChat = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const fab = document.getElementById('ai-fab');
        const body = document.body;

        if (!chatWindow || !fab) return;

        // 사이드바 모드였으면 본문 밀어냄 해제
        if (body.classList.contains('ai-sidebar-open')) {
            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');
        }

        // 채팅창 숨김 애니메이션 시작
        chatWindow.classList.remove('active');
        
        // 애니메이션 완료 후 완전히 숨김
        setTimeout(() => {
            chatWindow.style.visibility = 'hidden';
            chatWindow.classList.remove('mini');
            chatWindow.classList.remove('sidebar');
            fab.style.display = 'flex'; // FAB 버튼 다시 표시
        }, 300);

        console.log('📥 채팅창 최소화');
    };

    /**
     * [함수 3] 대화 종료 (완전 닫기)
     * - 채팅창 닫고 대화 내용 모두 삭제
     * - 다음에 열 때 초기 상태로 시작
     */
    window.endAIChat = function() {
        // 1. UI 숨기기 (최소화 함수 재사용)
        window.minimizeAIChat();

        // 2. 내용 초기화 (애니메이션 끝난 후)
        setTimeout(() => {
            const messageList = document.getElementById('ai-message-list');
            const inputField = document.getElementById('ai-input-field');
            
            if (messageList) messageList.innerHTML = '';
            if (inputField) inputField.value = '';
            
            console.log('🗑️ 대화 내용 초기화');
        }, 300);
    };

    /**
     * [함수 4] 사이드바 모드 토글
     * - 미니 모드 ↔ 사이드바 모드 전환
     * - 사이드바 모드일 때 본문을 왼쪽으로 밀어냄 (데스크탑만)
     */
    window.toggleSidebarMode = function() {
        const chatWindow = document.getElementById('ai-chat-window');
        const body = document.body;
        const width = getSidebarWidth();
        const isMobile = window.innerWidth <= 768;
        
        if (!chatWindow) return;
        
        const isSidebarMode = chatWindow.classList.contains('sidebar');

        if (isSidebarMode) {
            // [사이드바 → 미니] 전환
            chatWindow.classList.remove('sidebar');
            chatWindow.classList.add('mini');
            
            // 본문 레이아웃 복귀
            body.style.marginRight = '0';
            body.classList.remove('ai-sidebar-open');
            
            console.log('📦 미니 모드로 전환');
        } else {
            // [미니 → 사이드바] 전환
            chatWindow.classList.remove('mini');
            chatWindow.classList.add('sidebar');
            
            // 창이 닫혀있었다면 열기
            if (!chatWindow.classList.contains('active')) {
                chatWindow.classList.add('active');
                chatWindow.style.visibility = 'visible';
            }

            // 데스크탑 환경에서만 본문 밀어냄
            if (!isMobile) {
                body.classList.add('ai-sidebar-open');
                body.style.marginRight = width;
            }
            
            console.log('📌 사이드바 모드로 전환');
        }
    };

    /* ===================================
       [메시지 처리 함수] 송수신 및 화면 표시
    =================================== */

    /**
     * 사용자 메시지 전송 처리 (메인 핸들러)
     * - 전송 버튼 클릭 또는 Enter 키 입력 시 실행
     */
    window.handleSendMessage = function() {
        const inputField = document.getElementById('ai-input-field');
        if (!inputField) return;

        const message = inputField.value.trim(); // 앞뒤 공백 제거

        if (message) {
            // 1. 사용자 메시지를 화면에 즉시 표시
            appendMessage('user', message);
            
            // 2. 입력창 비우기
            inputField.value = '';
            
            // 3. AI 응답 요청
            fetchAIResponse(message);
            
            console.log('📤 사용자 메시지 전송:', message);
        }
    };

    /**
     * 추천 질문 버튼 클릭 처리
     * @param {string} text - 추천 질문 내용
     */
    window.sendSuggestion = function(text) {
        appendMessage('user', text);
        fetchAIResponse(text);
        console.log('💡 추천 질문 전송:', text);
    };

    /**
     * 메시지를 화면에 추가하는 함수
     * - 스타일을 직접 주입하는 대신 CSS 클래스를 활용합니다.
     */
    function appendMessage(type, text) {
        const messageList = document.getElementById('ai-message-list');
        if (!messageList) return;

        // 1. 메시지 행(Row) 생성
        const msgRow = document.createElement('div');
        msgRow.className = `ai-msg-row ${type}`; // 'user' 또는 'bot' 클래스 추가

        // 2. 말풍선(Bubble) 생성
        const bubble = document.createElement('div');
        bubble.className = 'ai-bubble';
        bubble.innerText = text;

        // 3. 조립 및 추가
        msgRow.appendChild(bubble);
        messageList.appendChild(msgRow);

        // 4. 새 메시지 추가 시 스크롤을 맨 아래로 이동
        const chatBody = document.getElementById('ai-chat-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    /* ===================================
    [백엔드 통신] API 연동 영역
    =================================== */

    async function fetchAIResponse(userMessage) {
        // 로딩 표시 등의 UI 처리를 여기에 추가할 수 있습니다.
        
        try {
            // 실제 API 연동 시 주석 해제하여 사용하세요.
            /*
            const response = await fetch(widgetConfig.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: userMessage, // AI에게 전달할 메시지
                    session_id: "user_123" // 필요시 세션 ID 포함
                })
            });

            if (!response.ok) throw new Error('네트워크 응답이 좋지 않습니다.');
            
            const data = await response.json();
            const botReply = data.choices[0].message.content; // API 구조에 맞춰 수정
            */

            // [테스트용 더미 응답]
            await new Promise(resolve => setTimeout(resolve, 800)); 
            const botReply = `해봄이 답변: "${userMessage}"에 대해 친절히 안내해 드릴게요! (API 연동 대기 중)`;

            appendMessage('bot', botReply);

        } catch (error) {
            console.error('❌ API Error:', error);
            appendMessage('bot', '서버와 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    /* ===================================
       [이벤트 리스너] 키보드/마우스 이벤트 처리
    =================================== */

    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // Enter 키로 메시지 전송 (Shift+Enter는 줄바꿈)
        const inputField = document.getElementById('ai-input-field');
        if (inputField) {
            inputField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // 기본 엔터 동작(줄바꿈) 방지
                    handleSendMessage();
                }
            });
        }

        console.log('✅ 이벤트 리스너 등록 완료');
    }

    /* ===================================
       [실행 영역] 위젯 자동 초기화
    =================================== */

    // CSS 로드
    loadCSS();

    // Lucide 아이콘 로드
    loadLucideIcons();

    // HTML 로드 및 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWidgetHTML);
    } else {
        loadWidgetHTML();
    }

    console.log('🚀 AI 챗봇 위젯 초기화 시작');

})();
