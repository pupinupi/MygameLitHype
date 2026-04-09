const socket = io();

const rollBtn = document.getElementById("rollBtn");
const diceText = document.getElementById("diceText");
const tokensDiv = document.getElementById("tokens");
const topUI = document.getElementById("topUI");

const modal = document.getElementById("modal");
const winScreen = document.getElementById("winScreen");

const diceSound = document.getElementById("diceSound");
const scandalSound = document.getElementById("scandalSound");

const room = localStorage.getItem("room");

// 📍 координаты по твоему полю
const cells = [
  {x:140,y:760},{x:140,y:620},{x:140,y:500},{x:140,y:380},
  {x:300,y:330},{x:450,y:330},{x:600,y:330},{x:750,y:330},{x:900,y:330},{x:1050,y:330},
  {x:1050,y:480},{x:1050,y:620},{x:1050,y:760},
  {x:900,y:800},{x:750,y:800},{x:600,y:800},{x:450,y:800},{x:300,y:800},{x:140,y:800}
];

// 🎲 бросок
rollBtn.onclick = ()=>{
  diceSound.play();
  socket.emit("rollDice");
};

// 🎲 результат
socket.on("dice", n=>{
  diceText.innerText = "Выпало: " + n;
});

// 🔄 обновление игры
socket.on("update", game=>{
  drawPlayers(game.players);
  drawHype(game.players);

  const me = socket.id;
  const current = game.players[game.turn];

  rollBtn.disabled = current.id !== me;
});

// 🎯 рисуем фишки
function drawPlayers(players){
  tokensDiv.innerHTML = "";

  players.forEach((p,i)=>{
    const el = document.createElement("div");
    el.className = "token " + p.token;

    const pos = cells[p.position];

    el.style.left = (pos.x + i*10) + "px";
    el.style.top = (pos.y + i*10) + "px";

    tokensDiv.appendChild(el);
  });
}

// 🔥 шкала хайпа
function drawHype(players){
  topUI.innerHTML = "";

  players.forEach(p=>{
    const div = document.createElement("div");

    div.innerHTML = `
      <div class="name">${p.name} (${p.hype})</div>
      <div class="bar">
        <div class="fill" style="width:${(p.hype/70)*100}%"></div>
      </div>
    `;

    topUI.appendChild(div);
  });
}

// 💥 скандал
socket.on("scandal", i=>{
  scandalSound.play();

  const texts = [
    "🔥 перегрел аудиторию (-1)",
    "🫣 громкий заголовок (-2)",
    "😱 это монтаж (-3)",
    "#️⃣ взлом (-3 всем)",
    "😮 в шоке (-4)",
    "🤫 удаляй (-5)",
    "🙄 контент (-5 + пропуск)"
  ];

  modal.innerHTML = `<div class="card">${texts[i]}</div>`;
  modal.classList.remove("hidden");

  setTimeout(()=>modal.classList.add("hidden"),3000);
});

// ⚠️ риск
socket.on("risk", roll=>{
  modal.innerHTML = `<div class="card">Риск! 🎲 ${roll}</div>`;
  modal.classList.remove("hidden");

  setTimeout(()=>modal.classList.add("hidden"),3000);
});

// 🏆 победа
socket.on("win", player=>{
  winScreen.innerHTML = `🏆 ${player.name} победил! (${player.hype})`;
  winScreen.classList.remove("hidden");
});
