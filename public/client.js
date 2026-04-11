const socket = io();

const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
let token = localStorage.getItem("token");

socket.emit("join", { name, room, token });

// 🎧 звуки
const diceSound = new Audio("dice.mp3");
const scandalSound = new Audio("scandal.mp3");

// 🎮 canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "board.jpg";

let players = [];
let myTurn = false;

// 📍 путь (временно простой)
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

const colors = {
  red:"#ff3b3b",
  yellow:"#ffd93b",
  blue:"#3bd1ff",
  purple:"#b93bff"
};

// 🎨 отрисовка
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0,canvas.width,canvas.height);

  players.forEach((p,i)=>{
    const pos = path[p.position % path.length] || path[0];

    ctx.beginPath();
    ctx.arc(pos.x,pos.y,12,0,Math.PI*2);
    ctx.fillStyle = colors[p.token] || "white";
    ctx.fill();
  });
}

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

// 👥 обновление
socket.on("players", data=>{
  players = data;

  const me = players.find(p=>p.id === socket.id);

  if(me){
    const percent = (me.hype / 70)*100;
    document.getElementById("hypeFill").style.width = percent+"%";
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
