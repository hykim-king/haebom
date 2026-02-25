/* ===================================
   해봄트립 관리자 페이지 - JavaScript
   Admin Dashboard Functions
   
   주요 기능:
   1. 사용자 관리 (조회/검색/수정/삭제)
   2. 댓글 관리 (조회/검색/삭제)
   3. 신고 접수 (조회/필터링/상태변경/처리)
   4. 문의사항 (조회/필터링/답변등록)
   5. 데이터 통계 (차트 시각화)
   
   ⚠️ 백엔드 연동 가이드:
   -------------------------------------
   1. 이 파일에서 " === MOCK DATA START ===" 부터 
      " === MOCK DATA END ===" 까지의 모든 코드를 삭제
   
   2. 각 함수 내 " TODO: 백엔드 API 연동 " 주석을 찾아
      해당 부분의 Mock 데이터 로직을 실제 API 호출로 교체
   
   3. API 연동 예제는 각 함수 주석에 포함되어 있음
   
   4. HTML 파일에서 테스트 모드 UI 삭제:
      - .test-mode-badge 삭제
      - .btn-test-info 버튼 삭제
      - #test-info-panel 전체 삭제
   
   5. CSS 파일에서 "/* 테스트 모드 UI " 섹션 삭제
=================================== */

/* ===================================
   === MOCK DATA START ===
   ⚠️ 백엔드 연동 시 아래부터 "=== MOCK DATA END ===" 까지 전체 삭제
=================================== */

// 사용자 데이터 (50명)
let usersData = [
  { id: 1, name: '김민수', email: 'minsu@example.com', nickname: '여행러버', joinDate: '2023-09-15', status: 'active' },
  { id: 2, name: '이지은', email: 'jieun@example.com', nickname: '해봄이친구', joinDate: '2023-09-20', status: 'active' },
  { id: 3, name: '박준호', email: 'junho@example.com', nickname: '전국일주', joinDate: '2023-10-01', status: 'active' },
  { id: 4, name: '최서연', email: 'seoyeon@example.com', nickname: '여행가자', joinDate: '2023-10-10', status: 'inactive' },
  { id: 5, name: '정우진', email: 'woojin@example.com', nickname: '호랑이', joinDate: '2023-10-15', status: 'active' },
  { id: 6, name: '강민지', email: 'minji@example.com', nickname: '제주러', joinDate: '2023-10-20', status: 'suspended' },
  { id: 7, name: '윤서준', email: 'seojun@example.com', nickname: '캠핑러', joinDate: '2023-10-25', status: 'active' },
  { id: 8, name: '한예린', email: 'yerin@example.com', nickname: '산악인', joinDate: '2023-11-01', status: 'active' },
  { id: 9, name: '조현우', email: 'hyunwoo@example.com', nickname: '사진작가', joinDate: '2023-11-05', status: 'active' },
  { id: 10, name: '송하늘', email: 'haneul@example.com', nickname: '하늘여행', joinDate: '2023-11-10', status: 'active' },
  { id: 11, name: '임도윤', email: 'doyun@example.com', nickname: '도윤이', joinDate: '2023-11-15', status: 'active' },
  { id: 12, name: '장서윤', email: 'seoyoon@example.com', nickname: '서윤맘', joinDate: '2023-11-20', status: 'active' },
  { id: 13, name: '홍지우', email: 'jiwoo@example.com', nickname: '지우네', joinDate: '2023-11-25', status: 'inactive' },
  { id: 14, name: '권민재', email: 'minjae@example.com', nickname: '민재짱', joinDate: '2023-12-01', status: 'active' },
  { id: 15, name: '배수아', email: 'sua@example.com', nickname: '수아언니', joinDate: '2023-12-05', status: 'active' },
  { id: 16, name: '안유진', email: 'yujin@example.com', nickname: '유진이', joinDate: '2023-12-10', status: 'active' },
  { id: 17, name: '신동혁', email: 'donghyuk@example.com', nickname: '동혁오빠', joinDate: '2023-12-15', status: 'active' },
  { id: 18, name: '오승민', email: 'seungmin@example.com', nickname: '승민', joinDate: '2023-12-20', status: 'suspended' },
  { id: 19, name: '류지훈', email: 'jihoon@example.com', nickname: '지훈이형', joinDate: '2023-12-25', status: 'active' },
  { id: 20, name: '서예은', email: 'yeeun@example.com', nickname: '예은씨', joinDate: '2024-01-01', status: 'active' },
  { id: 21, name: '전민석', email: 'minseok@example.com', nickname: '민석', joinDate: '2024-01-05', status: 'active' },
  { id: 22, name: '노수빈', email: 'subin@example.com', nickname: '수빈이', joinDate: '2024-01-10', status: 'active' },
  { id: 23, name: '하준영', email: 'junyoung@example.com', nickname: '준영이네', joinDate: '2024-01-15', status: 'active' },
  { id: 24, name: '문채원', email: 'chaewon@example.com', nickname: '채원맘', joinDate: '2024-01-20', status: 'active' },
  { id: 25, name: '백시우', email: 'siwoo@example.com', nickname: '시우아빠', joinDate: '2024-01-25', status: 'inactive' },
  { id: 26, name: '양다은', email: 'daeun@example.com', nickname: '다은언니', joinDate: '2024-02-01', status: 'active' },
  { id: 27, name: '표민호', email: 'minho@example.com', nickname: '민호형', joinDate: '2024-02-05', status: 'active' },
  { id: 28, name: '손유나', email: 'yuna@example.com', nickname: '유나', joinDate: '2024-02-10', status: 'active' },
  { id: 29, name: '황재현', email: 'jaehyun@example.com', nickname: '재현이', joinDate: '2024-02-15', status: 'active' },
  { id: 30, name: '곽서진', email: 'seojin@example.com', nickname: '서진씨', joinDate: '2024-02-20', status: 'active' },
  { id: 31, name: '남궁민', email: 'namgoong@example.com', nickname: '궁민', joinDate: '2024-02-25', status: 'active' },
  { id: 32, name: '제갈윤', email: 'jegal@example.com', nickname: '갈윤', joinDate: '2024-03-01', status: 'active' },
  { id: 33, name: '선우진', email: 'sunwoo@example.com', nickname: '우진', joinDate: '2024-03-05', status: 'suspended' },
  { id: 34, name: '독고영', email: 'dokgo@example.com', nickname: '고영', joinDate: '2024-03-10', status: 'active' },
  { id: 35, name: '황보라', email: 'hwangbo@example.com', nickname: '보라', joinDate: '2024-03-15', status: 'active' },
  { id: 36, name: '사공민', email: 'sagong@example.com', nickname: '공민', joinDate: '2024-03-18', status: 'active' },
  { id: 37, name: '제강현', email: 'jekang@example.com', nickname: '강현', joinDate: '2024-03-19', status: 'active' },
  { id: 38, name: '탁수진', email: 'tak@example.com', nickname: '수진', joinDate: '2024-03-20', status: 'active' },
  { id: 39, name: '도예림', email: 'doyerim@example.com', nickname: '예림', joinDate: '2024-03-21', status: 'active' },
  { id: 40, name: '빈채연', email: 'bin@example.com', nickname: '채연', joinDate: '2024-03-22', status: 'active' },
  { id: 41, name: '석지훈', email: 'seok@example.com', nickname: '지훈석', joinDate: '2024-03-23', status: 'active' },
  { id: 42, name: '옥수아', email: 'ok@example.com', nickname: '수아옥', joinDate: '2024-03-24', status: 'active' },
  { id: 43, name: '견우진', email: 'gyeon@example.com', nickname: '우진견', joinDate: '2024-03-25', status: 'inactive' },
  { id: 44, name: '설민지', email: 'seol@example.com', nickname: '민지설', joinDate: '2024-03-26', status: 'active' },
  { id: 45, name: '방혜린', email: 'bang@example.com', nickname: '혜린방', joinDate: '2024-03-27', status: 'active' },
  { id: 46, name: '추재민', email: 'chu@example.com', nickname: '재민추', joinDate: '2024-03-28', status: 'active' },
  { id: 47, name: '경다현', email: 'kyung@example.com', nickname: '다현경', joinDate: '2024-03-29', status: 'active' },
  { id: 48, name: '목서윤', email: 'mok@example.com', nickname: '서윤목', joinDate: '2024-03-30', status: 'active' },
  { id: 49, name: '창민호', email: 'chang@example.com', nickname: '민호창', joinDate: '2024-03-31', status: 'active' },
  { id: 50, name: '편수빈', email: 'pyun@example.com', nickname: '수빈편', joinDate: '2024-04-01', status: 'active' },
];

