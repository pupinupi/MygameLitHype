const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', socket => {

  socket.on('join', ({name, room, token})=>{
    socket.join(room);

    if(!rooms[room]){
      rooms[room] = {
        players: [],
        turn: 0
      };
    }

    const player = {
      id: socket.id,
      name,
      token,
      hype: 0,
      position: 0,
      skip: false
    };

    rooms[room].players.push(player);

    io.to(room).emit('players', rooms[room].players);

    if(rooms[room].players.length >= 2){
      io.to(room).emit('startGame');
    }
  });

  socket.on('rollDice', room=>{
    const game = rooms[room];
    const player = game.players[game.turn];

    if(player.id !== socket.id) return;

    if(player.skip){
      player.skip = false;
      game.turn = (game.turn + 1) % game.players.length;
      io.to(room).emit('update', game);
      return;
    }

    const roll = Math.floor(Math.random()*6)+1;
    player.position = (player.position + roll) % 20;

    handleCell(game, player);

    if(player.hype >= 70){
      io.to(room).emit('win', player);
      return;
    }

    game.turn = (game.turn + 1) % game.players.length;

    io.to(room).emit('dice', roll);
    io.to(room).emit('update', game);
  });

});

function handleCell(game, player){
  const cells = [
    "start","+1","+2","scandal","+2","risk","+2","scandal","+3","+5","-8","-15skip","+3","risk","+3","skip","+2","scandal","+8","-10","+4"
  ];

  const cell = cells[player.position];

  if(cell.includes("+")){
    player.hype += parseInt(cell);
  }

  if(cell.includes("-")){
    player.hype += parseInt(cell);
  }

  if(cell === "scandal"){
    const rand = Math.floor(Math.random()*7);

    const effects = [
      -1,-2,-3,"all-3",-4,-5,"-5skip"
    ];

    const e = effects[rand];

    if(e === "all-3"){
      game.players.forEach(p=>p.hype -=3);
    } else if(e === "-5skip"){
      player.hype -=5;
      player.skip = true;
    } else {
      player.hype += e;
    }

    io.to(player.id).emit('scandal', rand);
  }

  if(cell === "risk"){
    const roll = Math.floor(Math.random()*6)+1;
    if(roll <=3){
      player.hype -=5;
    } else {
      player.hype +=5;
    }
    io.to(player.id).emit('risk', roll);
  }

  if(cell === "skip"){
    player.skip = true;
  }

  if(player.hype < 0) player.hype = 0;
}

server.listen(3000, ()=>console.log("Server running"));
