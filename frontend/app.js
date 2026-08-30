const API_URL="http://127.0.0.1:8000";

const $=id=>document.getElementById(id);

const state={
  filters:{who:null,where:null,mood:null},
  activity:null,
  dragging:false,
  startX:0,
  currentX:0
};

const filterData={
  who:{
    title:"WHO?",
    options:[["ALL",null],["SOLO","solo"],["DUO","duo"],["GROUP","group"]]
  },
  where:{
    title:"WHERE?",
    options:[["ALL",null],["INDOOR","indoor"],["OUTDOOR","outdoor"]]
  },
  mood:{
    title:"MOOD?",
    options:[["ALL",null],["CHILL","chill"],["MODERATE","moderate"],["ACTIVE","active"]]
  }
};

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

function updateFilterLabel(type){
  const value=state.filters[type];
  const selected=filterData[type].options.find(option=>option[1]===value);
  $(`${type}Label`).textContent=selected?selected[0]:"ALL";
  document.querySelector(`[data-filter="${type}"]`).classList.toggle("selected",value!==null);
}

function openFilter(type){
  const data=filterData[type];
  $("filterTitle").textContent=data.title;
  $("filterOptions").innerHTML=data.options.map(([label,value])=>`
    <button class="filter-option ${state.filters[type]===value?"selected":""}"
            data-value="${value??""}">
      ${label}
    </button>
  `).join("");

  $("filterOptions").querySelectorAll(".filter-option").forEach(button=>{
    button.onclick=()=>{
      const raw=button.dataset.value;
      state.filters[type]=raw===""?null:raw;
      updateFilterLabel(type);
      $("filterOverlay").classList.add("hidden");
      getRecommendation();
    };
  });

  $("filterOverlay").classList.remove("hidden");
}

async function getRecommendation(){
  const card=$("nudgeCard");
  card.innerHTML=`
    <div class="loader">
      <div class="spinner"></div>
      <span>Finding your nudge...</span>
    </div>`;

  try{
    const params=new URLSearchParams();

    const who=state.filters.who;
    if(who==="solo")params.set("people","alone");
    if(who==="duo")params.set("people","couple");
    if(who==="group")params.set("people","friend");

    const response=await fetch(`${API_URL}/recommend?${params.toString()}`);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);

    const activity=await response.json();

    if(activity.message){
      card.innerHTML=`<div class="loader"><span>${escapeHtml(activity.message)}</span></div>`;
      state.activity=null;
      return;
    }

    state.activity=activity;
    renderCard(activity);
  }catch(error){
    state.activity=null;
    card.innerHTML=`
      <div class="loader">
        <span>Backend connection failed.</span>
        <small style="color:#555">${escapeHtml(error.message)}</small>
      </div>`;
  }
}

function renderCard(activity){
  const cost=Number(activity.cost||0).toLocaleString();
  const duration=activity.duration?`${activity.duration} min`:"TIME TBD";

  $("nudgeCard").innerHTML=`
    <div class="card-content">
      <span class="category">${escapeHtml(
        String(activity.category||"TODAY").toUpperCase()
      )}</span>

      <h2>${escapeHtml(activity.title||"Your next nudge")}</h2>

      <p class="card-description">
        ${escapeHtml(
          activity.description||"A small activity worth adding to your day."
        )}
      </p>

      <div class="card-chips">
        <span class="chip">📍 ${escapeHtml(activity.location||"Anywhere")}</span>
        <span class="chip">₩ ${cost}</span>
        <span class="chip">⏱ ${duration}</span>
      </div>
    </div>`;

  $("nudgeCard").style.transition="";
  $("nudgeCard").style.transform="translateX(0) rotate(0)";
  $("nudgeCard").style.opacity="1";
}

function getSaved(){
  try{return JSON.parse(localStorage.getItem("nudge_saved")||"[]")}
  catch{return []}
}

function saveActivity(activity){
  if(!activity)return;
  const saved=getSaved();

  if(!saved.some(item=>String(item.id)===String(activity.id))){
    saved.push(activity);
    localStorage.setItem("nudge_saved",JSON.stringify(saved));
  }
}

function swipe(direction){
  if(!state.activity)return;

  if(direction>0)saveActivity(state.activity);

  const card=$("nudgeCard");
  card.style.transition="transform .35s ease, opacity .35s ease";
  card.style.transform=`translateX(${direction*600}px) rotate(${direction*28}deg)`;
  card.style.opacity="0";

  setTimeout(getRecommendation,350);
}