// 댓글 데이터 (50개)
let commentsData = [
  { id: 1, author: '김민수', content: '정말 좋은 여행지네요! 다음에 꼭 가보고 싶어요.', post: '제주도 여행 코스', date: '2024-03-15' },
  { id: 2, author: '이지은', content: '사진이 너무 예쁘게 나왔어요~', post: '경주 벚꽃 명소', date: '2024-03-14' },
  { id: 3, author: '박준호', content: '저도 다녀왔는데 강추합니다!', post: '부산 맛집 투어', date: '2024-03-13' },
  { id: 4, author: '최서연', content: '가족여행으로 가기 좋을까요?', post: '강원도 캠핑장', date: '2024-03-12' },
  { id: 5, author: '정우진', content: '유용한 정보 감사합니다!', post: '서울 근교 드라이브', date: '2024-03-11' },
  { id: 6, author: '강민지', content: '제주도는 언제가도 좋아요', post: '제주도 숨은 명소', date: '2024-03-10' },
  { id: 7, author: '윤서준', content: '캠핑 꿀팁 감사합니다', post: '초보 캠핑 가이드', date: '2024-03-09' },
  { id: 8, author: '한예린', content: '등산로 정보 정확해요', post: '북한산 등산 코스', date: '2024-03-08' },
  { id: 9, author: '조현우', content: '사진 찍기 좋은 곳이네요', post: '인스타 감성 카페', date: '2024-03-07' },
  { id: 10, author: '송하늘', content: '비행기표가 너무 비싸요', post: '항공권 할인 팁', date: '2024-03-06' },
  { id: 11, author: '임도윤', content: '아이들과 가기 좋네요', post: '키즈 카페 추천', date: '2024-03-05' },
  { id: 12, author: '장서윤', content: '엄마표 여행 코스 감사해요', post: '유아 동반 여행', date: '2024-03-04' },
  { id: 13, author: '홍지우', content: '혼자 여행하기 좋을까요?', post: '혼행 추천지', date: '2024-03-03' },
  { id: 14, author: '권민재', content: '대학생 여행으로 딱이네요', post: '저렴한 여행지', date: '2024-03-02' },
  { id: 15, author: '배수아', content: '친구들이랑 가야겠어요', post: '20대 여행지', date: '2024-03-01' },
  { id: 16, author: '안유진', content: '다음 주말에 가려고 해요', post: '주말 당일치기', date: '2024-02-29' },
  { id: 17, author: '신동혁', content: '드라이브 코스 최고예요', post: '환상의 드라이브', date: '2024-02-28' },
  { id: 18, author: '오승민', content: '날씨가 중요할 것 같아요', post: '봄 여행지', date: '2024-02-27' },
  { id: 19, author: '류지훈', content: '벚꽃 시즌에 가면 좋겠네요', post: '벚꽃 명소', date: '2024-02-26' },
  { id: 20, author: '서예은', content: '예약은 어디서 하나요?', post: '펜션 추천', date: '2024-02-25' },
  { id: 21, author: '전민석', content: '가격 정보 알려주세요', post: '숙박 시설', date: '2024-02-24' },
  { id: 22, author: '노수빈', content: '주차 공간이 있나요?', post: '자동차 여행', date: '2024-02-23' },
  { id: 23, author: '하준영', content: '대중교통으로도 갈 수 있나요?', post: '버스 여행', date: '2024-02-22' },
  { id: 24, author: '문채원', content: '맛집 정보도 알려주세요', post: '지역 맛집', date: '2024-02-21' },
  { id: 25, author: '백시우', content: '아이 놀이터가 있나요?', post: '가족 여행지', date: '2024-02-20' },
  { id: 26, author: '양다은', content: '애견 동반 가능한가요?', post: '펫 동반 여행', date: '2024-02-19' },
  { id: 27, author: '표민호', content: '낚시터가 있나요?', post: '낚시 여행', date: '2024-02-18' },
  { id: 28, author: '손유나', content: '카페 분위기 좋네요', post: '감성 카페', date: '2024-02-17' },
  { id: 29, author: '황재현', content: '야경이 멋져요', post: '야경 명소', date: '2024-02-16' },
  { id: 30, author: '곽서진', content: '일출 보기 좋은가요?', post: '일출 명소', date: '2024-02-15' },
  { id: 31, author: '남궁민', content: '겨울에도 갈 수 있나요?', post: '사계절 여행', date: '2024-02-14' },
  { id: 32, author: '제갈윤', content: '스키장이 가까운가요?', post: '겨울 여행', date: '2024-02-13' },
  { id: 33, author: '선우진', content: '온천도 있나요?', post: '온천 여행', date: '2024-02-12' },
  { id: 34, author: '독고영', content: '힐링하기 좋네요', post: '힐링 여행', date: '2024-02-11' },
  { id: 35, author: '황보라', content: '산책로가 있나요?', post: '산책 코스', date: '2024-02-10' },
  { id: 36, author: '사공민', content: '자전거 대여 가능한가요?', post: '자전거 여행', date: '2024-02-09' },
  { id: 37, author: '제강현', content: '수영장이 있나요?', post: '워터파크', date: '2024-02-08' },
  { id: 38, author: '탁수진', content: '놀이기구가 많나요?', post: '테마파크', date: '2024-02-07' },
  { id: 39, author: '도예림', content: '박물관은 어떤가요?', post: '문화 체험', date: '2024-02-06' },
  { id: 40, author: '빈채연', content: '공연 일정이 있나요?', post: '공연 관람', date: '2024-02-05' },
  { id: 41, author: '석지훈', content: '전시회 볼만한가요?', post: '전시 관람', date: '2024-02-04' },
  { id: 42, author: '옥수아', content: '체험 프로그램 있나요?', post: '체험 여행', date: '2024-02-03' },
  { id: 43, author: '견우진', content: '농장 체험 재밌을까요?', post: '농촌 체험', date: '2024-02-02' },
  { id: 44, author: '설민지', content: '바다가 보이나요?', post: '바다 여행', date: '2024-02-01' },
  { id: 45, author: '방혜린', content: '서핑 배울 수 있나요?', post: '서핑 여행', date: '2024-01-31' },
  { id: 46, author: '추재민', content: '스쿠버 다이빙 가능한가요?', post: '다이빙 여행', date: '2024-01-30' },
  { id: 47, author: '경다현', content: '요트 체험 하고 싶어요', post: '요트 투어', date: '2024-01-29' },
  { id: 48, author: '목서윤', content: '패러글라이딩 어떤가요?', post: '익스트림 스포츠', date: '2024-01-28' },
  { id: 49, author: '창민호', content: '번지점프 무서울까요?', post: '스릴 체험', date: '2024-01-27' },
  { id: 50, author: '편수빈', content: '집라인 재밌나요?', post: '어드벤처', date: '2024-01-26' },
];

