const socket = io();

const rollBtn = document.getElementById("rollBtn");
const diceText = document.getElementById("diceText");
const tokensDiv = document.getElementById("tokens");
const topUI = document.getElementById("topUI");

const modal = document.getElementById("modal");
const winScreen = document.getElementById("winScreen");

const diceSound = document.getElementById("diceSound");
const scandalSound = document.getElementById("scandalSound");

const cells = [
  {x:140,y:760},{x:140,y:620},{x:140,y:500},{x:140,y:380},
  {x:300,y:330},{x:450,y:330},{x:600,y:330},{x:750,y:330},{x:900,y:330},{x:1000,y:330},
  {x:1000,y:500},{x:1000,y:650},{x:1000,y:800},
  {x:850,y:820},{x:700,y:820},{x:550,y:820},{x:400,y:820},{x:250,y:820},{x:140,y:820}
];

rollBtn.onclick = ()=>{
  diceSound.play();
  socket.emit("rollDice");
};

socket.on("dice", n=>{
  diceText.innerText = "Выпало: " + n;
});

socket.on("update", game=>{
  drawPlayers(game.players);
  drawHype(game.players);

  const current = game.players[game.turn];
  rollBtn.disabled = current.id !== socket.id;
});

function getScale(){
  const board = document.querySelector(".board");
  return board.clientWidth / 1024;
}

function drawPlayers(players){
  tokensDiv.innerHTML = "";

  const scale = getScale();

  players.forEach((p,i)=>{
    const el = document.createElement("div");
    el.className = "token " + p.token;

    const pos = cells[p.position];

    el.style.left = (pos.x * scale + i*8) + "px";
    el.style.top = (pos.y * scale + i*8) + "px";

    tokensDiv.appendChild(el);
  });
}

function drawHype(players){
  topUI.innerHTML = "";

  players.forEach(p=>{
    const div = document.createElement("div");

    div.innerHTML = `
      <div>${p.name} (${p.hype})</div>
      <div class="bar">
        <div class="fill" style="width:${(p.hype/70)*100}%"></div>
      </div>
    `;

    topUI.appendChild(div);
  });
}

socket.on("scandal", i=>{
  scandalSound.play();

  modal.innerHTML = `<div class="card">Скандал!</div>`;
  modal.classList.remove("hidden");

  setTimeout(()=>modal.classList.add("hidden"),3000);
});

socket.on("risk", roll=>{
  modal.innerHTML = `<div class="card">Риск: ${roll}</div>`;
  modal.classList.remove("hidden");

  setTimeout(()=>modal.classList.add("hidden"),3000);
});

socket.on("win", player=>{
  winScreen.innerHTML = `🏆 ${player.name} победил!`;
  winScreen.classList.remove("hidden");
});

const board = document.querySelector(".board");

board.addEventListener("click", (e)=>{
  const rect = board.getBoundingClientRect();

  const scale = board.clientWidth / 1024;

  const x = Math.round((e.clientX - rect.left) / scale);
  const y = Math.round((e.clientY - rect.top) / scale);

  console.log(`{x:${x}, y:${y}},`);
});
