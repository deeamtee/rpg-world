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

  // Добавляем поле scene для каждого игрока
  socket.on('playerJoin', (playerData) => {
    players.set(socket.id, {
      id: socket.id,
      ...playerData,
      scene: playerData.scene || 'ElwynnForestScene',
    });
    // Отправляем только игроков из той же сцены
    const sameScenePlayers = Array.from(players.values()).filter(p => p.scene === players.get(socket.id).scene && p.id !== socket.id);
    socket.emit('currentPlayers', sameScenePlayers);
    // Оповещаем только игроков из той же сцены
    for (const [id, p] of players.entries()) {
      if (id !== socket.id && p.scene === players.get(socket.id).scene) {
        io.to(id).emit('playerJoined', {
          id: socket.id,
          ...playerData
        });
      }
    }
  });

  // Логика смены сцены игрока
  socket.on('changeScene', (sceneName) => {
    const player = players.get(socket.id);
    if (player) {
      // Оповестить старую сцену, что игрок ушёл
      for (const [id, p] of players.entries()) {
        if (id !== socket.id && p.scene === player.scene) {
          io.to(id).emit('playerLeft', socket.id);
        }
      }
      // Обновить сцену игрока
      player.scene = sceneName;
      // Оповестить новую сцену, что игрок пришёл
      for (const [id, p] of players.entries()) {
        if (id !== socket.id && p.scene === sceneName) {
          io.to(id).emit('playerJoined', player);
        }
      }
      // Отправить игроку список игроков новой сцены
      const sameScenePlayers = Array.from(players.values()).filter(p => p.scene === sceneName && p.id !== socket.id);
      socket.emit('currentPlayers', sameScenePlayers);
    }
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