// 신고 데이터 (50개)
let reportsData = [
  { id: 1, type: 'spam', target: '댓글 #123', content: '광고성 게시물입니다', reporter: '김민수', date: '2024-03-18', status: 'pending' },
  { id: 2, type: 'abuse', target: '댓글 #456', content: '욕설이 포함되어 있습니다', reporter: '이지은', date: '2024-03-18', status: 'pending' },
  { id: 3, type: 'inappropriate', target: '게시물 #789', content: '부적절한 사진이 있습니다', reporter: '박준호', date: '2024-03-18', status: 'pending' },
  { id: 4, type: 'spam', target: '댓글 #234', content: '스팸 댓글입니다', reporter: '최서연', date: '2024-03-17', status: 'pending' },
  { id: 5, type: 'etc', target: '게시물 #567', content: '허위 정보가 포함되어 있습니다', reporter: '정우진', date: '2024-03-17', status: 'pending' },
  { id: 6, type: 'abuse', target: '댓글 #890', content: '비방 댓글입니다', reporter: '강민지', date: '2024-03-16', status: 'completed' },
  { id: 7, type: 'spam', target: '댓글 #345', content: '광고 링크가 포함되어 있습니다', reporter: '윤서준', date: '2024-03-15', status: 'completed' },
  { id: 8, type: 'inappropriate', target: '게시물 #678', content: '주제와 무관한 내용입니다', reporter: '한예린', date: '2024-03-14', status: 'completed' },
  { id: 9, type: 'spam', target: '댓글 #111', content: '홍보 댓글입니다', reporter: '조현우', date: '2024-03-18', status: 'pending' },
  { id: 10, type: 'abuse', target: '댓글 #222', content: '혐오 발언이 있습니다', reporter: '송하늘', date: '2024-03-17', status: 'pending' },
  { id: 11, type: 'inappropriate', target: '게시물 #333', content: '불쾌한 이미지입니다', reporter: '임도윤', date: '2024-03-16', status: 'pending' },
  { id: 12, type: 'etc', target: '댓글 #444', content: '사기 의심 댓글입니다', reporter: '장서윤', date: '2024-03-15', status: 'completed' },
  { id: 13, type: 'spam', target: '게시물 #555', content: '중복 게시물입니다', reporter: '홍지우', date: '2024-03-14', status: 'completed' },
  { id: 14, type: 'abuse', target: '댓글 #666', content: '인신공격 댓글입니다', reporter: '권민재', date: '2024-03-13', status: 'completed' },
  { id: 15, type: 'inappropriate', target: '게시물 #777', content: '성적인 내용이 있습니다', reporter: '배수아', date: '2024-03-12', status: 'completed' },
  { id: 16, type: 'spam', target: '댓글 #888', content: '불법 사이트 링크입니다', reporter: '안유진', date: '2024-03-11', status: 'completed' },
  { id: 17, type: 'abuse', target: '댓글 #999', content: '명예훼손 댓글입니다', reporter: '신동혁', date: '2024-03-10', status: 'completed' },
  { id: 18, type: 'etc', target: '게시물 #1010', content: '저작권 침해 의심', reporter: '오승민', date: '2024-03-18', status: 'pending' },
  { id: 19, type: 'spam', target: '댓글 #1111', content: '도박 사이트 홍보', reporter: '류지훈', date: '2024-03-17', status: 'pending' },
  { id: 20, type: 'inappropriate', target: '게시물 #1212', content: '폭력적인 내용', reporter: '서예은', date: '2024-03-16', status: 'pending' },
  { id: 21, type: 'abuse', target: '댓글 #1313', content: '차별적 발언', reporter: '전민석', date: '2024-03-15', status: 'completed' },
  { id: 22, type: 'spam', target: '댓글 #1414', content: '피싱 사이트 링크', reporter: '노수빈', date: '2024-03-14', status: 'completed' },
  { id: 23, type: 'etc', target: '게시물 #1515', content: '개인정보 노출', reporter: '하준영', date: '2024-03-13', status: 'completed' },
  { id: 24, type: 'inappropriate', target: '댓글 #1616', content: '불법 촬영물 공유', reporter: '문채원', date: '2024-03-12', status: 'completed' },
  { id: 25, type: 'spam', target: '게시물 #1717', content: '무단 영리 광고', reporter: '백시우', date: '2024-03-11', status: 'completed' },
  { id: 26, type: 'abuse', target: '댓글 #1818', content: '협박성 댓글', reporter: '양다은', date: '2024-03-18', status: 'pending' },
  { id: 27, type: 'inappropriate', target: '게시물 #1919', content: '미성년자 유해', reporter: '표민호', date: '2024-03-17', status: 'pending' },
  { id: 28, type: 'etc', target: '댓글 #2020', content: '테러 조장', reporter: '손유나', date: '2024-03-16', status: 'pending' },
  { id: 29, type: 'spam', target: '댓글 #2121', content: '다단계 홍보', reporter: '황재현', date: '2024-03-15', status: 'completed' },
  { id: 30, type: 'abuse', target: '게시물 #2222', content: '괴롭힘 행위', reporter: '곽서진', date: '2024-03-14', status: 'completed' },
  { id: 31, type: 'inappropriate', target: '댓글 #2323', content: '자살 조장', reporter: '남궁민', date: '2024-03-13', status: 'completed' },
  { id: 32, type: 'spam', target: '게시물 #2424', content: '불법 제품 판매', reporter: '제갈윤', date: '2024-03-12', status: 'completed' },
  { id: 33, type: 'etc', target: '댓글 #2525', content: '사칭 행위', reporter: '선우진', date: '2024-03-11', status: 'completed' },
  { id: 34, type: 'abuse', target: '게시물 #2626', content: '집단 괴롭힘', reporter: '독고영', date: '2024-03-10', status: 'completed' },
  { id: 35, type: 'inappropriate', target: '댓글 #2727', content: '동물 학대', reporter: '황보라', date: '2024-03-09', status: 'completed' },
  { id: 36, type: 'spam', target: '게시물 #2828', content: '무분별한 홍보', reporter: '사공민', date: '2024-03-08', status: 'completed' },
  { id: 37, type: 'abuse', target: '댓글 #2929', content: '종교 비방', reporter: '제강현', date: '2024-03-07', status: 'completed' },
  { id: 38, type: 'etc', target: '게시물 #3030', content: '정치 선동', reporter: '탁수진', date: '2024-03-06', status: 'completed' },
  { id: 39, type: 'inappropriate', target: '댓글 #3131', content: '혐오 표현', reporter: '도예림', date: '2024-03-05', status: 'completed' },
  { id: 40, type: 'spam', target: '게시물 #3232', content: '불법 다운로드 유도', reporter: '빈채연', date: '2024-03-04', status: 'completed' },
  { id: 41, type: 'abuse', target: '댓글 #3333', content: '성희롱 댓글', reporter: '석지훈', date: '2024-03-03', status: 'completed' },
  { id: 42, type: 'inappropriate', target: '게시물 #3434', content: '마약 관련 내용', reporter: '옥수아', date: '2024-03-02', status: 'completed' },
  { id: 43, type: 'etc', target: '댓글 #3535', content: '불법 도박 유도', reporter: '견우진', date: '2024-03-01', status: 'completed' },
  { id: 44, type: 'spam', target: '게시물 #3636', content: '가짜뉴스 유포', reporter: '설민지', date: '2024-02-29', status: 'completed' },
  { id: 45, type: 'abuse', target: '댓글 #3737', content: '지역 비하', reporter: '방혜린', date: '2024-02-28', status: 'completed' },
  { id: 46, type: 'inappropriate', target: '게시물 #3838', content: '유혈 낭자 이미지', reporter: '추재민', date: '2024-02-27', status: 'completed' },
  { id: 47, type: 'etc', target: '댓글 #3939', content: '해킹 유도', reporter: '경다현', date: '2024-02-26', status: 'completed' },
  { id: 48, type: 'spam', target: '게시물 #4040', content: '악성코드 배포', reporter: '목서윤', date: '2024-02-25', status: 'completed' },
  { id: 49, type: 'abuse', target: '댓글 #4141', content: '장애인 비하', reporter: '창민호', date: '2024-02-24', status: 'completed' },
  { id: 50, type: 'inappropriate', target: '게시물 #4242', content: '범죄 조장', reporter: '편수빈', date: '2024-02-23', status: 'completed' },
];

