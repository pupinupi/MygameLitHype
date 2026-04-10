const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let rooms = {};

// 🎨 доступные фишки
const TOKENS = ["red","yellow","blue","purple"];

io.on('connection', socket => {

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

    // 💣 убираем уже занятые цвета
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

});
