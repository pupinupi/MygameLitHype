const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let rooms = {};

const TOKENS = ["red","yellow","blue","purple"];

io.on('connection', socket => {

  // 🔗 ВХОД В КОМНАТУ
  socket.on('join', ({name, room, token})=>{
    socket.join(room);
    socket.room = room;

    if(!rooms[room]){
      rooms[room] = {
        players: [],
        turn: 0
      };
    }

    const game = rooms[room];

    const used = game.players.map(p=>p.token);

    let finalToken = token;

    if(!finalToken || used.includes(finalToken)){
      finalToken = TOKENS.find(t => !used.includes(t)) || "white";
    }

    const player = {
      id: socket.id,
      name,
      token: finalToken,
      hype: 0,
      position: 0,
      skip: false
    };

    game.players.push(player);

    io.to(room).emit('players', game.players);
  });

  // 🚀 СТАРТ ИГРЫ
  socket.on("startGame", ()=>{
    const room = socket.room;
    if(!rooms[room]) return;

    if(rooms[room].players.length < 2) return;

    // первый ход первому игроку
    const game = rooms[room];
    io.to(room).emit("startGame");

    io.to(game.players[game.turn].id).emit("yourTurn");
  });

  // 🎲 БРОСОК КУБИКА
  socket.on("rollDice", ()=>{
    const game = rooms[socket.room];
    if(!game) return;

    const player = game.players[game.turn];
    if(!player || player.id !== socket.id) return;

    // ⛔ пропуск хода
    if(player.skip){
      player.skip = false;
      nextTurn(game);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;

    player.position += dice;

    io.to(socket.room).emit("diceResult", {
      playerId: player.id,
      dice
    });

    handleCell(socket.room, game, player);
  });

  // ⚡ РИСК
  socket.on("riskRoll", ()=>{
    const game = rooms[socket.room];
    if(!game) return;

    const player = game.players[game.turn];
    if(!player || player.id !== socket.id) return;

    const dice = Math.floor(Math.random()*6)+1;

    if(dice <= 3){
      player.hype -= 5;
    } else {
      player.hype += 5;
    }

    if(player.hype < 0) player.hype = 0;

    io.to(socket.room).emit("players", game.players);

    nextTurn(game);
  });

});


// 📍 ОБРАБОТКА КЛЕТКИ
function handleCell(room, game, player){

  const cell = player.position % 20;

  // 💥 СКАНДАЛ
  if(cell === 5){
    const card = getScandal();
    applyScandal(player, game, card);

    io.to(player.id).emit("showScandal", card);
  }

  // ⚡ РИСК
  else if(cell === 10){
    io.to(player.id).emit("risk");
    return; // ждём риск
  }

  // ⚖ СУД
  else if(cell === 15){
    player.skip = true;
  }

  // ➕ обычная клетка
  else{
    player.hype += 3;
  }

  if(player.hype < 0) player.hype = 0;

  checkWin(player);

  io.to(room).emit("players", game.players);

  nextTurn(game);
}


// 🔄 СМЕНА ХОДА
function nextTurn(game){
  game.turn = (game.turn + 1) % game.players.length;

  const nextPlayer = game.players[game.turn];

  io.to(nextPlayer.id).emit("yourTurn");
}


// 🏆 ПОБЕДА
function checkWin(player){
  if(player.hype >= 70){
    io.to(player.id).emit("win");
  }
}


// 💥 СКАНДАЛЫ
function getScandal(){
  const cards = [
    {text:"перегрел аудиторию🔥", hype:-1},
    {text:"громкий заголовок🫣", hype:-2},
    {text:"это монтаж 😱", hype:-3},
    {text:"меня взломали #️⃣", hype:-3, all:true},
    {text:"подписчики в шоке 😮", hype:-4},
    {text:"удаляй пока не поздно🤫", hype:-5},
    {text:"это контент, вы не понимаете🙄", hype:-5, skip:true}
  ];
  return cards[Math.floor(Math.random()*cards.length)];
}


// применение скандала
function applyScandal(player, game, card){

  if(card.all){
    game.players.forEach(p=>{
      p.hype += card.hype;
      if(p.hype < 0) p.hype = 0;
    });
  } else {
    player.hype += card.hype;
    if(player.hype < 0) player.hype = 0;
  }

  if(card.skip){
    player.skip = true;
  }
}


// 🚀 запуск сервера
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
