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
  {x:90,y:600}, {x:90,y:500}, {x:90,y:400}, {x:90,y:300}, {x:90,y:200},
  {x:200,y:150}, {x:320,y:140}, {x:450,y:140}, {x:580,y:140}, {x:720,y:140}, {x:860,y:150},
  {x:900,y:260}, {x:900,y:380}, {x:900,y:500}, {x:900,y:600},
  {x:780,y:650}, {x:650,y:660}, {x:520,y:660}, {x:380,y:650}, {x:250,y:640}
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
