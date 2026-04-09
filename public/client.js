const socket = io();

// Canvas и контекст
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Кнопка броска кубика
const rollButton = document.getElementById("rollButton");

// Изображение поля
const boardImg = new Image();
boardImg.src = 'board.jpg';

// Массив координат клеток (20 клеток)
const cells = [
  {x: 50, y: 700}, {x: 150, y: 700}, {x: 250, y: 700}, {x: 350, y: 700}, {x: 450, y: 700},
  {x: 550, y: 700}, {x: 650, y: 700}, {x: 750, y: 700}, {x: 750, y: 600}, {x: 750, y: 500},
  {x: 750, y: 400}, {x: 750, y: 300}, {x: 650, y: 300}, {x: 550, y: 300}, {x: 450, y: 300},
  {x: 350, y: 300}, {x: 250, y: 300}, {x: 150, y: 300}, {x: 50, y: 300}, {x: 50, y: 400}
];

// Игроки
let players = [];
let currentTurn = 0;

// Загрузка фишек
const tokenColors = {
  red: 'red',
  yellow: 'yellow',
  blue: 'blue',
  purple: 'purple'
};

// Функция отрисовки
function drawGame(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(boardImg, 0, 0, canvas.width, canvas.height);

  // Отрисовка фишек
  players.forEach((p, idx)=>{
    const cell = cells[p.position];
    ctx.fillStyle = tokenColors[p.token] || 'white';
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, 20, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
  });

  // Шкалы хайпа
  updateHypeBars();
}

// Шкалы хайпа
function updateHypeBars(){
  const container = document.getElementById("hype-bars");
  container.innerHTML = '';
  players.forEach(p=>{
    const bar = document.createElement('div');
    bar.style.margin = '5px';
    bar.style.width = '200px';
    bar.style.height = '20px';
    bar.style.background = '#333';
    bar.style.border = '2px solid #fff';
    const fill = document.createElement('div');
    fill.style.width = Math.min(p.hype,70)/70*100 + '%';
    fill.style.height = '100%';
    fill.style.background = tokenColors[p.token] || 'white';
    bar.appendChild(fill);
    container.appendChild(bar);
  });
}

// Обновление состояния игроков с сервера
socket.on('update', game=>{
  players = game.players;
  currentTurn = game.turn;
  drawGame();
});

// После броска кубика показываем roll
socket.on('dice', roll=>{
  console.log('Кубик:', roll);
});

// Победа
socket.on('win', player=>{
  alert(`${player.name} победил!`);
});

// Кнопка броска кубика
rollButton.addEventListener('click', ()=>{
  const myPlayer = players.find(p=>p.id === socket.id);
  if(!myPlayer) return;
  if(currentTurn !== players.indexOf(myPlayer)) return alert("Сейчас ход другого игрока!");
  socket.emit('rollDice', 'room1');
});

// Отрисовка после загрузки поля
boardImg.onload = drawGame;

// Подключение к комнате
const name = prompt("Введите имя");
const token = prompt("Выберите цвет фишки (red, yellow, blue, purple)");
socket.emit('join', {name, room: 'room1', token});
