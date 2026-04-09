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
  hype.innerHTML = "";

  players.forEach(p=>{
    const wrap = document.createElement("div");

    wrap.innerHTML = `
      <div>${p.name} (${p.hype})</div>
      <div class="hypeBar">
        <div class="hypeFill" style="width:${Math.min(p.hype,70)/70*100}%"></div>
      </div>
    `;

    hype.appendChild(wrap);
  });
}

socket.on('scandal', i=>{
  scandalSound.play();

  const texts = [
    "🔥 перегрел аудиторию (-1 хайп)",
    "🫣 громкий заголовок (-2 хайп)",
    "😱 это монтаж (-3 хайп)",
    "#️⃣ взломали канал (-3 хайп всем)",
    "😮 подписчики в шоке (-4 хайп)",
    "🤫 удаляй пока не поздно (-5 хайп)",
    "🙄 контент не зашел (-5 хайп + пропуск хода)"
  ];

  modal.innerHTML = `<div class="card">${texts[i]}</div>`;
  modal.classList.remove('hidden');

  setTimeout(()=>{
    modal.classList.add('hidden');
  },3000);
});

  modal.innerHTML = `<div class="card">${texts[i]}</div>`;
  modal.classList.remove('hidden');

  setTimeout(()=>modal.classList.add('hidden'),3000);
});

socket.on('risk', roll=>{
  const result = roll <=3 ? "-5 хайпа 😬" : "+5 хайпа 🚀";

  modal.innerHTML = `
    <div class="card">
      🎲 РИСК! <br><br>
      Выпало: ${roll} <br>
      ${result}
    </div>
  `;

  modal.classList.remove('hidden');
  setTimeout(()=>modal.classList.add('hidden'),3000);
});

socket.on('win', player=>{
  winScreen.innerHTML = `
    🏆 ${player.name} <br>
    ДОСТИГ ${player.hype} ХАЙПА 🔥
  `;
  winScreen.classList.remove('hidden');
});

socket.on('update', game=>{
  const myId = socket.id;
  const current = game.players[game.turn];

  roll.disabled = current.id !== myId;

  drawPlayers(game.players);
  updateHype(game.players);
});
