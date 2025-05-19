const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const players = new Map();

io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

  socket.on('playerJoin', (playerData) => {
    players.set(socket.id, {
      id: socket.id,
      ...playerData
    });
    // Отправляем новому игроку всех существующих
    socket.emit('currentPlayers', Array.from(players.values()));
    // Оповещаем всех остальных о новом игроке
    socket.broadcast.emit('playerJoined', {
      id: socket.id,
      ...playerData
    });
  });

  socket.on('playerMove', (position) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = position.x;
      player.y = position.y;
      io.emit('playerMoved', {
        id: socket.id,
        x: position.x,
        y: position.y
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Игрок отключился:', socket.id);
    players.delete(socket.id);
    io.emit('playerLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});