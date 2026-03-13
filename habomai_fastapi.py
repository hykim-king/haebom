from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
import pandas as pd
import oracledb
import os
import numpy as np
import re
import json
from typing import List, Optional, Dict, Any
from pydantic import Field

# ============================================================
# 1) 환경 변수(.env) 로드
# ============================================================
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")

DB_USER = os.getenv("DB_USER", "habom")
DB_PASS = os.getenv("DB_PASS", "0317")
DB_DSN = os.getenv("DB_DSN", "192.168.100.30:1522/xe")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")

client = OpenAI(api_key=OPENAI_API_KEY)
app = FastAPI(title="HaBom AI Travel Course API", version="1.0.0")

# ============================================================
# 2) 상수 테이블
# ============================================================
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
    "서울": "1",
    "인천": "2",
    "대전": "3",
    "대구": "4",
    "광주": "5",
    "부산": "6",
    "울산": "7",
    "세종특별자치시": "8",
    "경기도": "31",
    "강원특별자치도": "32",
    "충청북도": "33",
    "충청남도": "34",
    "경상북도": "35",
    "경상남도": "36",
    "전북특별자치도": "37",
    "전라남도": "38",
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

# ============================================================
# 3) 요청/응답 모델
# ============================================================
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


# ============================================================
# 4) 유틸 함수
# ============================================================
def get_connection():
    return oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN)


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
    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)
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




# ============================================================
# 5) 데이터 조회
# ============================================================
def load_food_candidates(region_code: str, gungu_code: Optional[str]) -> pd.DataFrame:

    where = "TRIP_CTPV = :region AND TRIP_CLSF = 39"
    params = {"region": region_code}

    if gungu_code:
        where += " AND TRIP_GUNGU = :gungu"
        params["gungu"] = gungu_code

    sql = f"""
    SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
    FROM TRIP
    WHERE {where}
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

        temp["distance"] = haversine(
            lat,
            lon,
            temp["TRIP_LAT"],
            temp["TRIP_LOT"]
        )

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
            params: Dict[str, Any] = {
                "region": region_code,
                "tag": code,
            }

            if gungu_code:
                where_clause += " AND TRIP_GUNGU = :gungu"
                params["gungu"] = gungu_code

            where_clause += " AND TRIP_TAG = :tag"

            sql = f"""
            SELECT TRIP_CONTS_ID, TRIP_NM, TRIP_ADDR, TRIP_TAG, TRIP_LAT, TRIP_LOT, TRIP_INQ_CNT
            FROM TRIP
            WHERE {where_clause}
              AND TRIP_CLSF NOT IN (32, 38, 39)
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
        FROM TRIP
        WHERE {popular_where}
          AND TRIP_CLSF NOT IN (32, 38, 39)
          AND TRIP_TAG NOT IN ('A02020500')
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
            FROM TRIP
            WHERE {more_where}
              AND TRIP_CLSF NOT IN (32, 38, 39)
              AND TRIP_TAG NOT IN ('A02020500')
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


# ============================================================
# 6) 클러스터링
# ============================================================
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




    #클러스터 개수제한(3개)
    cluster_lists: List[pd.DataFrame] = []

    for cluster in clusters:

        cluster_df = (
            df.loc[cluster]
            .sort_values("TRIP_INQ_CNT", ascending=False)
            .head(15)
            .reset_index(drop=True)
        )

        cluster_lists.append(cluster_df)


    # ============================
    # 클러스터 크기 기준 정렬
    # ============================
    cluster_lists = sorted(
        cluster_lists,
        key=lambda x: len(x),
        reverse=True
    )

    # 상위 3개만 사용
    cluster_lists = cluster_lists[:3]

    return cluster_lists

def expand_clusters(cluster_lists: List[pd.DataFrame],
                    full_df: pd.DataFrame,
                    days: int) -> List[pd.DataFrame]:

    target_size = days * 6
    expanded_clusters = []

    for cluster_df in cluster_lists:

        cluster_df = cluster_df.copy()

        if len(cluster_df) >= target_size:
            expanded_clusters.append(cluster_df.head(target_size))
            continue

        temp = full_df.copy()

        # 기존 클러스터 제외
        temp = temp[~temp["TRIP_CONTS_ID"].isin(cluster_df["TRIP_CONTS_ID"])]

        # 클러스터 내부 좌표 리스트
        cluster_points = cluster_df[["TRIP_LAT", "TRIP_LOT"]].values

        # 각 후보 여행지와 클러스터 내부 여행지 중 최소 거리 계산
        def min_cluster_distance(row):

            lat = row["TRIP_LAT"]
            lon = row["TRIP_LOT"]

            distances = [
                haversine(lat, lon, p[0], p[1])
                for p in cluster_points
            ]

            return min(distances)

        temp["distance"] = temp.apply(min_cluster_distance, axis=1)

        # 5km 이내
        temp = temp[temp["distance"] <= 5]

        # 인기순 정렬
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


# ============================================================
# 7) LLM 호출
# ============================================================
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
    {{"day": 1, "time": "evening", "trip_nm": "장소명", "reason": "선정 이유"}},

    {{"day": 2, "time": "morning", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 2, "time": "afternoon", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 2, "time": "evening", "trip_nm": "장소명", "reason": "선정 이유"}},
    
    {{"day": 3, "time": "morning", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 3, "time": "afternoon", "trip_nm": "장소명", "reason": "선정 이유"}},
    {{"day": 3, "time": "evening", "trip_nm": "장소명", "reason": "선정 이유"}}
  
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


# ============================================================
# 8) LLM 결과 -> TRIP_CONTS_ID 매핑
# ============================================================
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


# ============================================================
# 9) 메인 서비스 함수
# ============================================================
def generate_course(req: CourseRecommendRequest) -> CourseRecommendResponse:
    validate_themes(req.themes)
    region_code, gungu_code = validate_region_and_gungu(req.region_name, req.gungu_name)
    selected_codes = get_selected_codes(req.themes)

    df = load_trip_candidates(region_code, gungu_code, selected_codes)

    cluster_lists = build_clusters(df)

    # 클러스터 확장
    cluster_lists = expand_clusters(cluster_lists, df, req.days)


    #넘겨주는 클러스터 디버그 출력
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
    # ============================================================
    # 선택된 클러스터 출력 (디버그용)
    # ============================================================

    if 1 <= selected_cluster <= len(cluster_lists):

        selected_cluster_df = cluster_lists[selected_cluster - 1]

        print("\n==============================")
        print(f"LLM 선택 클러스터 : CLUSTER {selected_cluster}")
        print("==============================")

        for i, row in selected_cluster_df.iterrows():
            print(f"{i+1}. {row['TRIP_NM']} (ID:{row['TRIP_CONTS_ID']}) TAG:{row['TRIP_TAG']}")

        print("==============================\n")



    mapped_items = map_schedule_to_trip_ids(schedule, df)
    # 음식점 후보 조회
    food_df = load_food_candidates(region_code, gungu_code)

    # 음식점 후보 계산
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


# ============================================================
# 10) API 엔드포인트
# ============================================================
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
# 11) 로컬 실행용
# ============================================================
# 실행:
# uvicorn habomai_fastapi_complete:app --reload --host 0.0.0.0 --port 8000
