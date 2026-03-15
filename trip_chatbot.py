import oracledb
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from typing import Dict, List, Optional, Any
import configparser
import pandas as pd
import numpy as np
import re
import json

# ============================================================
# application-secret.properties 읽기
# ============================================================
config = configparser.ConfigParser()
with open("src/main/resources/application-secret.properties", "r", encoding="utf-8") as f:
    config.read_string("[default]\n" + f.read())

OPENAI_API_KEY = config.get("default", "openai.api.key")
HAEBOM_USER = config.get("default", "spring.datasource.username")
HAEBOM_PASSWORD = config.get("default", "spring.datasource.password")
_db_url = config.get("default", "spring.datasource.url")
_raw_dsn = _db_url.split("@")[-1]
_parts = _raw_dsn.rsplit(":", 1)
HAEBOM_DSN = _parts[0] + "/" + _parts[1]

AI_MODEL = "gpt-4o-mini"

client = OpenAI(api_key=OPENAI_API_KEY)

messages = []

# FastAPI 앱 생성
app = FastAPI(
    title='HaBom AI Service',
    description="OpenAI API를 활용한 채팅 + AI 코스 추천 서비스",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://192.168.100.195:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ==================== 챗봇 영역 ====================
# ============================================================

# userCode별 대화 누적 저장소
chat_histories: Dict[str, List[dict]] = defaultdict(list)

def add_history(user_code: str, role: str, content: str, max_turns: int = 20):
    hist = chat_histories[user_code]
    hist.append({"role": role, "content": content})
    if len(hist) > max_turns * 2:
        del hist[: len(hist) - (max_turns * 2)]

class ChatRes(BaseModel):
    reply: str

class ChatReq(BaseModel):
    message: str
    userCode: str | None = None

@app.post("/api/v1/chat", response_model=ChatRes)
def chat(req: ChatReq):
    user_code = req.userCode
    add_history(user_code, "user", req.message)
    q, rows, answer = ask_and_search(req.message, user_code)
    add_history(user_code, "assistant", answer)
    return ChatRes(reply=answer)


@app.post("/api/v1/chat/stream")
def chat_stream(req: ChatReq):
    """SSE 스트리밍 챗봇 엔드포인트"""
    user_code = req.userCode
    add_history(user_code, "user", req.message)

    # 1단계: 쿼리 파싱 (빠름)
    history = chat_histories.get(user_code, [])
    history = [m for m in history if isinstance(m, dict) and "role" in m and "content" in m]
    history = history[-10:]

    parsed = client.responses.parse(
        model="gpt-4o-mini",
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
            {"role": "user", "content": req.message},
        ],
        text_format=TripSearchQuery,
    ).output_parsed

    rows = oracle_search_ss_trip(parsed)

    if not rows:
        no_result = f"죄송합니다. '{req.message}'에 대한 검색 결과가 없습니다."
        add_history(user_code, "assistant", no_result)
        def empty_gen():
            yield f"data: {json.dumps({'token': no_result}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(empty_gen(), media_type="text/event-stream")

    # 2단계: 답변 생성 (스트리밍)
    def generate():
        full_answer = []
        stream = client.responses.create(
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
                    http://localhost:8080/trip_course/detail?courseNo={row["CONTENTID"]} 내용 보러가기 (새창 하이퍼링크)

                    [빈값 규칙]
                    - 값이 null/빈문자면 '정보 없음'으로 출력
                    """
                },
                *history,
                {"role": "user", "content": f"질문: {req.message}\nrows: {rows}"}
            ],
            stream=True,
        )

        for event in stream:
            if event.type == "response.output_text.delta":
                token = event.delta
                full_answer.append(token)
                yield f"data: {json.dumps({'token': token}, ensure_ascii=False)}\n\n"

        add_history(user_code, "assistant", "".join(full_answer))
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

class TripResultItem(BaseModel):
    contentid: int
    title: str
    addr: str | None = None
    keywords: List[str] = Field(default_factory=list)

class TripSummary(BaseModel):
    items: List[TripResultItem]

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
    safe_limit = int(q.limit) if q.limit else 10

    print(f">>> trip_clsf: {q.trip_clsf}")

    if q.trip_clsf not in ["12", "14", "15", "25", "28", "32", "38", "39", "99"]:
        rows = [{"result":"not", "keywords": q.keywords}]
        for i, kw in enumerate(q.keywords):
            key = f"kw{i}"
            params[key] = kw
        print(f">>> params: {params}")

    else:
        if q.trip_clsf == "25":
            for i, kw in enumerate(q.keywords):
                key = f"kw{i}"
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
                    COURSE_DSTNC,
                    COURSE_REQ_TM
                FROM
                    COURSE
                WHERE {where_sql}
                ORDER BY COURSE_NM ASC
                FETCH FIRST {safe_limit} ROWS ONLY
            """

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
                ORDER BY DBMS_RANDOM.VALUE
                FETCH FIRST {safe_limit} ROWS ONLY
            """

        print(f">>> 실행 SQL: {sql}")
        print(f">>> 파라미터: {params}")

        try:
            cur.execute(sql, params)
            cols = [d[0] for d in cur.description]
            rows = [dict(zip(cols, r)) for r in cur.fetchall()]
        except oracledb.DatabaseError as e:
            print(f"!!! DB 에러 발생: {e}")
            rows = []
        finally:
            cur.close()
            conn.close()

    return rows

def ask_and_search(user_question: str, user_code: str):
    history = chat_histories.get(user_code, [])
    history = [m for m in history if isinstance(m, dict) and "role" in m and "content" in m]
    history = history[-10:]

    print(f">>> {user_code}의 대화 히스토리: {history}")

    parsed = client.responses.parse(
        model="gpt-4o-mini",
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

    rows = oracle_search_ss_trip(parsed)

    print(f">>> DB 조회 결과: {rows}")

    if not rows:
        return parsed, rows, f"죄송합니다. '{user_question}'에 대한 검색 결과가 없습니다."

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


# ============================================================
# ==================== AI 여행지 추천 영역 ====================
# ============================================================

class RecommendRequest(BaseModel):
    user_input: str = "추천 여행지"
    user_tag: str = "일반"

class AgeRecommendRequest(BaseModel):
    age_group: str = "20대"

class LocalRecommendRequest(BaseModel):
    local_addr: str = "전국"

def get_gpt_recommendation(system_instruction: str, user_content: str) -> Optional[List[str]]:
    try:
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_content}
            ],
            temperature=0.3
        )
        ai_answer = response.choices[0].message.content.strip()
        print(f"GPT 원본 응답: {ai_answer}")

        raw_list = re.split(r'[,\n]', ai_answer)
        clean_list = []
        for name in raw_list:
            t_name = name.strip()
            t_name = re.sub(r'^[0-9\s\.\-\)]+', '', t_name)
            t_name = t_name.replace(".", "").strip()
            if 0 < len(t_name) < 20:
                clean_list.append(t_name)
        return clean_list
    except Exception as e:
        print(f"GPT 에러 발생: {e}")
        return None

@app.post("/ai/recommend")
async def recommend(req: RecommendRequest):
    """일반 맞춤 여행지 추천"""
    system_msg = (
        "너는 한국 관광 전문가야. 설명 없이 오직 장소의 '핵심 명칭'만 3개 답변해.\n"
        "출력 형식: 명칭1, 명칭2, 명칭3\n"
        "예: 경복궁, 해운대, 불국사"
    )
    user_msg = f"요청: {req.user_input} / 태그: {req.user_tag}"
    result = get_gpt_recommendation(system_msg, user_msg)
    return result if result else ["경복궁", "해운대", "불국사"]

@app.post("/ai/recommend_age")
async def recommend_age(req: AgeRecommendRequest):
    """연령대별 인기 여행지 추천"""
    system_msg = (
        f"너는 {req.age_group} 트렌드 전문가야. 해당 연령대가 좋아할 장소 이름만 4개 답변해.\n"
        "번호나 주소 쓰지 마. 예: 익선동, 서피비치, 성수동, 에버랜드"
    )
    user_msg = f"{req.age_group} 인기 여행지 알려줘."
    result = get_gpt_recommendation(system_msg, user_msg)
    return result if result else ["익선동", "서피비치", "성수동", "에버랜드"]

@app.post("/ai/recommend_local")
async def recommend_local(req: LocalRecommendRequest):
    """내 주변(지역) 핫플레이스 추천"""
    system_msg = (
        f"너는 {req.local_addr} 지역 전문가야. 반드시 {req.local_addr} 행정구역 내에 있는 장소만 추천해.\n"
        f"다른 도시(용인, 춘천 등)는 절대 포함하지 마. 오직 {req.local_addr}의 장소 이름만 4개 답변해.\n"
        "형식: 장소1, 장소2, 장소3, 장소4"
    )
    user_msg = f"{req.local_addr} 지역 내에서 가볼 만한 핫플레이스를 추천해줘."
    result = get_gpt_recommendation(system_msg, user_msg)
    default_spots = [f"{req.local_addr} 호수공원", f"{req.local_addr} 시청 인근", f"{req.local_addr} 맛집골목", f"{req.local_addr} 산책로"]
    return result if result else default_spots


# ============================================================
# ==================== AI 코스 추천 영역 ====================
# ============================================================

# --- 상수 테이블 ---
TIME_RULES = {
    "A01010400": ["morning", "afternoon"],
    "A01010800": ["morning", "afternoon"],
    "A01010900": ["morning", "afternoon"],
    "A01011100": ["morning", "evening"],
    "A01011200": ["afternoon"],
    "A01011400": ["morning", "evening"],
    "A01011600": ["evening"],
    "A01011700": ["morning", "evening"],
    "A01011800": ["morning", "evening"],
    "A01011900": ["afternoon"],
    "A02010100": ["morning", "afternoon"],
    "A02010200": ["morning", "afternoon"],
    "A02010300": ["morning"],
    "A02010600": ["morning", "afternoon"],
    "A02010700": ["morning"],
    "A02010800": ["morning"],
    "A02020300": ["evening"],
    "A02020600": ["afternoon", "evening"],
    "A02030100": ["morning"],
    "A02030200": ["afternoon"],
    "A02030300": ["morning"],
    "A02030400": ["afternoon"],
    "A02050200": ["evening"],
    "A02060100": ["afternoon"],
    "A02060200": ["afternoon"],
    "A02060300": ["afternoon"],
    "A02060500": ["afternoon"],
    "A02061200": ["evening"],
    "A03020300": ["evening"],
    "A03020400": ["afternoon"],
    "A03020500": ["morning"],
    "A03020600": ["afternoon"],
    "A03020700": ["morning"],
    "A03021100": ["morning"],
    "A03021200": ["afternoon"],
    "A03021700": ["evening"],
    "A03021800": ["morning"],
    "A03022700": ["morning"],
    "A03030100": ["afternoon"],
    "A03030200": ["afternoon"],
    "A03030300": ["afternoon"],
    "A03030400": ["afternoon"],
    "A03030500": ["morning"],
    "A03030600": ["morning"],
    "A03030700": ["afternoon"],
    "A03030800": ["afternoon"],
    "A03040100": ["afternoon"],
    "A03040200": ["afternoon"],
    "A03040300": ["afternoon"],
}

REGION_CODE_MAP = {
    "서울": "1", "인천": "2", "대전": "3", "대구": "4", "광주": "5",
    "부산": "6", "울산": "7", "세종특별자치시": "8",
    "경기도": "31", "강원특별자치도": "32", "충청북도": "33", "충청남도": "34",
    "경상북도": "35", "경상남도": "36", "전북특별자치도": "37", "전라남도": "38",
    "제주특별자치도": "39",
}

GUNGU_MAP = {
    "1": [("1", "강남구"), ("2", "강동구"), ("3", "강북구"), ("4", "강서구"), ("5", "관악구"), ("6", "광진구"), ("7", "구로구"), ("8", "금천구"), ("9", "노원구"), ("10", "도봉구"), ("11", "동대문구"), ("12", "동작구"), ("13", "마포구"), ("14", "서대문구"), ("15", "서초구"), ("16", "성동구"), ("17", "성북구"), ("18", "송파구"), ("19", "양천구"), ("20", "영등포구"), ("21", "용산구"), ("22", "은평구"), ("23", "종로구"), ("24", "중구"), ("25", "중랑구")],
    "2": [("1", "강화군"), ("2", "계양구"), ("3", "미추홀구"), ("4", "남동구"), ("5", "동구"), ("6", "부평구"), ("7", "서구"), ("8", "연수구"), ("9", "옹진군"), ("10", "중구")],
    "3": [("1", "대덕구"), ("2", "동구"), ("3", "서구"), ("4", "유성구"), ("5", "중구")],
    "4": [("1", "남구"), ("2", "달서구"), ("3", "달성군"), ("4", "동구"), ("5", "북구"), ("6", "서구"), ("7", "수성구"), ("8", "중구"), ("9", "군위군")],
    "5": [("1", "광산구"), ("2", "남구"), ("3", "동구"), ("4", "북구"), ("5", "서구")],
    "6": [("1", "강서구"), ("2", "금정구"), ("3", "기장군"), ("4", "남구"), ("5", "동구"), ("6", "동래구"), ("7", "부산진구"), ("8", "북구"), ("9", "사상구"), ("10", "사하구"), ("11", "서구"), ("12", "수영구"), ("13", "연제구"), ("14", "영도구"), ("15", "중구"), ("16", "해운대구")],
    "7": [("1", "중구"), ("2", "남구"), ("3", "동구"), ("4", "북구"), ("5", "울주군")],
    "8": [("1", "세종특별자치시")],
    "31": [("1", "가평군"), ("2", "고양시"), ("3", "과천시"), ("4", "광명시"), ("5", "광주시"), ("6", "구리시"), ("7", "군포시"), ("8", "김포시"), ("9", "남양주시"), ("10", "동두천시"), ("11", "부천시"), ("12", "성남시"), ("13", "수원시"), ("14", "시흥시"), ("15", "안산시"), ("16", "안성시"), ("17", "안양시"), ("18", "양주시"), ("19", "양평군"), ("20", "여주시"), ("21", "연천군"), ("22", "오산시"), ("23", "용인시"), ("24", "의왕시"), ("25", "의정부시"), ("26", "이천시"), ("27", "파주시"), ("28", "평택시"), ("29", "포천시"), ("30", "하남시"), ("31", "화성시")],
    "32": [("1", "강릉시"), ("2", "고성군"), ("3", "동해시"), ("4", "삼척시"), ("5", "속초시"), ("6", "양구군"), ("7", "양양군"), ("8", "영월군"), ("9", "원주시"), ("10", "인제군"), ("11", "정선군"), ("12", "철원군"), ("13", "춘천시"), ("14", "태백시"), ("15", "평창군"), ("16", "홍천군"), ("17", "화천군"), ("18", "횡성군")],
    "33": [("1", "괴산군"), ("2", "단양군"), ("3", "보은군"), ("4", "영동군"), ("5", "옥천군"), ("6", "음성군"), ("7", "제천시"), ("8", "진천군"), ("9", "청원군"), ("10", "청주시"), ("11", "충주시"), ("12", "증평군")],
    "34": [("1", "공주시"), ("2", "금산군"), ("3", "논산시"), ("4", "당진시"), ("5", "보령시"), ("6", "부여군"), ("7", "서산시"), ("8", "서천군"), ("9", "아산시"), ("11", "예산군"), ("12", "천안시"), ("13", "청양군"), ("14", "태안군"), ("15", "홍성군"), ("16", "계룡시")],
    "35": [("1", "경산시"), ("2", "경주시"), ("3", "고령군"), ("4", "구미시"), ("6", "김천시"), ("7", "문경시"), ("8", "봉화군"), ("9", "상주시"), ("10", "성주군"), ("11", "안동시"), ("12", "영덕군"), ("13", "영양군"), ("14", "영주시"), ("15", "영천시"), ("16", "예천군"), ("17", "울릉군"), ("18", "울진군"), ("19", "의성군"), ("20", "청도군"), ("21", "청송군"), ("22", "칠곡군"), ("23", "포항시")],
    "36": [("1", "거제시"), ("2", "거창군"), ("3", "고성군"), ("4", "김해시"), ("5", "남해군"), ("6", "마산시"), ("7", "밀양시"), ("8", "사천시"), ("9", "산청군"), ("10", "양산시"), ("12", "의령군"), ("13", "진주시"), ("14", "진해시"), ("15", "창녕군"), ("16", "창원시"), ("17", "통영시"), ("18", "하동군"), ("19", "함안군"), ("20", "함양군"), ("21", "합천군")],
    "37": [("1", "고창군"), ("2", "군산시"), ("3", "김제시"), ("4", "남원시"), ("5", "무주군"), ("6", "부안군"), ("7", "순창군"), ("8", "완주군"), ("9", "익산시"), ("10", "임실군"), ("11", "장수군"), ("12", "전주시"), ("13", "정읍시"), ("14", "진안군")],
    "38": [("1", "강진군"), ("2", "고흥군"), ("3", "곡성군"), ("4", "광양시"), ("5", "구례군"), ("6", "나주시"), ("7", "담양군"), ("8", "목포시"), ("9", "무안군"), ("10", "보성군"), ("11", "순천시"), ("12", "신안군"), ("13", "여수시"), ("16", "영광군"), ("17", "영암군"), ("18", "완도군"), ("19", "장성군"), ("20", "장흥군"), ("21", "진도군"), ("22", "함평군"), ("23", "해남군"), ("24", "화순군")],
    "39": [("1", "남제주군"), ("2", "북제주군"), ("3", "서귀포시"), ("4", "제주시")],
}

THEME_CODE_MAP = {
    "산": ["A01010400"],
    "폭포": ["A01010800"],
    "계곡": ["A01010900"],
    "바다": ["A01011100", "A01011200", "A01011400", "A01011600"],
    "호수": ["A01011700"],
    "강": ["A01011800"],
    "동굴": ["A01011900"],
    "역사": ["A02010100", "A02010200", "A02010300", "A02010600", "A02010700"],
    "사찰": ["A02010800"],
    "온천/욕장/스파": ["A02020300"],
    "테마공원": ["A02020600"],
    "체험": ["A02030100", "A02030200", "A02030300", "A02030400"],
    "기념/전망": ["A02050200"],
    "문화시설": ["A02060100", "A02060200", "A02060300", "A02060500", "A02061200"],
    "레포츠": [
        "A03020300", "A03020400", "A03020500", "A03020600", "A03020700",
        "A03020900", "A03021100", "A03021200", "A03021300", "A03021400",
        "A03021600", "A03021700", "A03021800", "A03022000", "A03022100",
        "A03022200", "A03022300", "A03022400", "A03022700",
        "A03030100", "A03030200", "A03030300", "A03030400", "A03030500",
        "A03030600", "A03030700", "A03030800", "A03040100", "A03040200",
        "A03040300",
    ],
}

# --- 요청/응답 모델 ---
class CourseRecommendRequest(BaseModel):
    region_name: str = Field(..., description="예: 서울, 부산, 경기도")
    gungu_name: Optional[str] = Field(None, description="예: 강남구, 해운대구. 없으면 전체")
    days: int = Field(..., ge=1, le=3)
    themes: List[str] = Field(..., min_length=2)

class FoodCandidate(BaseModel):
    trip_conts_id: int
    trip_nm: str
    trip_addr: Optional[str]
    distance: float

class CourseItem(BaseModel):
    day: int
    time: str
    trip_conts_id: int
    trip_nm: str
    trip_addr: Optional[str] = None
    trip_tag: Optional[str] = None
    trip_lat: Optional[float] = None
    trip_lot: Optional[float] = None
    reason: Optional[str] = None
    food_candidates: List[FoodCandidate] = Field(default_factory=list)

class CourseRecommendResponse(BaseModel):
    region_name: str
    region_code: str
    gungu_name: Optional[str] = None
    gungu_code: Optional[str] = None
    days: int
    themes: List[str]
    selected_cluster: int
    course: List[CourseItem]
    trip_ids: List[int]
    raw_places: List[str]
    filtered_candidate_count: int
    cluster_count: int
    llm_raw: Dict[str, Any]

# --- 유틸 함수 ---
def get_connection():
    return oracledb.connect(user=HAEBOM_USER, password=HAEBOM_PASSWORD, dsn=HAEBOM_DSN)

def validate_region_and_gungu(region_name: str, gungu_name: Optional[str]) -> tuple[str, Optional[str]]:
    region_code = REGION_CODE_MAP.get(region_name)
    if not region_code:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 지역입니다: {region_name}")
    if not gungu_name or gungu_name == "전체":
        return region_code, None
    gungu_list = GUNGU_MAP.get(region_code, [])
    gungu_code = next((code for code, name in gungu_list if name == gungu_name), None)
    if not gungu_code:
        raise HTTPException(status_code=400, detail=f"{region_name}에 해당 군구가 없습니다: {gungu_name}")
    return region_code, gungu_code

def validate_themes(themes: List[str]) -> List[str]:
    invalid = [theme for theme in themes if theme not in THEME_CODE_MAP]
    if invalid:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 테마입니다: {invalid}")
    return themes

def get_selected_codes(themes: List[str]) -> List[str]:
    selected_codes: List[str] = []
    for theme in themes:
        selected_codes.extend(THEME_CODE_MAP[theme])
    return selected_codes

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = np.radians(lat1), np.radians(lon1), np.radians(lat2), np.radians(lon2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    return R * c

def distance(a, b):
    return np.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

def safe_float(value) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None

# --- 데이터 조회 ---
def load_food_candidates(region_code: str, gungu_code: Optional[str]) -> pd.DataFrame:
    where = "TRIP_CTPV = :region AND TRIP_CLSF = 39"
    params = {"region": region_code}
    if gungu_code:
        where += " AND TRIP_GUNGU = :gungu"
        params["gungu"] = gungu_code
    sql = f"""
    SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
    FROM TRIP t
    WHERE {where}
    AND EXISTS (
            SELECT 1
            FROM ATTACH_FILE a
            WHERE a.BOARD_ID = t.TRIP_CONTS_ID
    )
    ORDER BY TRIP_INQ_CNT DESC NULLS LAST
    """
    with get_connection() as conn:
        food_df = pd.read_sql(sql, conn, params=params)
    food_df["TRIP_LAT"] = pd.to_numeric(food_df["TRIP_LAT"], errors="coerce")
    food_df["TRIP_LOT"] = pd.to_numeric(food_df["TRIP_LOT"], errors="coerce")
    food_df = food_df.dropna(subset=["TRIP_LAT", "TRIP_LOT"])
    return food_df

def attach_food_candidates(mapped_items, food_df):
    for item in mapped_items:
        lat = item["trip_lat"]
        lon = item["trip_lot"]
        if lat is None or lon is None:
            item["food_candidates"] = []
            continue
        temp = food_df.copy()
        temp["distance"] = haversine(lat, lon, temp["TRIP_LAT"], temp["TRIP_LOT"])
        near_food = temp[temp["distance"] <= 2]
        near_food = near_food.sort_values("distance").head(5)
        foods = []
        for _, row in near_food.iterrows():
            foods.append({
                "trip_conts_id": int(row["TRIP_CONTS_ID"]),
                "trip_nm": row["TRIP_NM"],
                "trip_addr": row["TRIP_ADDR"],
                "distance": round(float(row["distance"]), 2)
            })
        item["food_candidates"] = foods
    return mapped_items

def load_trip_candidates(region_code: str, gungu_code: Optional[str], selected_codes: List[str]) -> pd.DataFrame:
    df_list: List[pd.DataFrame] = []
    with get_connection() as conn:
        for code in selected_codes:
            where_clause = "TRIP_CTPV = :region"
            params: Dict[str, Any] = {"region": region_code, "tag": code}
            if gungu_code:
                where_clause += " AND TRIP_GUNGU = :gungu"
                params["gungu"] = gungu_code
            where_clause += " AND TRIP_TAG = :tag"
            sql = f"""
            SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_TAG, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
            FROM TRIP t
            WHERE {where_clause}
              AND TRIP_CLSF NOT IN (32, 38, 39)
              AND EXISTS (
                    SELECT 1
                    FROM ATTACH_FILE a
                    WHERE a.BOARD_ID = t.TRIP_CONTS_ID
            )
            ORDER BY TRIP_INQ_CNT DESC NULLS LAST
            """
            temp_df = pd.read_sql(sql, conn, params=params)
            df_list.append(temp_df.head(15))

        popular_where = "TRIP_CTPV = :region"
        popular_params: Dict[str, Any] = {"region": region_code}
        if gungu_code:
            popular_where += " AND TRIP_GUNGU = :gungu"
            popular_params["gungu"] = gungu_code
        popular_sql = f"""
        SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_TAG, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
        FROM TRIP t
        WHERE {popular_where}
          AND TRIP_CLSF NOT IN (32, 38, 39)
          AND TRIP_TAG NOT IN ('A02020500')
          AND EXISTS (
                SELECT 1
                FROM ATTACH_FILE a
                WHERE a.BOARD_ID = t.TRIP_CONTS_ID
        )
        ORDER BY TRIP_INQ_CNT DESC NULLS LAST
        """
        popular_df = pd.read_sql(popular_sql, conn, params=popular_params).head(20)

        tag_df = pd.concat(df_list, ignore_index=True) if df_list else pd.DataFrame()
        df = pd.concat([tag_df, popular_df], ignore_index=True)
        df = df.drop_duplicates(subset="TRIP_CONTS_ID").reset_index(drop=True)

        target_count = 50
        current_count = len(df)
        if current_count < target_count:
            need_count = target_count - current_count
            more_where = "TRIP_CTPV = :region"
            more_params: Dict[str, Any] = {"region": region_code}
            if gungu_code:
                more_where += " AND TRIP_GUNGU = :gungu"
                more_params["gungu"] = gungu_code
            more_sql = f"""
            SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_TAG, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
            FROM TRIP t
            WHERE {more_where}
              AND TRIP_CLSF NOT IN (32, 38, 39)
              AND TRIP_TAG NOT IN ('A02020500')
              AND EXISTS (
                    SELECT 1
                    FROM ATTACH_FILE a
                    WHERE a.BOARD_ID = t.TRIP_CONTS_ID
            )
            ORDER BY TRIP_INQ_CNT DESC NULLS LAST
            """
            more_df = pd.read_sql(more_sql, conn, params=more_params)
            more_df = more_df[~more_df["TRIP_CONTS_ID"].isin(df["TRIP_CONTS_ID"])]
            more_df = more_df.head(need_count)
            df = pd.concat([df, more_df], ignore_index=True)

    if df.empty:
        raise HTTPException(status_code=404, detail="조건에 맞는 여행지를 찾지 못했습니다.")
    df["TRIP_LAT"] = pd.to_numeric(df["TRIP_LAT"], errors="coerce")
    df["TRIP_LOT"] = pd.to_numeric(df["TRIP_LOT"], errors="coerce")
    df = df.dropna(subset=["TRIP_LAT", "TRIP_LOT"]).reset_index(drop=True)
    if df.empty:
        raise HTTPException(status_code=404, detail="좌표가 있는 여행지 후보를 찾지 못했습니다.")
    return df

# --- 클러스터링 ---
def build_clusters(df: pd.DataFrame, threshold: float = 0.05) -> List[pd.DataFrame]:
    clusters: List[List[int]] = []
    for idx, row in df.iterrows():
        point = (row.TRIP_LAT, row.TRIP_LOT)
        added = False
        for cluster in clusters:
            lat_mean = df.loc[cluster, "TRIP_LAT"].mean()
            lon_mean = df.loc[cluster, "TRIP_LOT"].mean()
            if haversine(point[0], point[1], lat_mean, lon_mean) < 7:
                cluster.append(idx)
                added = True
                break
        if not added:
            clusters.append([idx])

    cluster_lists: List[pd.DataFrame] = []
    for cluster in clusters:
        cluster_df = (
            df.loc[cluster]
            .sort_values("TRIP_INQ_CNT", ascending=False)
            .head(15)
            .reset_index(drop=True)
        )
        cluster_lists.append(cluster_df)

    cluster_lists = sorted(cluster_lists, key=lambda x: len(x), reverse=True)
    cluster_lists = cluster_lists[:3]
    return cluster_lists

def expand_clusters(cluster_lists: List[pd.DataFrame], full_df: pd.DataFrame, days: int) -> List[pd.DataFrame]:
    target_size = days * 6
    expanded_clusters = []
    for cluster_df in cluster_lists:
        cluster_df = cluster_df.copy()
        if len(cluster_df) >= target_size:
            expanded_clusters.append(cluster_df.head(target_size))
            continue
        temp = full_df.copy()
        temp = temp[~temp["TRIP_CONTS_ID"].isin(cluster_df["TRIP_CONTS_ID"])]
        cluster_points = cluster_df[["TRIP_LAT", "TRIP_LOT"]].values
        def min_cluster_distance(row):
            lat = row["TRIP_LAT"]
            lon = row["TRIP_LOT"]
            distances = [haversine(lat, lon, p[0], p[1]) for p in cluster_points]
            return min(distances)
        temp["distance"] = temp.apply(min_cluster_distance, axis=1)
        temp = temp[temp["distance"] <= 5]
        temp = temp.sort_values("TRIP_INQ_CNT", ascending=False)
        need = target_size - len(cluster_df)
        add_df = temp.head(need)
        cluster_df = pd.concat([cluster_df, add_df], ignore_index=True)
        expanded_clusters.append(cluster_df)
    return expanded_clusters

def build_cluster_prompt(cluster_lists: List[pd.DataFrame]) -> str:
    cluster_texts: List[str] = []
    for i, cluster_df in enumerate(cluster_lists):
        text = "\n".join(
            f"{j+1}. {row.TRIP_NM} | ID:{row.TRIP_CONTS_ID} | TAG:{row.TRIP_TAG}"
            for j, (_, row) in enumerate(cluster_df.iterrows())
        )
        cluster_text = f"CLUSTER {i+1}\n{text}"
        cluster_texts.append(cluster_text)
    return "\n\n".join(cluster_texts)

def build_time_rule_text(df: pd.DataFrame) -> str:
    used_tags = set(df["TRIP_TAG"].dropna().astype(str).unique())
    filtered_rules = {tag: TIME_RULES[tag] for tag in used_tags if tag in TIME_RULES}
    if not filtered_rules:
        return "없음"
    return "\n".join(f"{tag} -> {','.join(times)}" for tag, times in filtered_rules.items())

# --- LLM 호출 ---
def call_llm_for_course(region_name: str, days: int, themes: List[str], time_rule_text: str, cluster_prompt: str) -> Dict[str, Any]:
    prompt = f"""
당신은 한국 여행 코스 설계 전문가입니다.

지역: {region_name}
여행 기간: {days}일
테마: {', '.join(themes)}

시간대 정의
- morning = 06:00~11:00
- afternoon = 11:00~17:00
- evening = 17:00~21:00

관광지 태그별 추천 방문 시간 규칙
{time_rule_text}

아래는 서로 가까운 여행지 그룹(클러스터)입니다.
{cluster_prompt}

규칙
1. 가장 여행 코스로 적합한 클러스터 하나만 선택하세요.(클러스터 내부 여행지 수가 많을수록 가산점)
2. 선택한 클러스터 내부 여행지만 사용하세요.
3. 같은 장소는 한 번만 사용하세요.
4. 하루 일정은 오전/오후/저녁 순서로 구성하세요.
5. 관광지는 해당 TAG의 관광지 태그별 추천 방문 시간 규칙에 따라 배치하세요.
6. 여행 기간({days}일)에 맞게 일정을 생성하세요.
7. days={days}이면 day=1부터 day={days}까지 일정이 있어야 합니다.
8. 하루마다 morning / afternoon / evening 일정이 반드시 있어야 합니다.
9. 반드시 JSON만 출력하세요. 설명 문장, 마크다운, 코드블록 금지.
10. 각 일정 항목에는 반드시 trip_nm 을 넣으세요.
11. 없는 장소를 만들지 마세요. 반드시 클러스터 목록에 있는 여행지만 선택하세요.
12. 같은 태그는 하루에 하나만 배치하세요.

출력 JSON 스키마 예시 (days={days})
{{
  "selected_cluster": 1,
  "schedule": [
    {{"day": 1, "time": "morning", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 1, "time": "afternoon", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 1, "time": "evening", "trip_nm": "장소명", "reason": "선정 이유"}}
  ]
}}
""".strip()

    response = client.chat.completions.create(
        model=AI_MODEL,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "당신은 여행 코스를 JSON으로만 출력하는 시스템입니다."},
            {"role": "user", "content": prompt},
        ],
    )
    content = response.choices[0].message.content
    if not content:
        raise HTTPException(status_code=500, detail="LLM 응답이 비어 있습니다.")
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"LLM JSON 파싱 실패: {content}")
    parsed["_usage"] = {
        "prompt_tokens": getattr(response.usage, "prompt_tokens", None),
        "completion_tokens": getattr(response.usage, "completion_tokens", None),
        "total_tokens": getattr(response.usage, "total_tokens", None),
    }
    return parsed

# --- LLM 결과 매핑 ---
def normalize_name(name: str) -> str:
    name = re.sub(r"\s+", "", name or "")
    return name.strip().lower()

def map_schedule_to_trip_ids(schedule: List[Dict[str, Any]], df: pd.DataFrame) -> List[Dict[str, Any]]:
    if not schedule:
        raise HTTPException(status_code=500, detail="LLM 일정 결과가 비어 있습니다.")
    df = df.copy()
    df["TRIP_NM_NORMALIZED"] = df["TRIP_NM"].astype(str).apply(normalize_name)
    used_ids = set()
    mapped_items: List[Dict[str, Any]] = []
    for item in schedule:
        trip_nm = (item.get("trip_nm") or "").strip()
        if not trip_nm:
            continue
        normalized = normalize_name(trip_nm)
        matched = df[df["TRIP_NM_NORMALIZED"] == normalized]
        if matched.empty:
            contains = df[df["TRIP_NM"].astype(str).str.contains(re.escape(trip_nm), na=False)]
            matched = contains
        if matched.empty:
            continue
        matched = matched.sort_values("TRIP_INQ_CNT", ascending=False)
        chosen_row = None
        for _, row in matched.iterrows():
            if str(row["TRIP_CONTS_ID"]) not in used_ids:
                chosen_row = row
                break
        if chosen_row is None:
            chosen_row = matched.iloc[0]
        trip_id = int(chosen_row["TRIP_CONTS_ID"])
        used_ids.add(trip_id)
        mapped_items.append({
            "day": int(item.get("day", 1)),
            "time": str(item.get("time", "")).strip(),
            "trip_conts_id": trip_id,
            "trip_nm": str(chosen_row["TRIP_NM"]),
            "trip_addr": str(chosen_row["TRIP_ADDR"]) if pd.notna(chosen_row["TRIP_ADDR"]) else None,
            "trip_tag": str(chosen_row["TRIP_TAG"]) if pd.notna(chosen_row["TRIP_TAG"]) else None,
            "trip_lat": safe_float(chosen_row["TRIP_LAT"]),
            "trip_lot": safe_float(chosen_row["TRIP_LOT"]),
            "reason": str(item.get("reason", "")).strip() or None,
        })
    if not mapped_items:
        raise HTTPException(status_code=500, detail="LLM 결과를 여행지 코드로 매핑하지 못했습니다.")
    return mapped_items

# --- 메인 서비스 함수 ---
def generate_course(req: CourseRecommendRequest) -> CourseRecommendResponse:
    validate_themes(req.themes)
    region_code, gungu_code = validate_region_and_gungu(req.region_name, req.gungu_name)
    selected_codes = get_selected_codes(req.themes)
    df = load_trip_candidates(region_code, gungu_code, selected_codes)
    cluster_lists = build_clusters(df)
    cluster_lists = expand_clusters(cluster_lists, df, req.days)

    print("\n===================================")
    print("LLM에 전달되는 전체 클러스터")
    print("===================================")
    for i, cluster_df in enumerate(cluster_lists):
        print(f"\nCLUSTER {i+1}")
        print("-----------------------------------")
        for j, row in cluster_df.iterrows():
            print(f"{j+1}. {row['TRIP_NM']} (ID:{row['TRIP_CONTS_ID']}) TAG:{row['TRIP_TAG']}")
    print("\n===================================\n")

    cluster_prompt = build_cluster_prompt(cluster_lists)
    time_rule_text = build_time_rule_text(df)
    llm_raw = call_llm_for_course(
        region_name=req.region_name,
        days=req.days,
        themes=req.themes,
        time_rule_text=time_rule_text,
        cluster_prompt=cluster_prompt,
    )
    schedule = llm_raw.get("schedule", [])
    selected_cluster = int(llm_raw.get("selected_cluster", 1))
    selected_cluster = max(1, min(selected_cluster, len(cluster_lists)))

    if 1 <= selected_cluster <= len(cluster_lists):
        selected_cluster_df = cluster_lists[selected_cluster - 1]
        print(f"\n==============================")
        print(f"LLM 선택 클러스터 : CLUSTER {selected_cluster}")
        print("==============================")
        for i, row in selected_cluster_df.iterrows():
            print(f"{i+1}. {row['TRIP_NM']} (ID:{row['TRIP_CONTS_ID']}) TAG:{row['TRIP_TAG']}")
        print("==============================\n")

    mapped_items = map_schedule_to_trip_ids(schedule, df)
    food_df = load_food_candidates(region_code, gungu_code)
    mapped_items = attach_food_candidates(mapped_items, food_df)
    trip_ids = [int(item["trip_conts_id"]) for item in mapped_items]
    raw_places = [str(item.get("trip_nm", "")) for item in schedule if item.get("trip_nm")]

    return CourseRecommendResponse(
        region_name=req.region_name,
        region_code=region_code,
        gungu_name=req.gungu_name,
        gungu_code=gungu_code,
        days=req.days,
        themes=req.themes,
        selected_cluster=selected_cluster,
        course=[CourseItem(**item) for item in mapped_items],
        trip_ids=trip_ids,
        raw_places=raw_places,
        filtered_candidate_count=len(df),
        cluster_count=len(cluster_lists),
        llm_raw=llm_raw,
    )

# --- AI 코스 API 엔드포인트 ---
@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/meta/regions")
def get_regions():
    return {
        "regions": [
            {"region_name": name, "region_code": code}
            for name, code in REGION_CODE_MAP.items()
        ]
    }

@app.get("/meta/gungu/{region_name}")
def get_gungu(region_name: str):
    region_code = REGION_CODE_MAP.get(region_name)
    if not region_code:
        raise HTTPException(status_code=404, detail="존재하지 않는 지역입니다.")
    return {
        "region_name": region_name,
        "region_code": region_code,
        "gungu": [
            {"gungu_code": code, "gungu_name": name}
            for code, name in GUNGU_MAP.get(region_code, [])
        ],
    }

@app.get("/meta/themes")
def get_themes():
    return {
        "themes": [
            {"theme_name": key, "theme_codes": value}
            for key, value in THEME_CODE_MAP.items()
        ]
    }

@app.post("/course/recommend", response_model=CourseRecommendResponse)
def recommend_course(req: CourseRecommendRequest):
    try:
        return generate_course(req)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"코스 추천 처리 중 오류: {str(e)}")


# ============================================================
# 로컬 실행용
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("trip_chatbot:app", host="0.0.0.0", port=8000, reload=True)
