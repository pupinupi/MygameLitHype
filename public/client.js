const socket = io();

// 📦 данные
const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
let token = localStorage.getItem("token");

socket.emit("join", { name, room, token });

// 🔊 звуки
const diceSound = new Audio("dice.mp3");
const scandalSound = new Audio("scandal.mp3");

// 🎮 canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🖼 поле
const img = new Image();
img.src = "board.jpg";

// 👥 игроки
let players = [];
let myTurn = false;

// 🎨 цвета
const colors = {
  red:"#ff3b3b",
  yellow:"#ffd93b",
  blue:"#3bd1ff",
  purple:"#b93bff"
};

// 📍 временный путь (потом заменишь координатами)
const path = [];
let x = 120, y = 720;

// вверх
for(let i=0;i<4;i++){ path.push({x,y}); y-=80; }
// вправо
for(let i=0;i<6;i++){ path.push({x,y}); x+=80; }
// вниз
for(let i=0;i<4;i++){ path.push({x,y}); y+=80; }
// влево
for(let i=0;i<6;i++){ path.push({x,y}); x-=80; }

// 📍 режим координат
let coordMode = false;
let points = [];

// 🎨 отрисовка
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0,canvas.width,canvas.height);

  // игроки
  players.forEach((p,i)=>{
    const pos = path[p.position % path.length] || path[0];

    ctx.beginPath();
    ctx.arc(pos.x,pos.y,12,0,Math.PI*2);
    ctx.fillStyle = colors[p.token] || "white";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText(p.name, pos.x-10, pos.y+25);
  });

  // точки координат
  points.forEach((p,i)=>{
  const px = p.x * canvas.width;
  const py = p.y * canvas.height;

  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI*2);
  ctx.fillStyle = "cyan";
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(i, px+10, py-10);
});

img.onload = draw;

// 🎲 кнопка
document.getElementById("rollButton").onclick = ()=>{
  if(!myTurn) return;

  diceSound.currentTime = 0;
  diceSound.play();

  socket.emit("rollDice");
};

// 🎲 результат
socket.on("diceResult", data=>{
  myTurn = false;
  document.getElementById("diceBox").innerText = "🎲 "+data.dice;
});

// 👥 обновление игроков
socket.on("players", data=>{
  players = data;

  const me = players.find(p=>p.id === socket.id);

  if(me){
    const percent = (me.hype / 70)*100;
    document.getElementById("hypeFill").style.width = percent+"%";
    document.getElementById("hypeText").innerText = me.hype + " / 70";
  }

  draw();
});

// 💥 скандал
socket.on("showScandal", card=>{
  scandalSound.play();

  const el = document.getElementById("scandalCard");
  el.innerText = card.text;
  el.classList.remove("hidden");

  setTimeout(()=>el.classList.add("hidden"),2000);
});

// ⚡ риск
socket.on("risk", ()=>{
  document.getElementById("riskModal").classList.remove("hidden");
});

document.getElementById("riskRoll").onclick = ()=>{
  socket.emit("riskRoll");
  document.getElementById("riskModal").classList.add("hidden");
};

// 🎯 ход
socket.on("yourTurn", ()=>{
  myTurn = true;
});

// 🏆 победа
socket.on("win", ()=>{
  alert("🔥 Ты выиграл!");
});


// =========================
// 📍 РЕЖИМ КООРДИНАТ
// =========================

// кнопки (создаём если нет)
const coordBtn = document.createElement("button");
coordBtn.innerText = "📍 Координаты";
document.body.appendChild(coordBtn);

const panel = document.createElement("div");
panel.style.background="#111";
panel.style.padding="10px";
panel.style.margin="10px";
panel.style.display="none";

const pre = document.createElement("pre");

const copyBtn = document.createElement("button");
copyBtn.innerText="📋 копировать";

const clearBtn = document.createElement("button");
clearBtn.innerText="🧹 очистить";

panel.appendChild(copyBtn);
panel.appendChild(clearBtn);
panel.appendChild(pre);

document.body.appendChild(panel);

// включение режима
coordBtn.onclick = ()=>{
  coordMode = !coordMode;
  panel.style.display = coordMode ? "block" : "none";
};

// клик по полю
canvas.addEventListener("click", (e)=>{
  if(!coordMode) return;

  const rect = canvas.getBoundingClientRect();

  // 💡 ВАЖНО: учитываем масштаб
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // переводим в %
  const nx = +(x / canvas.width).toFixed(3);
  const ny = +(y / canvas.height).toFixed(3);

  points.push({x:nx, y:ny});

  console.log("📍", nx, ny);

  updateCoords();
  draw();
});

// вывод
function updateCoords(){
  pre.innerText = JSON.stringify(points, null, 2);
}

// копировать
copyBtn.onclick = ()=>{
  navigator.clipboard.writeText(JSON.stringify(points));
  alert("Скопировано!");
};

// очистка
clearBtn.onclick = ()=>{
  points = [];
  updateCoords();
  draw();
};
