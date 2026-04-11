const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let rooms = {};

const TOKENS = ["red","yellow","blue","purple"];

io.on('connection', socket => {

  socket.on('join', ({name, room, token})=>{
    socket.join(room);
    socket.room = room;

    if(!rooms[room]){
      rooms[room] = { players: [], turn: 0 };
    }

    const game = rooms[room];

    const player = {
      id: socket.id,
      name,
      token,
      hype: 0,
      position: 0,
      skip: false
    };

    game.players.push(player);

    io.to(room).emit('players', game.players);
  });

  socket.on("startGame", ()=>{
    const game = rooms[socket.room];
    if(!game || game.players.length < 1) return;

    io.to(socket.room).emit("startGame");
    io.to(game.players[0].id).emit("yourTurn");
  });

  socket.on("rollDice", ()=>{
    const game = rooms[socket.room];
    if(!game) return;

    const player = game.players[game.turn];
    if(player.id !== socket.id) return;

    if(player.skip){
      player.skip = false;
      nextTurn(game);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    player.position += dice;

    io.to(socket.room).emit("diceResult", {playerId:player.id, dice});

    handleCell(socket.room, game, player);
  });

  socket.on("riskRoll", ()=>{
    const game = rooms[socket.room];
    const player = game.players[game.turn];

    const dice = Math.floor(Math.random()*6)+1;

    if(dice <=3) player.hype -=5;
    else player.hype +=5;

    if(player.hype <0) player.hype=0;

    io.to(socket.room).emit("players", game.players);
    nextTurn(game);
  });

});

function handleCell(room, game, player){
  const cell = player.position % 20;

  if(cell===5){
    const card = getScandal();
    applyScandal(player, game, card);
    io.to(player.id).emit("showScandal", card);
  }
  else if(cell===10){
    io.to(player.id).emit("risk");
    return;
  }
  else if(cell===15){
    player.skip = true;
  }
  else{
    player.hype +=3;
  }

  if(player.hype <0) player.hype=0;

  if(player.hype >=70){
    io.to(player.id).emit("win");
  }

  io.to(room).emit("players", game.players);
  nextTurn(game);
}

function nextTurn(game){
  game.turn = (game.turn+1)%game.players.length;
  io.to(game.players[game.turn].id).emit("yourTurn");
}

function getScandal(){
  const cards = [
    {text:"перегрел аудиторию🔥", hype:-1},
    {text:"громкий заголовок🫣", hype:-2},
    {text:"это монтаж 😱", hype:-3},
    {text:"меня взломали #️⃣", hype:-3, all:true},
    {text:"подписчики в шоке 😮", hype:-4},
    {text:"удаляй пока не поздно🤫", hype:-5},
    {text:"это контент🙄", hype:-5, skip:true}
  ];
  return cards[Math.floor(Math.random()*cards.length)];
}

function applyScandal(player, game, card){
  if(card.all){
    game.players.forEach(p=>{
      p.hype += card.hype;
      if(p.hype<0)p.hype=0;
    });
  } else {
    player.hype += card.hype;
  }
  if(card.skip) player.skip=true;
}

server.listen(3000, ()=>console.log("🔥 Server running"));