function pointerDown(event){
  if(!state.activity)return;

  state.dragging=true;
  state.startX=event.clientX;
  state.currentX=0;

  $("nudgeCard").style.transition="none";
  $("nudgeCard").style.cursor="grabbing";
  $("nudgeCard").setPointerCapture?.(event.pointerId);
}

function pointerMove(event){
  if(!state.dragging)return;

  state.currentX=event.clientX-state.startX;
  $("nudgeCard").style.transform=
    `translateX(${state.currentX}px) rotate(${state.currentX/18}deg)`;
}

function pointerUp(){
  if(!state.dragging)return;

  const distance=state.currentX;
  state.dragging=false;
  $("nudgeCard").style.cursor="grab";

  if(distance>120)swipe(1);
  else if(distance<-120)swipe(-1);
  else{
    $("nudgeCard").style.transition="transform .25s ease";
    $("nudgeCard").style.transform="translateX(0) rotate(0)";
  }

  state.currentX=0;
}

function openMission(){
  if(!state.activity)return;

  const a=state.activity;

  $("missionContent").innerHTML=`
    <div class="mission-hero">
      <p class="mission-tag">MISSION 01 · TODAY'S NUDGE</p>

      <h1 class="mission-title">${escapeHtml(
        a.title||"Your Nudge"
      )}</h1>

      <p class="mission-description">${escapeHtml(
        a.description||"오늘 하루에 가볍게 더해볼 만한 활동이에요."
      )}</p>

      <div class="mission-meta">
        <span>📍 ${escapeHtml(a.location||"Anywhere")}</span>
        <span>⏱ ${escapeHtml(a.duration||"—")} MIN</span>
      </div>

      <div class="mission-box">
        <div class="label">YOUR INSTRUCTION</div>

        <p>오늘은 고민하지 말고 바로 시작해보세요.</p>

        <div class="mission-steps">
          <div class="mission-step">
            <span class="step-num">1</span>
            <span>준비물을 챙기고 장소로 이동하세요.</span>
          </div>
          <div class="mission-step">
            <span class="step-num">2</span>
            <span>최소 20분 동안 이 활동에 집중해보세요.</span>
          </div>
          <div class="mission-step">
            <span class="step-num">3</span>
            <span>끝난 뒤 오늘의 Nudge를 Collection에 기록하세요.</span>
          </div>
        </div>
      </div>

      <button class="mission-start" id="missionStart">
        START MISSION
      </button>
    </div>`;

  $("missionPage").classList.add("active");

  $("missionStart").onclick=()=>{
    saveActivity(a);
    $("missionStart").textContent="MISSION SAVED ✓";
  };
}

function showPage(page){
  document.querySelectorAll(".screen").forEach(screen=>{
    screen.classList.remove("active");
  });

  $(`${page}Page`).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(button=>{
    button.classList.toggle("active",button.dataset.page===page);
  });

  if(page==="social")renderFriends();
  if(page==="my")renderMy();
  if(page==="saved")renderSaved();
}

function renderFriends(){
  const friends=[
    ["Jin","WEEKEND EXPLORER","82%","J"],
    ["Sora","CITY WALKER","74%","S"],
    ["Min","FIRST NUDGE","61%","M"],
    ["Alex","NIGHT OWL","53%","A"]
  ];

  $("friendsList").innerHTML=friends.map(friend=>`
    <div class="friend">
      <div class="friend-avatar">${friend[3]}</div>
      <div class="friend-main">
        <strong>${friend[0]}</strong>
        <small>${friend[1]}</small>
      </div>
      <div class="friend-rate">
        <strong>${friend[2]}</strong>
        <span>COLLECTED</span>
      </div>
    </div>
  `).join("");
}

function renderSaved(){
  const saved=getSaved();

  $("savedList").innerHTML=saved.length?saved.map(activity=>`
    <div class="saved-item">
      <div>
        <h3>${escapeHtml(activity.title||"Untitled")}</h3>
        <p>${escapeHtml(activity.location||"Anywhere")} · ${escapeHtml(activity.duration||"—")} min</p>
      </div>
      <button class="remove-btn" data-id="${escapeHtml(activity.id)}">×</button>
    </div>
  `).join(""):`
    <div class="loader" style="height:300px">
      <span>No saved nudges yet.</span>
    </div>`;

  $("savedList").querySelectorAll(".remove-btn").forEach(button=>{
    button.onclick=()=>{
      const next=getSaved().filter(
        activity=>String(activity.id)!==String(button.dataset.id)
      );
      localStorage.setItem("nudge_saved",JSON.stringify(next));
      renderSaved();
    };
  });
}

