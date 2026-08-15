from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import random
from pathlib import Path


app = FastAPI(title="WannaDo API")


# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 활동 데이터 위치
DATA_PATH = Path(__file__).parent.parent / "data" / "activities.json"


def load_activities():
    with open(DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


# 기본 API
@app.get("/")
def root():
    return {
        "message": "WannaDo API"
    }


# 전체 활동 조회
@app.get("/activities")
def get_activities():
    return load_activities()


# 조건에 맞는 활동 전체 조회
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


# 활동 하나 추천
@app.get("/recommend")
def recommend_activity(
    category: str | None = None,
    max_cost: int | None = None,
    people: str | None = None,
    indoor: bool | None = None
):
    activities = load_activities()

    candidates = []

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

    if not candidates:
        return {
            "message": "조건에 맞는 활동이 없습니다."
        }

    return random.choice(candidates)