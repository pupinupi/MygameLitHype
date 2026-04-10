// 🔊 звуки
const diceSound = new Audio("dice.mp3");
const scandalSound = new Audio("scandal.mp3");

// чуть тише и приятнее
diceSound.volume = 0.7;
scandalSound.volume = 0.8;

const socket = io();

// 📦 данные из лобби
const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
let token = localStorage.getItem("token");

// fallback
if(!token){
  const fallback = ["red","yellow","blue","purple"];
  token = fallback[Math.floor(Math.random()*4)];
}

// подключение
socket.emit("join", { name, room, token });

// 🎮 canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🖼 поле
const img = new Image();
img.src = "board.jpg";

// 👥 игроки
let players = [];

// 🎨 цвета
const colors = {
  red: "#ff3b3b",
  yellow: "#ffd93b",
  blue: "#3bd1ff",
  purple: "#b93bff"
};

const fallbackColors = ["#ff3b3b","#ffd93b","#3bd1ff","#b93bff"];

// 📍 путь (4 вверх, 6 вправо, 4 вниз, 6 влево)
const path = [];

// старт
let x = 120;
let y = 720;

// вверх
for(let i=0;i<4;i++){
  path.push({x,y});
  y -= 80;
}

// вправо
for(let i=0;i<6;i++){
  path.push({x,y});
  x += 80;
}

// вниз
for(let i=0;i<4;i++){
  path.push({x,y});
  y += 80;
}

// влево
for(let i=0;i<6;i++){
  path.push({x,y});
  x -= 80;
}

// 🎨 отрисовка
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  players.forEach((p, i)=>{

    let color = colors[p.token] || fallbackColors[i % 4];

    const pos = path[p.position % path.length] || path[0];

    ctx.shadowColor = color;
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.arc(pos.x + i*10, pos.y, 14, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(p.name, pos.x - 15, pos.y + 25);
  });
}

img.onload = draw;

// 🎲 кнопка
document.getElementById("rollButton").onclick = ()=>{
  socket.emit("rollDice");
};

// 🎲 результат кубика + движение
socket.on("diceResult", data=>{
  document.getElementById("diceBox").innerText = "🎲 " + data.dice;

  const player = players.find(p=>p.id === data.playerId);
  if(player){
    movePlayer(player, data.dice);
  }
});

// 🚶 плавное движение
function movePlayer(player, steps){
  let i = 0;

  function step(){
    if(i >= steps) return;

    player.position++;
    draw();

    i++;
    setTimeout(step, 300);
  }

  step();
}

// 💥 скандал
socket.on("showScandal", card=>{
  const el = document.getElementById("scandalCard");

  el.innerText = card.text;
  el.classList.remove("hidden");

  // 💣 эффект тряски
  document.body.style.transform = "translateX(5px)";
  setTimeout(()=>document.body.style.transform = "translateX(-5px)",100);
  setTimeout(()=>document.body.style.transform = "translateX(0)",200);

  setTimeout(()=>{
    el.classList.add("hidden");
  }, 2500);
});

// ⚡ риск
socket.on("risk", ()=>{
  document.getElementById("riskModal").classList.remove("hidden");
});

document.getElementById("riskRoll").onclick = ()=>{
  socket.emit("riskRoll");
  document.getElementById("riskModal").classList.add("hidden");
};

// 📊 обновление игроков + хайпа
socket.on("players", data=>{
  players = data;

  const me = players.find(p=>p.id === socket.id);

  if(me){
    const percent = (me.hype / 70) * 100;

    document.getElementById("hypeFill").style.width = percent + "%";
    document.getElementById("hypeText").innerText =
      `Хайп: ${me.hype} / 70`;
  }

  draw();
});

// 🏆 победа
socket.on("win", ()=>{
  alert("🔥 ТЫ НАБРАЛ 70 ХАЙПА И ВЫИГРАЛ!");
});