function renderMy(){
  document.querySelectorAll(".menu-row").forEach(row=>{
    row.onclick=()=>openMyPanel(row.dataset.panel);
  });
}

function openMyPanel(type){
  const panel=$("myPanel");
  panel.classList.remove("hidden");

  const content={
    saved:[
      "SAVED",
      "Your saved nudges live here.",
      "Open Saved to review the activities you kept."
    ],
    collection:[
      "COLLECTION",
      "68% complete",
      "Complete more nudges to fill your activity collection."
    ],
    titles:[
      "TITLES",
      "YOUR TITLES",
      "Day Explorer · City Walker · Early Bird · Weekend Mode"
    ],
    theme:[
      "THEME",
      "Choose your Nudge mood.",
      ""
    ]
  }[type];

  panel.innerHTML=`
    <div class="panel-title">${content[0]}</div>
    <p class="panel-note">${content[1]}<br>${content[2]}</p>
    ${type==="theme"?`
      <div class="theme-grid">
        <button class="theme-choice theme-dark active" data-theme="dark"></button>
        <button class="theme-choice theme-lime" data-theme="lime"></button>
        <button class="theme-choice theme-blue" data-theme="blue"></button>
      </div>`:""}`;

  panel.querySelectorAll(".theme-choice").forEach(choice=>{
    choice.onclick=()=>{
      panel.querySelectorAll(".theme-choice").forEach(item=>{
        item.classList.remove("active");
      });
      choice.classList.add("active");
    };
  });
}

document.querySelectorAll(".filter-btn").forEach(button=>{
  button.onclick=()=>openFilter(button.dataset.filter);
});

$("closeFilter").onclick=()=>$("filterOverlay").classList.add("hidden");

$("filterOverlay").onclick=event=>{
  if(event.target===$("filterOverlay")){
    $("filterOverlay").classList.add("hidden");
  }
};

document.querySelectorAll(".nav-btn").forEach(button=>{
  button.onclick=()=>showPage(button.dataset.page);
});

$("closeMission").onclick=()=>{
  $("missionPage").classList.remove("active");
  $("homePage").classList.add("active");
};

$("nudgeCard").addEventListener("pointerdown",pointerDown);
$("nudgeCard").addEventListener("pointermove",pointerMove);
$("nudgeCard").addEventListener("pointerup",pointerUp);
$("nudgeCard").addEventListener("pointercancel",pointerUp);



getRecommendation();

// ===============================
// V2 GESTURE / NAVIGATION FIXES
// ===============================
(function () {
  const back = document.getElementById('backButton');

  function setBackVisible(visible) {
    if (!back) return;
    back.classList.toggle('visible', !!visible);
  }

  if (back) {
    back.addEventListener('click', function () {
      // Return to the main Nudge screen without changing browser history.
      document.querySelectorAll('.mission-view, .detail-view, .expanded-card, [data-view="mission"]')
        .forEach(el => el.classList.remove('active', 'visible', 'open', 'expanded'));
      document.querySelectorAll('.nudge-view, .home-view, [data-view="nudge"]')
        .forEach(el => el.classList.add('active', 'visible'));
      setBackVisible(false);
    });
  }

  // Prevent a card tap from opening the mission. Only completed swipe gestures may do so.
  let startX = null;
  let startY = null;
  let moved = false;

  document.addEventListener('pointerdown', function (e) {
    const card = e.target.closest('.nudge-card, .card');
    if (!card) return;
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
  }, true);

  document.addEventListener('pointermove', function (e) {
    if (startX === null) return;
    if (Math.abs(e.clientX - startX) > 12 || Math.abs(e.clientY - startY) > 12) {
      moved = true;
    }
  }, true);

  document.addEventListener('click', function (e) {
    const card = e.target.closest('.nudge-card, .card');
    if (!card) return;
    if (!moved) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    startX = startY = null;
  }, true);
})();