// 문의사항 데이터 (30개)
let inquiriesData = [
  { id: 1, title: '회원 탈퇴 문의', author: '김민수', email: 'minsu@example.com', content: '회원 탈퇴는 어떻게 하나요?', date: '2024-03-18', status: 'pending', reply: '' },
  { id: 2, title: '여행 코스 추가 요청', author: '이지은', email: 'jieun@example.com', content: '제주도 3박4일 코스를 추가해주세요', date: '2024-03-17', status: 'pending', reply: '' },
  { id: 3, title: '결제 오류 문의', author: '박준호', email: 'junho@example.com', content: '결제가 되지 않습니다', date: '2024-03-16', status: 'completed', reply: '결제 시스템을 확인해주세요. 카드사에 문의하시면 됩니다.' },
  { id: 4, title: '사진 업로드 문의', author: '최서연', email: 'seoyeon@example.com', content: '사진 업로드가 안됩니다', date: '2024-03-15', status: 'completed', reply: '파일 크기를 10MB 이하로 줄여주세요.' },
  { id: 5, title: '닉네임 변경 문의', author: '정우진', email: 'woojin@example.com', content: '닉네임을 변경하고 싶어요', date: '2024-03-14', status: 'pending', reply: '' },
  { id: 6, title: '비밀번호 재설정', author: '강민지', email: 'minji@example.com', content: '비밀번호를 잊어버렸어요', date: '2024-03-13', status: 'completed', reply: '이메일로 재설정 링크를 보내드렸습니다.' },
  { id: 7, title: '이메일 변경 요청', author: '윤서준', email: 'seojun@example.com', content: '이메일을 변경하고 싶습니다', date: '2024-03-12', status: 'pending', reply: '' },
  { id: 8, title: '광고 문의', author: '한예린', email: 'yerin@example.com', content: '광고를 게재하고 싶습니다', date: '2024-03-11', status: 'completed', reply: '광고 담당자 이메일로 문의주세요.' },
  { id: 9, title: '제휴 문의', author: '조현우', email: 'hyunwoo@example.com', content: '제휴를 제안하고 싶습니다', date: '2024-03-10', status: 'pending', reply: '' },
  { id: 10, title: '앱 오류 신고', author: '송하늘', email: 'haneul@example.com', content: '앱이 자꾸 꺼집니다', date: '2024-03-09', status: 'completed', reply: '최신 버전으로 업데이트해주세요.' },
  { id: 11, title: '포인트 적립 문의', author: '임도윤', email: 'doyun@example.com', content: '포인트가 적립되지 않았어요', date: '2024-03-08', status: 'pending', reply: '' },
  { id: 12, title: '환불 요청', author: '장서윤', email: 'seoyoon@example.com', content: '예약 취소 후 환불이 안돼요', date: '2024-03-07', status: 'pending', reply: '' },
  { id: 13, title: '리뷰 삭제 요청', author: '홍지우', email: 'jiwoo@example.com', content: '제가 쓴 리뷰를 삭제하고 싶어요', date: '2024-03-06', status: 'completed', reply: '리뷰가 삭제되었습니다.' },
  { id: 14, title: '예약 변경 문의', author: '권민재', email: 'minjae@example.com', content: '예약 날짜를 변경할 수 있나요?', date: '2024-03-05', status: 'completed', reply: '예약 변경은 마이페이지에서 가능합니다.' },
  { id: 15, title: '쿠폰 사용 문의', author: '배수아', email: 'sua@example.com', content: '쿠폰이 적용되지 않아요', date: '2024-03-04', status: 'pending', reply: '' },
  { id: 16, title: '알림 설정 문의', author: '안유진', email: 'yujin@example.com', content: '알림을 끄고 싶어요', date: '2024-03-03', status: 'completed', reply: '설정 메뉴에서 변경 가능합니다.' },
  { id: 17, title: '계정 복구 요청', author: '신동혁', email: 'donghyuk@example.com', content: '계정이 정지되었어요', date: '2024-03-02', status: 'pending', reply: '' },
  { id: 18, title: '신고 처리 문의', author: '오승민', email: 'seungmin@example.com', content: '신고한 게시물이 삭제되지 않았어요', date: '2024-03-01', status: 'completed', reply: '검토 후 조치하였습니다.' },
  { id: 19, title: '이용약관 문의', author: '류지훈', email: 'jihoon@example.com', content: '이용약관이 변경되었나요?', date: '2024-02-29', status: 'pending', reply: '' },
  { id: 20, title: '개인정보 처리방침', author: '서예은', email: 'yeeun@example.com', content: '개인정보는 어떻게 관리되나요?', date: '2024-02-28', status: 'completed', reply: '개인정보 처리방침을 확인해주세요.' },
  { id: 21, title: '오프라인 매장 문의', author: '전민석', email: 'minseok@example.com', content: '오프라인 매장이 있나요?', date: '2024-02-27', status: 'pending', reply: '' },
  { id: 22, title: '단체 예약 문의', author: '노수빈', email: 'subin@example.com', content: '단체 예약이 가능한가요?', date: '2024-02-26', status: 'pending', reply: '' },
  { id: 23, title: '할인 이벤트 문의', author: '하준영', email: 'junyoung@example.com', content: '할인 이벤트는 언제 하나요?', date: '2024-02-25', status: 'completed', reply: '매달 첫째 주에 진행됩니다.' },
  { id: 24, title: '멤버십 문의', author: '문채원', email: 'chaewon@example.com', content: '멤버십 혜택이 무엇인가요?', date: '2024-02-24', status: 'completed', reply: '멤버십 페이지를 확인해주세요.' },
  { id: 25, title: '추천인 코드 문의', author: '백시우', email: 'siwoo@example.com', content: '추천인 코드는 어디서 확인하나요?', date: '2024-02-23', status: 'pending', reply: '' },
  { id: 26, title: '위시리스트 동기화', author: '양다은', email: 'daeun@example.com', content: '위시리스트가 동기화되지 않아요', date: '2024-02-22', status: 'completed', reply: '로그인 상태를 확인해주세요.' },
  { id: 27, title: '검색 기능 개선', author: '표민호', email: 'minho@example.com', content: '검색이 잘 안돼요', date: '2024-02-21', status: 'pending', reply: '' },
  { id: 28, title: '지도 오류 신고', author: '손유나', email: 'yuna@example.com', content: '지도에 표시가 안돼요', date: '2024-02-20', status: 'pending', reply: '' },
  { id: 29, title: '리워드 적립 문의', author: '황재현', email: 'jaehyun@example.com', content: '리워드가 적립되지 않았어요', date: '2024-02-19', status: 'completed', reply: '적립 내역을 확인해주세요.' },
  { id: 30, title: '기능 제안', author: '곽서진', email: 'seojin@example.com', content: '이런 기능이 있으면 좋겠어요', date: '2024-02-18', status: 'pending', reply: '' },
];

