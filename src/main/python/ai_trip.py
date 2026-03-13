import re
from typing import List, Optional
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import uvicorn

app = FastAPI(title="AI Travel Recommendation API")

# --- CORS 설정 ---
# 프론트엔드나 Java 서버에서 호출할 수 있도록 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OpenAI 설정 ---
# 실제 API 키로 교체하세요.
client = OpenAI(api_key="")

# --- 데이터 모델 정의 (Pydantic) ---
class RecommendRequest(BaseModel):
    user_input: str = "추천 여행지"
    user_tag: str = "일반"

class AgeRecommendRequest(BaseModel):
    age_group: str = "20대"

class LocalRecommendRequest(BaseModel):
    local_addr: str = "전국"

# --- 공통 로직: GPT 호출 및 파싱 ---
def get_gpt_recommendation(system_instruction: str, user_content: str) -> Optional[List[str]]:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_content}
            ],
            temperature=0.3
        )
        ai_answer = response.choices[0].message.content.strip()
        print(f"GPT 원본 응답: {ai_answer}")

        # 정규표현식을 이용한 데이터 정제
        raw_list = re.split(r'[,\n]', ai_answer)
        clean_list = []
        
        for name in raw_list:
            t_name = name.strip()
            # 1. 앞부분의 숫자, 기호 제거 (예: "1. 경복궁" -> "경복궁")
            t_name = re.sub(r'^[0-9\s\.\-\)]+', '', t_name)
            # 2. 불필요한 마침표 및 공백 제거
            t_name = t_name.replace(".", "").strip()
            
            if 0 < len(t_name) < 20:
                clean_list.append(t_name)
                
        return clean_list
    except Exception as e:
        print(f"GPT 에러 발생: {e}")
        return None

# --- API 엔드포인트 ---

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
    
    # 기본값 설정
    default_spots = [f"{req.local_addr} 호수공원", f"{req.local_addr} 시청 인근", f"{req.local_addr} 맛집골목", f"{req.local_addr} 산책로"]
    return result if result else default_spots

# --- 실행부 ---
if __name__ == '__main__':
    # Flask의 app.run과 대응되는 uvicorn 실행 코드
    uvicorn.run(app, host="0.0.0.0", port=5000)