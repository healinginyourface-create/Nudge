const API_URL = "http://127.0.0.1:8000";


/* ========================= */
/* Elements */
/* ========================= */

const card =
    document.getElementById("card");


const locationFilter =
    document.getElementById("locationFilter");

const peopleFilter =
    document.getElementById("peopleFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const budgetFilter =
    document.getElementById("budgetFilter");


const locationLabel =
    document.getElementById("locationLabel");

const peopleLabel =
    document.getElementById("peopleLabel");

const categoryLabel =
    document.getElementById("categoryLabel");

const budgetLabel =
    document.getElementById("budgetLabel");


const filterModal =
    document.getElementById("filterModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalOptions =
    document.getElementById("modalOptions");

const closeModal =
    document.getElementById("closeModal");


const savedButton =
    document.getElementById("savedButton");

const homeButton =
    document.getElementById("homeButton");

const myButton =
    document.getElementById("myButton");


const savedPage =
    document.getElementById("savedPage");

const myPage =
    document.getElementById("myPage");

const closeSaved =
    document.getElementById("closeSaved");

const closeMy =
    document.getElementById("closeMy");

const savedList =
    document.getElementById("savedList");


/* ========================= */
/* State */
/* ========================= */

let selectedLocation = null;
let selectedPeople = null;
let selectedCategory = null;
let selectedBudget = null;

let currentActivity = null;

let isDragging = false;

let startX = 0;
let currentX = 0;


/* ========================= */
/* Filter Options */
/* ========================= */

const filterData = {

    location: {

        title: "어디로?",

        options: [
            {
                label: "상관없음",
                value: null
            },
            {
                label: "서울",
                value: "서울"
            },
            {
                label: "한강",
                value: "한강"
            },
            {
                label: "성수",
                value: "성수"
            },
            {
                label: "홍대",
                value: "홍대"
            },
            {
                label: "잠실",
                value: "잠실"
            }
        ]
    },


    people: {

        title: "누구와?",

        options: [
            {
                label: "상관없음",
                value: null
            },
            {
                label: "혼자",
                value: "alone"
            },
            {
                label: "친구",
                value: "friend"
            },
            {
                label: "연인",
                value: "couple"
            }
        ]
    },


    category: {

        title: "무엇을?",

        options: [
            {
                label: "상관없음",
                value: null
            },
            {
                label: "음식",
                value: "food"
            },
            {
                label: "자연",
                value: "nature"
            },
            {
                label: "문화",
                value: "culture"
            },
            {
                label: "운동",
                value: "sports"
            },
            {
                label: "활동",
                value: "activity"
            },
            {
                label: "여행",
                value: "tour"
            },
            {
                label: "창작",
                value: "creative"
            }
        ]
    },


    budget: {

        title: "얼마까지?",

        options: [
            {
                label: "상관없음",
                value: null
            },
            {
                label: "1만원 이하",
                value: 10000
            },
            {
                label: "3만원 이하",
                value: 30000
            },
            {
                label: "5만원 이하",
                value: 50000
            }
        ]
    }

};


/* ========================= */
/* Open Filter */
/* ========================= */

function openFilter(type) {

    const data =
        filterData[type];


    modalTitle.textContent =
        data.title;


    modalOptions.innerHTML = "";


    let currentValue = null;


    if (type === "location") {
        currentValue =
            selectedLocation;
    }

    if (type === "people") {
        currentValue =
            selectedPeople;
    }

    if (type === "category") {
        currentValue =
            selectedCategory;
    }

    if (type === "budget") {
        currentValue =
            selectedBudget;
    }


    data.options.forEach(option => {

        const button =
            document.createElement("button");


        button.className =
            "modal-option";


        button.textContent =
            option.label;


        if (
            option.value ===
            currentValue
        ) {

            button.classList.add(
                "selected"
            );

        }


        button.addEventListener(
            "click",
            () => {

                if (
                    type ===
                    "location"
                ) {

                    selectedLocation =
                        option.value;

                }


                if (
                    type ===
                    "people"
                ) {

                    selectedPeople =
                        option.value;

                }


                if (
                    type ===
                    "category"
                ) {

                    selectedCategory =
                        option.value;

                }


                if (
                    type ===
                    "budget"
                ) {

                    selectedBudget =
                        option.value;

                }


                updateFilterButton(
                    type,
                    option.value,
                    option.label
                );


                filterModal.classList.add(
                    "hidden"
                );


                getRecommendation();

            }
        );


        modalOptions.appendChild(
            button
        );

    });


    filterModal.classList.remove(
        "hidden"
    );
}


/* ========================= */
/* Filter Button */
/* ========================= */

function updateFilterButton(
    type,
    value,
    label
) {

    let button;
    let labelElement;


    if (type === "location") {

        button =
            locationFilter;

        labelElement =
            locationLabel;

    }


    if (type === "people") {

        button =
            peopleFilter;

        labelElement =
            peopleLabel;

    }


    if (type === "category") {

        button =
            categoryFilter;

        labelElement =
            categoryLabel;

    }


    if (type === "budget") {

        button =
            budgetFilter;

        labelElement =
            budgetLabel;

    }


    if (value !== null) {

        button.classList.add(
            "selected"
        );

        labelElement.textContent =
            label;

    }

    else {

        button.classList.remove(
            "selected"
        );


        if (
            type === "location"
        ) {

            labelElement.textContent =
                "어디로?";

        }

        if (
            type === "people"
        ) {

            labelElement.textContent =
                "누구와?";

        }

        if (
            type === "category"
        ) {

            labelElement.textContent =
                "무엇을?";

        }

        if (
            type === "budget"
        ) {

            labelElement.textContent =
                "얼마까지?";

        }

    }
}


/* ========================= */
/* Recommendation */
/* ========================= */

async function getRecommendation() {

    card.innerHTML = `

        <div class="loading">

            <div class="loading-dot"></div>

            <p>
                오늘의 활동을<br>
                고르는 중...
            </p>

        </div>

    `;


    try {

        const params =
            new URLSearchParams();


        if (
            selectedPeople !==
            null
        ) {

            params.append(
                "people",
                selectedPeople
            );

        }


        if (
            selectedBudget !==
            null
        ) {

            params.append(
                "max_cost",
                selectedBudget
            );

        }


        if (
            selectedCategory !==
            null
        ) {

            params.append(
                "category",
                selectedCategory
            );

        }


        /*
         * 현재 백엔드가
         * location을 아직 지원하지
         * 않으므로 프론트에서만
         * 선택 상태를 유지한다.
         */


        const url =
            `${API_URL}/recommend?${params.toString()}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "추천을 가져오지 못했습니다."
            );

        }


        const activity =
            await response.json();


        if (activity.message) {

            card.innerHTML = `

                <div class="loading">

                    <p>
                        ${activity.message}
                    </p>

                </div>

            `;

            return;
        }


        currentActivity =
            activity;


        showActivity(
            activity
        );

    }

    catch (error) {

        card.innerHTML = `

            <div class="loading">

                <p>
                    추천을 불러오지 못했어요.
                </p>

                <p class="card-description">
                    ${error.message}
                </p>

            </div>

        `;

        console.error(error);
    }
}


/* ========================= */
/* Show Activity */
/* ========================= */

function showActivity(activity) {

    const cost =
        Number(activity.cost)
            .toLocaleString();


    const duration =
        activity.duration
            ? `${activity.duration}분`
            : "시간 정보 없음";


    /*
     * description/image은
     * 백엔드에 없어도 작동하도록
     * 안전하게 처리한다.
     */

    const description =
        activity.description ||
        "오늘 하루에 가볍게 더해볼 만한 활동이에요.";


    let imageHTML = `

        <div class="card-image">

            <div class="card-image-placeholder">
                ✦
            </div>

        </div>

    `;


    /*
     * 나중에 backend에서
     * image 또는 image_url을
     * 보내면 자동으로 이미지 사용.
     */

    const image =
        activity.image ||
        activity.image_url;


    if (image) {

        imageHTML = `

            <div class="card-image">

                <img
                    src="${image}"
                    alt="${activity.title}"
                >

            </div>

        `;

    }


    card.innerHTML = `

        ${imageHTML}


        <div class="card-content">

            <span class="card-category">
                TODAY
            </span>


            <h2>
                ${activity.title}
            </h2>


            <p class="card-description">
                ${description}
            </p>


            <div class="card-info">

                <span class="info-chip">
                    📍 ${activity.location}
                </span>


                <span class="info-chip">
                    ₩ ${cost}
                </span>


                <span class="info-chip">
                    ⏱ ${duration}
                </span>

            </div>

        </div>

    `;


    card.style.transition =
        "none";


    card.style.transform =
        "translateX(0) rotate(0deg)";


    card.style.opacity =
        "1";


    card.style.cursor =
        "grab";
}


/* ========================= */
/* Drag */
/* ========================= */

function startDrag(event) {

    if (!currentActivity) {
        return;
    }


    isDragging = true;


    startX =
        event.clientX;


    card.style.transition =
        "none";


    card.style.cursor =
        "grabbing";


    card.setPointerCapture(
        event.pointerId
    );
}


function drag(event) {

    if (!isDragging) {
        return;
    }


    currentX =
        event.clientX -
        startX;


    const rotation =
        currentX / 18;


    card.style.transform =
        `translateX(${currentX}px)
         rotate(${rotation}deg)`;
}


function endDrag() {

    if (!isDragging) {
        return;
    }


    isDragging = false;


    card.style.cursor =
        "grab";


    const threshold =
        120;


    if (
        currentX >
        threshold
    ) {

        swipe("like");

    }

    else if (
        currentX <
        -threshold
    ) {

        swipe("dislike");

    }

    else {

        card.style.transition =
            "transform 0.3s ease";


        card.style.transform =
            "translateX(0) rotate(0deg)";
    }


    currentX = 0;
}


/* ========================= */
/* Swipe */
/* ========================= */

function swipe(type) {

    if (!currentActivity) {
        return;
    }


    const direction =
        type === "like"
            ? 1
            : -1;


    if (
        type === "like"
    ) {

        saveActivity(
            currentActivity
        );

    }


    card.style.transition =
        "transform 0.35s ease, opacity 0.35s ease";


    card.style.transform =
        `translateX(${direction * 600}px)
         rotate(${direction * 30}deg)`;


    card.style.opacity =
        "0";


    setTimeout(
        () => {

            getRecommendation();

        },
        350
    );
}


/* ========================= */
/* Saved */
/* ========================= */

function getSaved() {

    return JSON.parse(
        localStorage.getItem(
            "nudge_saved"
        ) || "[]"
    );
}


function saveActivity(
    activity
) {

    const saved =
        getSaved();


    const exists =
        saved.some(
            item =>
                item.id ===
                activity.id
        );


    if (!exists) {

        saved.push(
            activity
        );


        localStorage.setItem(
            "nudge_saved",
            JSON.stringify(saved)
        );

    }
}


function removeSaved(id) {

    const saved =
        getSaved().filter(
            item =>
                item.id !== id
        );


    localStorage.setItem(
        "nudge_saved",
        JSON.stringify(saved)
    );


    renderSaved();
}


function renderSaved() {

    const saved =
        getSaved();


    if (
        saved.length === 0
    ) {

        savedList.innerHTML = `

            <div class="empty">

                아직 저장한 활동이 없어요.<br>
                마음에 드는 활동을 오른쪽으로 넘겨보세요.

            </div>

        `;

        return;
    }


    savedList.innerHTML =
        saved.map(
            activity => `

                <div class="saved-item">

                    <div>

                        <h3>
                            ${activity.title}
                        </h3>

                        <p>
                            📍 ${activity.location}
                            ·
                            ₩ ${Number(
                                activity.cost
                            ).toLocaleString()}원
                        </p>

                    </div>


                    <button
                        class="remove-saved"
                        onclick="removeSaved(${activity.id})"
                    >
                        ×
                    </button>

                </div>

            `
        ).join("");
}


/* ========================= */
/* Pages */
/* ========================= */

function showHome() {

    savedPage.classList.add(
        "hidden"
    );

    myPage.classList.add(
        "hidden"
    );


    homeButton.classList.add(
        "active"
    );

    savedButton.classList.remove(
        "active"
    );

    myButton.classList.remove(
        "active"
    );
}


function showSaved() {

    renderSaved();


    savedPage.classList.remove(
        "hidden"
    );

    myPage.classList.add(
        "hidden"
    );


    homeButton.classList.remove(
        "active"
    );

    savedButton.classList.add(
        "active"
    );

    myButton.classList.remove(
        "active"
    );
}


function showMy() {

    myPage.classList.remove(
        "hidden"
    );

    savedPage.classList.add(
        "hidden"
    );


    homeButton.classList.remove(
        "active"
    );

    savedButton.classList.remove(
        "active"
    );

    myButton.classList.add(
        "active"
    );
}


/* ========================= */
/* Events */
/* ========================= */

locationFilter.addEventListener(
    "click",
    () =>
        openFilter("location")
);


peopleFilter.addEventListener(
    "click",
    () =>
        openFilter("people")
);


categoryFilter.addEventListener(
    "click",
    () =>
        openFilter("category")
);


budgetFilter.addEventListener(
    "click",
    () =>
        openFilter("budget")
);


closeModal.addEventListener(
    "click",
    () => {

        filterModal.classList.add(
            "hidden"
        );

    }
);


filterModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            filterModal
        ) {

            filterModal.classList.add(
                "hidden"
            );

        }

    }
);


savedButton.addEventListener(
    "click",
    showSaved
);


homeButton.addEventListener(
    "click",
    showHome
);


myButton.addEventListener(
    "click",
    showMy
);


closeSaved.addEventListener(
    "click",
    showHome
);


closeMy.addEventListener(
    "click",
    showHome
);


/* ========================= */
/* Card Pointer Events */
/* ========================= */

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


/* ========================= */
/* Start */
/* ========================= */

getRecommendation();