/* ===================================
   === MOCK DATA END ===
   ⚠️ 백엔드 연동 시 여기까지 삭제
=================================== */

// ===================================
// 초기화 함수 - 페이지 로드 시 실행
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  // 네비게이션 이벤트 초기화
  initNavigation();
  
  // 사용자 관리 페이지 초기 로드 (기본 페이지)
  loadUsers();
  
  // 신고 통계 미리 계산 (다른 섹션에서도 사용)
  updateReportStats();
  
  // Lucide 아이콘 초기화
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // 콘솔에 테스트 정보 출력
  console.log('=== 해봄트립 관리자 페이지 초기화 완료 ===');
  console.log('사용자 데이터:', usersData.length, '명');
  console.log('댓글 데이터:', commentsData.length, '개');
  console.log('신고 데이터:', reportsData.length, '개');
  console.log('문의 데이터:', inquiriesData.length, '개');
  console.log('=====================================');
});

// ===================================
// 네비게이션 - 사이드바 메뉴 클릭 처리
// ===================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 모든 메뉴의 활성화 상태 제거
      navItems.forEach(nav => nav.classList.remove('active'));
      // 클릭한 메뉴 활성화
      this.classList.add('active');
      
      // 모든 섹션 숨기기
      sections.forEach(section => section.classList.remove('active'));
      // 선택한 섹션만 표시
      const sectionId = this.getAttribute('data-section');
      document.getElementById(`${sectionId}-section`).classList.add('active');
      
      // 페이지 타이틀 변경
      const titles = {
        'users': '사용자 관리',
        'comments': '댓글 관리',
        'reports': '신고 접수',
        'inquiries': '문의사항',
        'statistics': '데이터 통계'
      };
      document.getElementById('page-title').textContent = titles[sectionId];
      
      // 섹션별 초기 데이터 로드
      if (sectionId === 'users') loadUsers();
      if (sectionId === 'comments') loadComments();
      if (sectionId === 'reports') {
        filterReports();
        updateReportStats();
      }
      if (sectionId === 'inquiries') filterInquiries();
      if (sectionId === 'statistics') initStatistics();
      
      // Lucide 아이콘 재초기화
      if (window.lucide) lucide.createIcons();
    });
  });
}

// ===================================
// 사용자 관리 - 목록 조회 및 페이징
// ===================================
let currentUsersPage = 1;          // 현재 페이지 번호
const usersPerPage = 20;           // 페이지당 표시할 사용자 수

/**
 * 사용자 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 * 
 * TODO: 백엔드 API 연동
 * $.ajax({
 *   url: '/api/admin/users',
 *   method: 'GET',
 *   data: { page: page, perPage: usersPerPage },
 *   success: function(response) {
 *     usersData = response.data;
 *     renderUsersTable();
 *     renderUsersPagination(response.totalCount);
 *   }
 * });
 */
