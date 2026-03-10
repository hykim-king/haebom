import oracledb
from fastapi import FastAPI
from openai import OpenAI
from pydantic import BaseModel, Field
# from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware  # 1. 미들웨어 임포트
from collections import defaultdict
from typing import Dict, List
import configparser

# application-secret.properties 읽기
config = configparser.ConfigParser()
with open("src/main/resources/application-secret.properties", "r") as f:
    config.read_string("[default]\n" + f.read())

OPENAI_API_KEY = config.get("default", "openai.api.key")
HAEBOM_USER = config.get("default", "spring.datasource.username")
HAEBOM_PASSWORD = config.get("default", "spring.datasource.password")
# DSN: url에서 host:port/sid 추출
_db_url = config.get("default", "spring.datasource.url")
HAEBOM_DSN = _db_url.split("@")[-1]

client = OpenAI(api_key=OPENAI_API_KEY)

messages = []

# FastAPI 앱 생성
app = FastAPI(
    title='PCWK OpenAI Chat Service',
    description="OpenAI API를 활용한 채팅 서비스",
    version="0.5"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # 프론트엔드 주소를 정확히 입력
        "http://127.0.0.1:8080",
        "http://192.168.100.195:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# userCode별 대화 누적 저장소
chat_histories: Dict[str, List[dict]] = defaultdict(list)

def add_history(user_code: str, role: str, content: str, max_turns: int = 20):
    hist = chat_histories[user_code]
    hist.append({"role": role, "content": content})
    if len(hist) > max_turns * 2:
        del hist[: len(hist) - (max_turns * 2)]
        
class ChatRes(BaseModel):
    '''
    챗봇의 답변 스키마
    '''
    reply: str # 챗봇의 답변
    
    
class ChatReq(BaseModel):
    '''
    사용자로부터 입력받을 메시지 스키마
    '''
    message: str # chat 메시지
    userCode: str | None = None
    
    
@app.post("/api/v1/chat", response_model=ChatRes)
def chat(req: ChatReq):
    '''
    사용자로부터 메시지를 입력받아 OpenAI API를 호출하고, 챗봇의 답변을 반환하는 엔드포인트
    '''
    
    user_code = req.userCode

    add_history(user_code, "user", req.message)

    q, rows, answer = ask_and_search(req.message, user_code)

    add_history(user_code, "assistant", answer)

    return ChatRes(reply=answer)
        
class TripResultItem(BaseModel):
    contentid: int
    title: str
    addr: str | None = None
    keywords: List[str] = Field(default_factory=list)

class TripSummary(BaseModel):
    items: List[TripResultItem]
    
# 1) 모델이 반드시 맞춰서 내보낼 "검색조건 스키마"
class TripSearchQuery(BaseModel):
    keywords: list[str] = Field(default_factory=list)
    trip_clsf: str | None = Field(
        default=None,
        description="관광타입 ID (관광지:12, 문화시설:14, 축제:15, 코스:25, 레포츠:28, 숙박:32, 쇼핑:38, 음식점:39, 지역검색:99)"
    )
    content_id: str | None = Field(default=None, description="4009438 같은 콘텐츠 ID로 검색할 때 사용")
    limit: int = Field(default=10, ge=1, le=50)

def oracle_search_ss_trip(q: TripSearchQuery):
    conn = oracledb.connect(
        user=HAEBOM_USER,
        password=HAEBOM_PASSWORD,
        dsn=HAEBOM_DSN,
    )
    cur = conn.cursor()

    where = []
    params = {}
    safe_limit = int(q.limit) if q.limit else 10 # limit 미리 설정
    
    print(f">>> trip_clsf: {q.trip_clsf}")
    
    if q.trip_clsf not in ["12", "14", "15", "25", "28", "32", "38", "39", "99"]:
        rows = [{"result":"not", "keywords": q.keywords}]  # DB 조회 없이 키워드 자체를 결과로 반환 (디버깅용)
        for i, kw in enumerate(q.keywords):
            key = f"kw{i}"
            params[key] = kw
        print(f">>> params: {params}")
        
    else:
        # --- 1. 관광지(12) 전용 테이블 조회 로직 ---
        if q.trip_clsf == "25":
            for i, kw in enumerate(q.keywords):
                key = f"kw{i}"
                # ✅ 수정: 하단에 닫는 괄호 ')' 추가
                where.append(
                    f"(LOWER(COURSE_NM) LIKE '%'||LOWER(:{key})||'%' "
                    f"OR LOWER(COURSE_INFO) LIKE '%'||LOWER(:{key})||'%')" 
                )
                params[key] = kw
                
            where_sql = " AND ".join(where) if where else "1=1"
            sql = f"""
                SELECT
                    COURSE_NO AS CONTENTID,
                    COURSE_NM,
                    COURSE_INFO,
                    COURSE_PATH_NM,
                    COURSE_DSTNC, --여행코스 거리
                    COURSE_REQ_TM --여행코스 소요시간
                FROM
                    COURSE
                WHERE {where_sql}
                ORDER BY COURSE_NM ASC
                FETCH FIRST {safe_limit} ROWS ONLY
            """
        
        # --- 2. 그 외 카테고리 (공통 trip 테이블) 조회 로직 ---
        else:
            for i, kw in enumerate(q.keywords):
                key = f"kw{i}"
                where.append(
                    f"(LOWER(t.trip_nm) LIKE '%'||LOWER(:{key})||'%' "
                    f"OR LOWER(t.trip_addr) LIKE '%'||LOWER(:{key})||'%' "
                    f"OR LOWER(td.tripdtl_info) LIKE '%'||LOWER(:{key})||'%')"
                )
                params[key] = str(kw)

            if q.trip_clsf in ["12", "14", "15", "25", "28", "32", "38", "39"]:
                str_clsf = str(q.trip_clsf).strip().lower()
                if str_clsf and str_clsf not in ["none", "null", ""]:
                    where.append("t.trip_clsf = :ctid")
                    try:
                        params["ctid"] = int(str_clsf)
                    except (ValueError, TypeError):
                        params["ctid"] = str_clsf

            where_sql = " AND ".join(where) if where else "1=1"
            sql = f"""
                SELECT
                    t.trip_conts_id as CONTENTID, t.trip_nm, t.trip_path_nm, t.trip_addr,
                    t.trip_lat, t.trip_lot, t.trip_tag, t.trip_clsf,
                    t.trip_ctpv, t.trip_gungu, t.trip_inq_cnt, td.tripdtl_info
                FROM trip t
                LEFT OUTER JOIN tripdetail td ON t.trip_conts_id = td.trip_conts_id
                WHERE {where_sql}
                --ORDER BY t.trip_inq_cnt DESC
                ORDER BY DBMS_RANDOM.VALUE
                FETCH FIRST {safe_limit} ROWS ONLY
            """

        # 디버깅 출력
        print(f">>> 실행 SQL: {sql}")
        print(f">>> 파라미터: {params}")

        try:
            cur.execute(sql, params)
            cols = [d[0] for d in cur.description]   # ✅ 컬럼명 가져오기
            rows = [dict(zip(cols, r)) for r in cur.fetchall()]  # ✅ dict로 변환
        except oracledb.DatabaseError as e:
            print(f"!!! DB 에러 발생: {e}")
            rows = []
        finally:
            cur.close()
            conn.close()
        
    return rows

def ask_and_search(user_question: str, user_code: str):
    # 1. 쿼리 생성기: 여기서 카테고리 번호를 정확히 뽑아야 DB 조회가 됩니다.
    history = chat_histories.get(user_code, [])
    history = [m for m in history if isinstance(m, dict) and "role" in m and "content" in m]
    history = history[-10:]  # 최근 N개만
    
    
    print(f">>> {user_code}의 대화 히스토리: {history}")


    parsed = client.responses.parse(
        model="gpt-4o-mini",
        #model="gpt-4.1",
        input=[
            {"role": "system", "content": 
                "너는 여행지 DB 검색을 위한 쿼리 생성기야. 사용자의 질문을 분석해 검색 조건을 생성해."
                "관광타입(trip_clsf) 매핑 규칙:"
                "- 관광지: 12, 문화시설: 14, 축제/공연: 15, 코스: 25, 레포츠: 28, 숙박: 32, 쇼핑: 38, 음식점: 39"
                "사용자가 '맛집'이나 '식당'을 언급하면 trip_clsf '39'로 설정해."
                "지역명으로 검색하면 trip_clsf '99'로 설정해"
                "지역명이나 특정 장소는 keywords 리스트에 넣어."
            },
            *history,
            {"role": "user", "content": user_question},
        ],
        text_format=TripSearchQuery,
    ).output_parsed

    # 2. 오라클 조회
    rows = oracle_search_ss_trip(parsed)
    
    print(f">>> DB 조회 결과: {rows}")

    # 3. 데이터가 없을 경우 예외 처리 (AI가 지어내지 않도록)
    if not rows:
        return parsed, rows, f"죄송합니다. '{user_question}'에 대한 검색 결과가 없습니다."

    # 4. 결과 요약기
    summary = client.responses.create(
    model="gpt-4o-mini",
    input=[
            {
            "role": "system",
            "content": """
            너는 친절한 여행 안내원이야. DB에서 조회된 검색 결과(rows)를 바탕으로 사용자에게 여행지를 추천해줘.

            [중요]
            - rows는 'dict의 리스트'이며, CONTENTID는 항상 row["CONTENTID"]에 있다. (없으면 링크 생략)
            - 과장/추측 금지. rows에 있는 값만 사용.

            [출력 언어]
            - 한국어만

            [출력 형식]
            - 번호 매긴 추천 목록

            (일반/관광지일 때: row에 TRIP_NM 같은 키가 있는 경우)
            1) {row["TRIP_NM"]}
            - 주소: {row["TRIP_ADDR"]}
            - 내용: {row.get("TRIPDTL_INFO","정보 없음")}
            - 링크: (CONTENTID가 있을 때만)
            http://localhost:8080/trip/trip_view?tripContsId={row["CONTENTID"]} 내용 보러가기 (새창 하이퍼링크)

            (코스일 때: row에 COURSE_NM 같은 키가 있는 경우)
            1) {row["COURSE_NM"]}
            - 경로: {row["COURSE_PATH_NM"]}
            - 설명: {row["COURSE_INFO"]}
            - 거리: {row["COURSE_DSTNC"]}
            - 소요시간: {row["COURSE_REQ_TM"]}
            - 링크: (CONTENTID가 있을 때만)
            http://192.168.100.195:8081/trip/tripDetail?contentid={row["CONTENTID"]} 내용 보러가기 (새창 하이퍼링크)

            [빈값 규칙]
            - 값이 null/빈문자면 '정보 없음'으로 출력
            """
            },
            *history,
            {"role": "user", "content": f"질문: {user_question}\nrows: {rows}"}
        ],
    )
    

    return parsed, rows, summary.output_text


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("trip.trip_chatbot:app", host="0.0.0.0", port=8000, reload=True)  
    
    