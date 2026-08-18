from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import random
from pathlib import Path


app = FastAPI(title="WannaDo API")


# ============================
# CORS 설정
# ============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================
# 활동 데이터
# ============================

DATA_PATH = Path(__file__).parent.parent / "data" / "activities.json"


def load_activities():
    with open(DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


# ============================
# 현재 시간대
# ============================

def get_current_time_slot():

    hour = datetime.now().hour

    if 6 <= hour < 12:
        return "morning"

    if 12 <= hour < 18:
        return "afternoon"

    if 18 <= hour < 22:
        return "evening"

    return "night"


# ============================
# 기본 API
# ============================

@app.get("/")
def root():

    return {
        "message": "WannaDo API"
    }


# ============================
# 전체 활동 조회
# ============================

@app.get("/activities")
def get_activities():

    return load_activities()


# ============================
# 조건에 맞는 활동 전체 조회
# ============================

@app.get("/recommendations")
def get_recommendations(
    category: str | None = None,
    max_cost: int | None = None,
    people: str | None = None,
    indoor: bool | None = None
):

    activities = load_activities()

    recommendations = []

    for activity in activities:

        if category is not None and activity["category"] != category:
            continue

        if max_cost is not None and activity["cost"] > max_cost:
            continue

        if people is not None and people not in activity["people"]:
            continue

        if indoor is not None and activity["indoor"] != indoor:
            continue

        recommendations.append(activity)

    return recommendations


# ============================
# 활동 하나 추천
# ============================

@app.get("/recommend")
def recommend_activity(
    category: str | None = None,
    max_cost: int | None = None,
    people: str | None = None,
    indoor: bool | None = None
):

    activities = load_activities()

    candidates = []


    # ----------------------------
    # 기본 조건 필터링
    # ----------------------------

    for activity in activities:

        if category is not None and activity["category"] != category:
            continue

        if max_cost is not None and activity["cost"] > max_cost:
            continue

        if people is not None and people not in activity["people"]:
            continue

        if indoor is not None and activity["indoor"] != indoor:
            continue

        candidates.append(activity)


    # ----------------------------
    # 조건에 맞는 활동이 없는 경우
    # ----------------------------

    if not candidates:

        return {
            "message": "조건에 맞는 활동이 없습니다."
        }


    # ----------------------------
    # 현재 시간대 확인
    # ----------------------------

    current_time_slot = get_current_time_slot()


    # ----------------------------
    # 시간대 기반 점수 계산
    # ----------------------------

    scored_candidates = []


    for activity in candidates:

        score = 0

        time_slots = activity.get("time_slots", [])


        # 현재 시간대에 적합하면 높은 점수
        if current_time_slot in time_slots:
            score += 3


        scored_candidates.append(
            (activity, score)
        )


    # ----------------------------
    # 가장 높은 점수 찾기
    # ----------------------------

    max_score = max(
        score
        for activity, score in scored_candidates
    )


    # ----------------------------
    # 최고 점수 활동만 추리기
    # ----------------------------

    best_candidates = [

        activity

        for activity, score
        in scored_candidates

        if score == max_score
    ]


    # ----------------------------
    # 최고 점수 중 랜덤 추천
    # ----------------------------

    return random.choice(best_candidates)