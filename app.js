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

const redisClient = production
  ? redis.createClient({ url: process.env.REDIS_URL })
  : redis.createClient();

redisClient.subscribe('wellnav:messages');

app.get('/redis-test', (req, res, next) => {
  res.send(redisClient.ping());
});


/*
  TODO: I suspect that there's an issue here. I worry this is adding multiple listeners
  every time a connection is made. If we get to the point where we can test 3+ people in
  a single room and we see messages being added multiple times even though only a single
  record is created, I bet this will be the cause. If that happens we'll need to move to some kind of "registry" for our rooms and their emissions.
*/
io.of(/^\/chat-\d*$/).on('connection', function(socket){
  const chatRoom = socket.nsp;
  // chatRoom.emit('hello', `${socket.id} has joined ${chatRoom.name}`);

  redisClient.on('message', function(channel, message){
    socket.emit('new-message', JSON.parse(message));
  });
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
