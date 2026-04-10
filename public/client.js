const socket = io();

// получаем данные из лобби
const name = localStorage.getItem("name");
const room = localStorage.getItem("room");
const token = localStorage.getItem("token");

// подключаемся
socket.emit("join", {name, room, token});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "board.jpg";

// 📍 координаты СТАРТА (пока все стоят здесь)
const startCell = {x: 100, y: 700};

let players = [];

// 🎨 цвета фишек
const colors = {
  red: "red",
  yellow: "yellow",
  blue: "cyan",
  purple: "purple"
};

// 🧠 отрисовка
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  players.forEach((p, i)=>{
    ctx.beginPath();
    ctx.fillStyle = colors[p.token] || "white";

    // чтобы не накладывались
    ctx.arc(startCell.x + i*25, startCell.y, 15, 0, Math.PI*2);

    ctx.fill();

    // подпись имени
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(p.name, startCell.x + i*25 - 15, startCell.y + 30);
  });
}

// загрузка поля
img.onload = draw;

// получаем игроков
socket.on("players", data=>{
  players = data;
  draw();
});
