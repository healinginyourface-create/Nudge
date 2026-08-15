const API_URL = "http://127.0.0.1:8000";

const card = document.getElementById("card");
const likeButton = document.getElementById("like");
const dislikeButton = document.getElementById("dislike");

let isDragging = false;
let startX = 0;
let currentX = 0;


async function getRecommendation() {
    try {
        const response = await fetch(`${API_URL}/recommend`);

        if (!response.ok) {
            throw new Error("추천을 가져오지 못했습니다.");
        }

        const activity = await response.json();

        if (activity.message) {
            card.innerHTML = `<h2>${activity.message}</h2>`;
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


function showActivity(activity) {
    card.innerHTML = `
        <h2>${activity.title}</h2>
        <p class="info">📍 ${activity.location}</p>
        <p class="info">💰 ${activity.cost.toLocaleString()}원</p>
        <p class="info">⏱ ${activity.duration}분</p>
    `;

    card.style.transform = "translateX(0) rotate(0deg)";
    card.style.transition = "none";
    card.style.cursor = "grab";
}


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

    currentX = event.clientX - startX;

    const rotation = currentX / 15;

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
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translateX(0) rotate(0deg)";
    }

    currentX = 0;
}


function swipe(type) {
    const direction = type === "like" ? 1 : -1;

    card.style.transition = "transform 0.4s ease";

    card.style.transform =
        `translateX(${direction * 600}px) rotate(${direction * 30}deg)`;

    setTimeout(() => {
        getRecommendation();
    }, 400);
}


card.addEventListener("pointerdown", startDrag);
card.addEventListener("pointermove", drag);
card.addEventListener("pointerup", endDrag);
card.addEventListener("pointercancel", endDrag);


likeButton.addEventListener("click", () => {
    swipe("like");
});


dislikeButton.addEventListener("click", () => {
    swipe("dislike");
});


getRecommendation();
