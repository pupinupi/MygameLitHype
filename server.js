const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', socket => {

  socket.on('join', ({name, room, token})=>{
    socket.join(room);
    socket.room = room;

    if(!rooms[room]){
      rooms[room] = { players: [], turn: 0 };
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
  });

  socket.on('startGame', ()=>{
    if(socket.room){
      io.to(socket.room).emit('startGame');
    }
  });

});

server.listen(3000, ()=>console.log("Server running"));