function loadUsers(page = 1) {
  currentUsersPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * usersPerPage;
  const end = start + usersPerPage;
  const paginatedUsers = usersData.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('users-table-body');
  
  // 사용자 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedUsers.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.nickname}</td>
      <td>${user.joinDate}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(user.status)}">
          ${getStatusText(user.status)}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-info me-1" onclick="editUser(${user.id})">
          <i data-lucide="edit"></i> 수정
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
          <i data-lucide="trash-2"></i> 삭제
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderUsersPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 사용자 검색 함수
 * 이름 또는 이메일로 검색
 * 
 * TODO: 백엔드 API 연동
 * $.ajax({
 *   url: '/api/admin/users/search',
 *   method: 'GET',
 *   data: { keyword: searchTerm },
 *   success: function(response) {
 *     renderSearchResults(response.data);
 *   }
 * });
 */
function searchUsers() {
  const searchTerm = document.getElementById('user-search').value.toLowerCase();
  
  // 검색어가 없으면 전체 목록 표시
  if (!searchTerm) {
    loadUsers();
    return;
  }
  
  // 검색어로 필터링
  const filtered = usersData.filter(user => 
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );
  
  // 검색 결과 테이블에 표시
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = filtered.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.nickname}</td>
      <td>${user.joinDate}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(user.status)}">
          ${getStatusText(user.status)}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-info me-1" onclick="editUser(${user.id})">
          <i data-lucide="edit"></i> 수정
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
          <i data-lucide="trash-2"></i> 삭제
        </button>
      </td>
    </tr>
  `).join('');
  
  // 검색 결과에서는 페이지네이션 숨김
  document.getElementById('users-pagination').innerHTML = '';
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 사용자 수정 모달 열기
 * @param {number} id - 수정할 사용자 ID
 */
function editUser(id) {
  const user = usersData.find(u => u.id === id);
  if (!user) return;
  
  // 모달 폼에 사용자 정보 입력
  document.getElementById('edit-user-id').value = user.id;
  document.getElementById('edit-user-name').value = user.name;
  document.getElementById('edit-user-email').value = user.email;
  document.getElementById('edit-user-nickname').value = user.nickname;
  document.getElementById('edit-user-status').value = user.status;
  
  // Bootstrap 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
  modal.show();
}

/**
 * 사용자 정보 업데이트 (모달에서 저장 버튼 클릭 시)
 * 
 * TODO: 백엔드 API 연동
 * $.ajax({
 *   url: '/api/admin/users/' + id,
 *   method: 'PUT',
 *   contentType: 'application/json',
 *   data: JSON.stringify(userData),
 *   success: function(response) {
 *     alert('수정되었습니다.');
 *     loadUsers(currentUsersPage);
 *   }
 * });
 */
function updateUser() {
  const id = parseInt(document.getElementById('edit-user-id').value);
  const userIndex = usersData.findIndex(u => u.id === id);
  
  if (userIndex !== -1) {
    // 사용자 정보 업데이트
    usersData[userIndex].name = document.getElementById('edit-user-name').value;
    usersData[userIndex].email = document.getElementById('edit-user-email').value;
    usersData[userIndex].nickname = document.getElementById('edit-user-nickname').value;
    usersData[userIndex].status = document.getElementById('edit-user-status').value;
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal.hide();
    
    // 테이블 새로고침
    loadUsers(currentUsersPage);
    
    alert('사용자 정보가 수정되었습니다.');
  }
}

/**
 * 사용자 삭제
 * @param {number} id - 삭제할 사용자 ID
 * 
 * TODO: 백엔드 API 연동
 * $.ajax({
 *   url: '/api/admin/users/' + id,
 *   method: 'DELETE',
 *   success: function(response) {
 *     alert('삭제되었습니다.');
 *     loadUsers(currentUsersPage);
 *   }
 * });
 */
function deleteUser(id) {
  if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    // 배열에서 해당 사용자 제거
    usersData = usersData.filter(u => u.id !== id);
    
    // 테이블 새로고침
    loadUsers(currentUsersPage);
    
    alert('사용자가 삭제되었습니다.');
  }
}

/**
 * 사용자 페이지네이션 렌더링
 */
function renderUsersPagination() {
  const totalPages = Math.ceil(usersData.length / usersPerPage);
  const pagination = document.getElementById('users-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentUsersPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadUsers(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  pagination.innerHTML = html;
}

/**
 * 사용자 상태에 따른 배지 클래스 반환
 * @param {string} status - 사용자 상태 (active/inactive/suspended)
 * @returns {string} Bootstrap 배지 클래스
 */
function getStatusBadgeClass(status) {
  switch(status) {
    case 'active': return 'bg-success';      // 활성 - 초록색
    case 'inactive': return 'bg-secondary';  // 비활성 - 회색
    case 'suspended': return 'bg-danger';    // 정지 - 빨간색
    default: return 'bg-secondary';
  }
}

/**
 * 사용자 상태 텍스트 반환
 * @param {string} status - 사용자 상태
 * @returns {string} 한글 상태 텍스트
 */
function getStatusText(status) {
  switch(status) {
    case 'active': return '활성';
    case 'inactive': return '비활성';
    case 'suspended': return '정지';
    default: return '알 수 없음';
  }
}

// ===================================
// 댓글 관리 - 목록 조회 및 페이징
// ===================================
let currentCommentsPage = 1;       // 현재 페이지 번호
const commentsPerPage = 20;        // 페이지당 표시할 댓글 수

/**
 * 댓글 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 */
function loadComments(page = 1) {
  currentCommentsPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * commentsPerPage;
  const end = start + commentsPerPage;
  const paginatedComments = commentsData.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('comments-table-body');
  
  // 댓글 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedComments.map(comment => `
    <tr>
      <td>${comment.id}</td>
      <td>${comment.author}</td>
      <td class="text-truncate" style="max-width: 300px;">${comment.content}</td>
      <td>${comment.post}</td>
      <td>${comment.date}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})">
          <i data-lucide="trash-2"></i> 삭제
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderCommentsPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 댓글 작성자로 검색
 */
