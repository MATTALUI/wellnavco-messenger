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

io.on('connection', function(socket){
  redisClient.on('message', function(channel, message){
    socket.emit('new-message', JSON.parse(message));
  });
});

if (process.env.NODE_ENV !== 'production') {
  server.listen(port, '0.0.0.0', () => {
    console.log('listening on ', '0.0.0.0:' + port);
  });
} else{
  server.listen(port,()=>{
    console.log('listening on ', port);
  });
}
