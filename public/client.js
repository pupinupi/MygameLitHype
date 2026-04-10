const socket = io();

// 📦 данные из лобби
const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
let token = localStorage.getItem("token");

// 🛑 если вдруг token сломался — задаём по умолчанию
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

// 📍 старт
const startCell = { x: 120, y: 720 };

// 👥 игроки
let players = [];

// 🎨 цвета
const colors = {
  red: "#ff3b3b",
  yellow: "#ffd93b",
  blue: "#3bd1ff",
  purple: "#b93bff"
};

// 💥 если токен вдруг кривой — даём цвет по индексу
const fallbackColors = ["#ff3b3b","#ffd93b","#3bd1ff","#b93bff"];

// 🎨 отрисовка
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  players.forEach((p, i)=>{

    let color = colors[p.token];

    // если токен сломан — даём цвет по порядку
    if(!color){
      color = fallbackColors[i % fallbackColors.length];
    }

    // 💡 свечение
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.arc(startCell.x + i*35, startCell.y, 16, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.shadowBlur = 0;

    // имя
    ctx.fillStyle = "white";
    ctx.font = "13px Arial";
    ctx.fillText(p.name, startCell.x + i*35 - 15, startCell.y + 35);
  });
}

// загрузка поля
img.onload = draw;

// обновление игроков
socket.on("players", data=>{
  players = data;
  draw();
});