function searchComments() {
  const searchTerm = document.getElementById('comment-author-search').value.toLowerCase();
  
  // 검색어가 없으면 전체 목록 표시
  if (!searchTerm) {
    loadComments();
    return;
  }
  
  // 작성자로 필터링
  const filtered = commentsData.filter(comment => 
    comment.author.toLowerCase().includes(searchTerm)
  );
  
  // 검색 결과 테이블에 표시
  const tbody = document.getElementById('comments-table-body');
  tbody.innerHTML = filtered.map(comment => `
    <tr>
      <td>${comment.id}</td>
      <td>${comment.author}</td>
      <td class="text-truncate" style="max-width: 300px;">${comment.content}</td>
      <td>${comment.post}</td>
      <td>${comment.date}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})">
          <i data-lucide="trash-2"></i> 삭제
        </button>
      </td>
    </tr>
  `).join('');
  
  // 검색 결과에서는 페이지네이션 숨김
  document.getElementById('comments-pagination').innerHTML = '';
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 댓글 삭제
 * @param {number} id - 삭제할 댓글 ID
 */
function deleteComment(id) {
  if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
    // 배열에서 해당 댓글 제거
    commentsData = commentsData.filter(c => c.id !== id);
    
    // 테이블 새로고침
    loadComments(currentCommentsPage);
    
    alert('댓글이 삭제되었습니다.');
  }
}

/**
 * 댓글 페이지네이션 렌더링
 */
function renderCommentsPagination() {
  const totalPages = Math.ceil(commentsData.length / commentsPerPage);
  const pagination = document.getElementById('comments-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentCommentsPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadComments(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  pagination.innerHTML = html;
}

// ===================================
// 신고 접수 - 목록 조회 및 필터링
// ===================================
let currentReportsPage = 1;        // 현재 페이지 번호
const reportsPerPage = 20;         // 페이지당 표시할 신고 수
let filteredReports = [...reportsData];  // 필터링된 신고 데이터

/**
 * 신고 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 */
function loadReports(page = 1) {
  currentReportsPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * reportsPerPage;
  const end = start + reportsPerPage;
  const paginatedReports = filteredReports.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('reports-table-body');
  
  // 신고 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedReports.map(report => `
    <tr>
      <td>${report.id}</td>
      <td>${getReportTypeText(report.type)}</td>
      <td>${report.target}</td>
      <td class="text-truncate" style="max-width: 200px;">${report.content}</td>
      <td>${report.reporter}</td>
      <td>${report.date}</td>
      <td>
        <span class="badge ${report.status === 'pending' ? 'bg-warning' : 'bg-success'}">
          ${report.status === 'pending' ? '대기중' : '처리완료'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewReportDetail(${report.id})">
          <i data-lucide="eye"></i> 상세
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderReportsPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 신고 필터링 (상태, 유형별)
 */
function filterReports() {
  const statusFilter = document.getElementById('report-status-filter').value;
  const typeFilter = document.getElementById('report-type-filter').value;
  
  // 필터 조건에 맞는 신고만 선택
  filteredReports = reportsData.filter(report => {
    const matchStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchType = typeFilter === 'all' || report.type === typeFilter;
    return matchStatus && matchType;
  });
  
  // 첫 페이지부터 다시 표시
  loadReports(1);
  
  // 통계 업데이트
  updateReportStats();
}

/**
 * 신고 통계 업데이트 (상단 카드)
 */
function updateReportStats() {
  // 미처리 신고 개수
  const pendingCount = reportsData.filter(r => r.status === 'pending').length;
  document.getElementById('pending-reports-count').textContent = pendingCount;
  
  // 오늘 접수된 신고 개수 (날짜가 2024-03-18인 것)
  const todayCount = reportsData.filter(r => r.date === '2024-03-18').length;
  document.getElementById('today-reports-count').textContent = todayCount;
  
  // 이번주 처리완료 신고 개수 (3월 11일 ~ 18일)
  const weekCompleted = reportsData.filter(r => {
    const reportDate = new Date(r.date);
    const startOfWeek = new Date('2024-03-11');
    const endOfWeek = new Date('2024-03-18');
    return r.status === 'completed' && reportDate >= startOfWeek && reportDate <= endOfWeek;
  }).length;
  document.getElementById('week-completed-count').textContent = weekCompleted;
}

/**
 * 신고 상세 정보 모달 열기
 * @param {number} id - 신고 ID
 */
function viewReportDetail(id) {
  const report = reportsData.find(r => r.id === id);
  if (!report) return;
  
  // 모달에 신고 정보 입력
  document.getElementById('report-id').value = report.id;
  document.getElementById('report-type').textContent = getReportTypeText(report.type);
  document.getElementById('report-target').textContent = report.target;
  document.getElementById('report-content').textContent = report.content;
  document.getElementById('report-reporter').textContent = report.reporter;
  document.getElementById('report-date').textContent = report.date;
  document.getElementById('report-status-select').value = report.status;
  
  // Bootstrap 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('reportDetailModal'));
  modal.show();
}

/**
 * 신고 상태 업데이트 (모달에서 저장 버튼 클릭 시)
 */
function updateReportStatus() {
  const id = parseInt(document.getElementById('report-id').value);
  const newStatus = document.getElementById('report-status-select').value;
  
  const reportIndex = reportsData.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    // 신고 상태 업데이트
    reportsData[reportIndex].status = newStatus;
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportDetailModal'));
    modal.hide();
    
    // 테이블 및 통계 새로고침
    filterReports();
    
    alert('신고 상태가 업데이트되었습니다.');
  }
}

/**
 * 신고된 콘텐츠 삭제
 */
function deleteReportedContent() {
  if (confirm('신고된 콘텐츠를 삭제하시겠습니까?')) {
    // 실제로는 해당 댓글이나 게시물을 삭제하는 API 호출
    alert('신고된 콘텐츠가 삭제되었습니다.');
    
    // 신고 상태를 처리완료로 변경
    const id = parseInt(document.getElementById('report-id').value);
    const reportIndex = reportsData.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      reportsData[reportIndex].status = 'completed';
    }
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('reportDetailModal'));
    modal.hide();
    
    // 새로고침
    filterReports();
  }
}

/**
 * 신고 페이지네이션 렌더링
 */
