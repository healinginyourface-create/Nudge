const API_URL = "http://127.0.0.1:8000";

const card = document.getElementById("card");

const likeButton = document.getElementById("like");
const dislikeButton = document.getElementById("dislike");
const recommendButton = document.getElementById("recommend");

const peopleButtons = document.querySelectorAll(".people");
const budgetButtons = document.querySelectorAll(".budget");
const placeButtons = document.querySelectorAll(".place");


let selectedPeople = null;
let selectedBudget = null;
let selectedIndoor = null;

let isDragging = false;
let startX = 0;
let currentX = 0;


// ============================
// 조건 선택
// ============================

function selectOption(buttons, setter) {

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item => {
                item.classList.remove("selected");
            });

            button.classList.add("selected");

            setter(button.dataset.value);
        });

    });
}


// 누구와?
selectOption(
    peopleButtons,
    value => {
        selectedPeople = value;
    }
);


// 예산
selectOption(
    budgetButtons,
    value => {
        selectedBudget = value;
    }
);


// 장소
selectOption(
    placeButtons,
    value => {

        if (value === "all") {
            selectedIndoor = null;
        } else {
            selectedIndoor = value === "true";
        }

    }
);


// ============================
// 추천 요청
// ============================

async function getRecommendation() {

    card.innerHTML = `
        <div class="loading">
            추천을 고르는 중...
        </div>
    `;

    try {

        const params = new URLSearchParams();


        if (selectedPeople !== null) {
            params.append("people", selectedPeople);
        }


        if (selectedBudget !== null) {
            params.append("max_cost", selectedBudget);
        }


        if (selectedIndoor !== null) {
            params.append("indoor", selectedIndoor);
        }


        const url =
            `${API_URL}/recommend?${params.toString()}`;


        console.log("추천 요청:", url);


        const response = await fetch(url);


        if (!response.ok) {
            throw new Error("추천을 가져오지 못했습니다.");
        }


        const activity = await response.json();


        if (activity.message) {

            card.innerHTML = `
                <h2>${activity.message}</h2>
            `;

            return;
        }


        showActivity(activity);


    } catch (error) {

        card.innerHTML = `
            <h2>오류가 발생했습니다.</h2>
            <p>${error.message}</p>
        `;

        console.error(error);
    }
}


// ============================
// 활동 카드
// ============================

function showActivity(activity) {

    const peopleText = activity.people
        .map(person => {

            if (person === "alone") {
                return "혼자";
            }

            if (person === "friend") {
                return "친구";
            }

            if (person === "couple") {
                return "연인";
            }

            return person;
        })
        .join(" · ");


    const placeText = activity.indoor
        ? "실내"
        : "야외";


    card.innerHTML = `
        <p class="category">
            ${activity.category}
        </p>

        <h2>${activity.title}</h2>

        <p class="info">
            📍 ${activity.location}
        </p>

        <p class="info">
            💰 ${activity.cost.toLocaleString()}원
        </p>

        <p class="info">
            ⏱ ${activity.duration}분
        </p>

        <p class="info">
            🏠 ${placeText}
        </p>

        <p class="info">
            👥 ${peopleText}
        </p>
    `;


    card.style.transform =
        "translateX(0) rotate(0deg)";

    card.style.transition = "none";
    card.style.cursor = "grab";
}


// ============================
// 카드 드래그
// ============================

function startDrag(event) {

    isDragging = true;

    startX = event.clientX;

    card.style.transition = "none";
    card.style.cursor = "grabbing";

    card.setPointerCapture(event.pointerId);
}


function drag(event) {

    if (!isDragging) {
        return;
    }


    currentX =
        event.clientX - startX;


    const rotation =
        currentX / 15;


    card.style.transform =
        `translateX(${currentX}px) rotate(${rotation}deg)`;
}


function endDrag() {

    if (!isDragging) {
        return;
    }


    isDragging = false;

    card.style.cursor = "grab";


    const threshold = 120;


    if (currentX > threshold) {

        swipe("like");

    } else if (currentX < -threshold) {

        swipe("dislike");

    } else {

        card.style.transition =
            "transform 0.3s ease";

        card.style.transform =
            "translateX(0) rotate(0deg)";
    }


    currentX = 0;
}


// ============================
// 좋아요 / 싫어요
// ============================

function swipe(type) {

    const direction =
        type === "like" ? 1 : -1;


    card.style.transition =
        "transform 0.4s ease";


    card.style.transform =
        `translateX(${direction * 600}px) rotate(${direction * 30}deg)`;


    setTimeout(() => {

        getRecommendation();

    }, 400);
}


// ============================
// 이벤트 연결
// ============================

card.addEventListener(
    "pointerdown",
    startDrag
);


card.addEventListener(
    "pointermove",
    drag
);


card.addEventListener(
    "pointerup",
    endDrag
);


card.addEventListener(
    "pointercancel",
    endDrag
);


likeButton.addEventListener(
    "click",
    () => swipe("like")
);


dislikeButton.addEventListener(
    "click",
    () => swipe("dislike")
);


// 추천 버튼
recommendButton.addEventListener(
    "click",
    getRecommendation
);