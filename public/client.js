const socket = io();

// 💥 берём данные из лобби
const name = localStorage.getItem("name");
const token = localStorage.getItem("token");
const room = localStorage.getItem("room");

// 💥 ПОВТОРНО ПОДКЛЮЧАЕМСЯ (ВАЖНО)
socket.emit("join", {name, room, token});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const rollButton = document.getElementById("rollButton");
const hypeBars = document.getElementById("hype-bars");

const boardImg = new Image();
boardImg.src = 'board.jpg';

// 📍 координаты
const cells = [
  {x:80,y:720},{x:200,y:720},{x:320,y:720},{x:450,y:720},{x:580,y:720},
  {x:700,y:720},{x:820,y:720},{x:900,y:650},{x:900,y:520},{x:900,y:390},
  {x:900,y:260},{x:820,y:180},{x:700,y:150},{x:580,y:150},{x:450,y:150},
  {x:320,y:150},{x:200,y:150},{x:100,y:220},{x:100,y:350},{x:100,y:500}
];

let players = [];
let currentTurn = 0;

// 🎨 цвета
const colors = {
  red: "red",
  yellow: "yellow",
  blue: "cyan",
  purple: "purple"
};

// 🎮 рисуем
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(boardImg,0,0,canvas.width,canvas.height);

  players.forEach((p,i)=>{
    const pos = cells[p.position];

    ctx.beginPath();
    ctx.fillStyle = colors[p.token] || "white";
    ctx.arc(pos.x + i*10, pos.y + i*10, 15, 0, Math.PI*2);
    ctx.fill();
  });

  drawHype();
}

// 🔥 хайп
function drawHype(){
  hypeBars.innerHTML = "";

  players.forEach(p=>{
    const div = document.createElement("div");

    div.innerHTML = `
      <div>${p.name}: ${p.hype}</div>
      <div style="width:200px;height:10px;background:#333;">
        <div style="width:${(p.hype/70)*100}%;height:10px;background:cyan;"></div>
      </div>
    `;

    hypeBars.appendChild(div);
  });
}

// 🔄 обновление
socket.on("update", game=>{
  players = game.players;
  currentTurn = game.turn;
  draw();
});

socket.on("skipNotice", ()=>{
  showSkip();
});

// 🎲 кубик
rollButton.onclick = ()=>{
  socket.emit("rollDice");
};

socket.on("dice", roll=>{
  console.log("Выпало:", roll);
});

// 🏆 победа
socket.on("win", player=>{
  alert(`🏆 ${player.name} победил!`);
});

boardImg.onload = draw;

const overlay = document.getElementById("overlay");

// 🔥 СКАНДАЛ
socket.on("scandal", i=>{
  const texts = [
    "🔥 Перегрел аудиторию (-1)",
    "🫣 Громкий заголовок (-2)",
    "😱 Это монтаж (-3)",
    "#️⃣ Взломали (-3 всем)",
    "😮 Подписчики в шоке (-4)",
    "🤫 Удаляй пока не поздно (-5)",
    "🙄 Это контент (-5 + пропуск)"
  ];

  showCard(texts[i], "scandal");
});

// 🎲 РИСК
socket.on("risk", roll=>{
  const text = roll <=3 ? "−5 хайпа 😬" : "+5 хайпа 🚀";

  showCard(`
    🎲 РИСК<br><br>
    Выпало: ${roll}<br>
    ${text}
  `, "risk");
});

// ⚖️ ПРОПУСК ХОДА
function showSkip(){
  showCard("⛔ Пропуск хода", "skip");
}

// 💥 ОБЩАЯ ФУНКЦИЯ
function showCard(text, type){
  overlay.innerHTML = `<div class="card ${type}">${text}</div>`;
  overlay.classList.remove("hidden");

  setTimeout(()=>{
    overlay.classList.add("hidden");
  },2500);
}
