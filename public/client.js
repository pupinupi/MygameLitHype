const socket = io();

const room = localStorage.getItem('room');

const cells = [
  {x:120,y:820},{x:120,y:700},{x:120,y:580},{x:120,y:460},
  {x:250,y:420},{x:400,y:420},{x:550,y:420},{x:700,y:420},{x:850,y:420},{x:1000,y:420},
  {x:1000,y:550},{x:1000,y:680},{x:1000,y:810},{x:850,y:850},
  {x:700,y:850},{x:550,y:850},{x:400,y:850},{x:250,y:850},{x:120,y:850}
];

roll.onclick = ()=>{
  diceSound.play();
  socket.emit('rollDice', room);
};

socket.on('dice', n=>{
  diceText.innerText = "Выпало: " + n;
});

socket.on('update', game=>{
  drawPlayers(game.players);
  updateHype(game.players);
});

function drawPlayers(players){
  tokens.innerHTML = "";
  players.forEach((p,i)=>{
    const el = document.createElement("div");
    el.className = "token " + p.token;

    const pos = cells[p.position];

    el.style.left = pos.x + i*10 + "px";
    el.style.top = pos.y + i*10 + "px";

    tokens.appendChild(el);
  });
}

function updateHype(players){
  hype.innerHTML = players.map(p=>`${p.name}: ${p.hype}`).join("<br>");
}

socket.on('scandal', i=>{
  scandalSound.play();

  const texts = [
    "перегрел аудиторию🔥",
    "громкий заголовок🫣",
    "это монтаж😱",
    "меня взломали#️⃣",
    "подписчики в шоке😮",
    "удаляй пока не поздно🤫",
    "это контент🙄"
  ];

  modal.innerHTML = `<div class="card">${texts[i]}</div>`;
  modal.classList.remove('hidden');

  setTimeout(()=>modal.classList.add('hidden'),3000);
});

socket.on('risk', roll=>{
  modal.innerHTML = `<div class="card">Риск! Выпало ${roll}</div>`;
  modal.classList.remove('hidden');
  setTimeout(()=>modal.classList.add('hidden'),3000);
});

socket.on('win', player=>{
  winScreen.innerHTML = `🏆 Победил ${player.name} (${player.hype} хайпа)`;
  winScreen.classList.remove('hidden');
});
