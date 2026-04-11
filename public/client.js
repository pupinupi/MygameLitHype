const socket = io();

const diceSound = new Audio("dice.mp3");
const scandalSound = new Audio("scandal.mp3");

let players = [];
let myTurn = false;

document.getElementById("rollButton").onclick = ()=>{
  if(!myTurn) return;
  diceSound.play();
  socket.emit("rollDice");
};

document.getElementById("riskRoll").onclick = ()=>{
  socket.emit("riskRoll");
};

socket.on("yourTurn", ()=>{
  myTurn = true;
});

socket.on("diceResult", data=>{
  myTurn = false;
  document.getElementById("diceBox").innerText = data.dice;
});

socket.on("players", data=>{
  players = data;
});

socket.on("showScandal", card=>{
  scandalSound.play();
  const el = document.getElementById("scandalCard");
  el.innerText = card.text;
  el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"),2000);
});

socket.on("risk", ()=>{
  document.getElementById("riskModal").classList.remove("hidden");
});

socket.on("win", ()=>{
  alert("Ты выиграл!");
});