function renderReportsPagination() {
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const pagination = document.getElementById('reports-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentReportsPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadReports(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  pagination.innerHTML = html;
}

/**
 * 신고 유형 코드를 한글로 변환
 * @param {string} type - 신고 유형 코드
 * @returns {string} 한글 유형 텍스트
 */
function getReportTypeText(type) {
  switch(type) {
    case 'spam': return '스팸';
    case 'abuse': return '욕설/비방';
    case 'inappropriate': return '부적절한 내용';
    case 'etc': return '기타';
    default: return type;
  }
}

// ===================================
// 문의사항 - 목록 조회 및 답변 등록
// ===================================
let currentInquiriesPage = 1;      // 현재 페이지 번호
const inquiriesPerPage = 20;       // 페이지당 표시할 문의 수
let filteredInquiries = [...inquiriesData];  // 필터링된 문의 데이터

/**
 * 문의사항 목록 로드 함수
 * @param {number} page - 표시할 페이지 번호
 */
function loadInquiries(page = 1) {
  currentInquiriesPage = page;
  
  // 페이지네이션을 위한 시작/끝 인덱스 계산
  const start = (page - 1) * inquiriesPerPage;
  const end = start + inquiriesPerPage;
  const paginatedInquiries = filteredInquiries.slice(start, end);
  
  // 테이블 바디 요소 가져오기
  const tbody = document.getElementById('inquiries-table-body');
  
  // 문의 데이터를 HTML 테이블 행으로 변환
  tbody.innerHTML = paginatedInquiries.map(inquiry => `
    <tr>
      <td>${inquiry.id}</td>
      <td class="text-truncate" style="max-width: 250px;">${inquiry.title}</td>
      <td>${inquiry.author}</td>
      <td>${inquiry.email}</td>
      <td>${inquiry.date}</td>
      <td>
        <span class="badge ${inquiry.status === 'pending' ? 'bg-warning' : 'bg-success'}">
          ${inquiry.status === 'pending' ? '답변 대기' : '답변 완료'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="replyInquiry(${inquiry.id})">
          <i data-lucide="message-circle"></i> ${inquiry.status === 'pending' ? '답변' : '보기'}
        </button>
      </td>
    </tr>
  `).join('');
  
  // 페이지네이션 버튼 렌더링
  renderInquiriesPagination();
  
  // Lucide 아이콘 재초기화
  if (window.lucide) lucide.createIcons();
}

/**
 * 문의사항 필터링 (상태별)
 */
function filterInquiries() {
  const statusFilter = document.getElementById('inquiry-status-filter').value;
  
  // 필터 조건에 맞는 문의만 선택
  filteredInquiries = inquiriesData.filter(inquiry => {
    return statusFilter === 'all' || inquiry.status === statusFilter;
  });
  
  // 첫 페이지부터 다시 표시
  loadInquiries(1);
}

/**
 * 문의 답변 모달 열기
 * @param {number} id - 문의 ID
 */
function replyInquiry(id) {
  const inquiry = inquiriesData.find(i => i.id === id);
  if (!inquiry) return;
  
  // 모달에 문의 정보 입력
  document.getElementById('inquiry-id').value = inquiry.id;
  document.getElementById('inquiry-title').textContent = inquiry.title;
  document.getElementById('inquiry-content').textContent = inquiry.content;
  document.getElementById('inquiry-author').textContent = `${inquiry.author} (${inquiry.email})`;
  document.getElementById('inquiry-reply').value = inquiry.reply || '';
  
  // 답변 완료된 경우 읽기 전용
  if (inquiry.status === 'completed') {
    document.getElementById('inquiry-reply').readOnly = true;
  } else {
    document.getElementById('inquiry-reply').readOnly = false;
  }
  
  // Bootstrap 모달 열기
  const modal = new bootstrap.Modal(document.getElementById('inquiryReplyModal'));
  modal.show();
}

/**
 * 문의 답변 등록
 */
function submitInquiryReply() {
  const id = parseInt(document.getElementById('inquiry-id').value);
  const reply = document.getElementById('inquiry-reply').value.trim();
  
  // 답변 내용 유효성 검사
  if (!reply) {
    alert('답변 내용을 입력해주세요.');
    return;
  }
  
  const inquiryIndex = inquiriesData.findIndex(i => i.id === id);
  if (inquiryIndex !== -1) {
    // 문의 답변 등록 및 상태 변경
    inquiriesData[inquiryIndex].reply = reply;
    inquiriesData[inquiryIndex].status = 'completed';
    
    // 모달 닫기
    const modal = bootstrap.Modal.getInstance(document.getElementById('inquiryReplyModal'));
    modal.hide();
    
    // 테이블 새로고침
    filterInquiries();
    
    alert('답변이 등록되었습니다.');
  }
}

/**
 * 문의사항 페이지네이션 렌더링
 */
function renderInquiriesPagination() {
  const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);
  const pagination = document.getElementById('inquiries-pagination');
  
  let html = '';
  
  // 페이지 번호 버튼 생성
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentInquiriesPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="loadInquiries(${i}); return false;">${i}</a>
      </li>
    `;
  }
  
  pagination.innerHTML = html;
}

// ===================================
// 데이터 통계 - 차트 시각화
// ===================================

/**
 * 통계 섹션 초기화 (모든 차트 생성)
 */
function initStatistics() {
  initSignupChart();       // 회원가입자 수 차트
  initActivityChart();     // 활동 통계 차트
  initReportTypeChart();   // 신고 유형 분포 차트
}

/**
 * 회원가입자 수 차트 (라인 차트)
 * 최근 6개월 데이터 표시
 */
function initSignupChart() {
  const ctx = document.getElementById('signupChart');
  if (!ctx) return;
  
  // 최근 6개월 라벨 및 데이터 생성
  const labels = [];
  const data = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(`${date.getMonth() + 1}월`);
    // 랜덤 데이터 생성 (실제로는 DB에서 가져옴)
    data.push(Math.floor(Math.random() * 100) + 50);
  }
  
  // Chart.js 라인 차트 생성
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '회원가입자 수',
        data: data,
        borderColor: 'rgba(249, 115, 22, 1)',           // 해봄트립 오렌지
        backgroundColor: 'rgba(249, 115, 22, 0.1)',     // 배경 투명 오렌지
        borderWidth: 3,
        fill: true,
        tension: 0.4,                                   // 곡선 정도
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
}

/**
 * 월별 활동 통계 차트 (막대 차트)
 * 이번 달과 지난 달 비교
 */
function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;
  
  // Chart.js 막대 차트 생성
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['댓글', '게시물', '좋아요', '공유'],
      datasets: [{
        label: '이번 달',
        data: [245, 189, 567, 123],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        borderRadius: 8
      }, {
        label: '지난 달',
        data: [198, 156, 489, 98],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * 신고 유형 분포 차트 (도넛 차트)
 */
function initReportTypeChart() {
  const ctx = document.getElementById('reportTypeChart');
  if (!ctx) return;
  
  // 신고 유형별 개수 집계
  const reportCounts = {
    spam: 0,
    abuse: 0,
    inappropriate: 0,
    etc: 0
  };
  
  reportsData.forEach(report => {
    reportCounts[report.type]++;
  });
  
  // Chart.js 도넛 차트 생성
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['스팸', '욕설/비방', '부적절한 내용', '기타'],
      datasets: [{
        data: [
          reportCounts.spam,
          reportCounts.abuse,
          reportCounts.inappropriate,
          reportCounts.etc
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',      // 빨간색
          'rgba(249, 115, 22, 0.8)',     // 오렌지색
          'rgba(139, 92, 246, 0.8)',     // 보라색
          'rgba(59, 130, 246, 0.8)'      // 파란색
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    }
  });
}
