const express  = require('express');
const http     = require('http');
const socketio = require('socket.io');
const redis    = require('redis');

const port = process.env.PORT || 8000;
const production = process.env.NODE_ENV === 'production';
const app = express();
const server = http.Server(app);
const io = socketio(server);

if (!production) {
  require('dotenv').config();
}
const rooms = {};

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.subscribe('wellnav:messages');
redisClient.on('message', (channel, messageData) => {
  const message = JSON.parse(messageData);
  const namespaceName = `chat-${message.chat_id}`;
  io.of(namespaceName).emit('new-message', message);
});

io.of(/^\/chat-\d*$/).on('connection', socket => {
  // const namespace = socket.nsp;
  // const namespaceName = namespace.name; // includes leading slash
  // rooms[namespaceName] = namespace;
  // console.log(rooms);
  // TODO: add custom socket event handlers here.
  // socket.on('disconnect', function(){
  //   if(!Object.keys(namespace.connected).length) delete rooms[namespaceName];
  //   console.log(rooms)
  // })
});

if (!production) {
  server.listen(port, '0.0.0.0', () => {
    console.log('listening on ', '0.0.0.0:' + port);
  });
} else{
  server.listen(port, () => {
    console.log('listening on ', port);
  });
}
