const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8000;
const redis = require('redis').createClient();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

redis.subscribe('wellnav:messages');

app.get('/redis-test', (req, res, next) => {
  res.send(redis.ping());
});

io.on('connection', function(socket){
  redis.on('message', function(channel, message){
    socket.emit('new-message', JSON.parse(message));
  });
});

if (process.env.NODE_ENV !== 'production') {
  server.listen(port, '0.0.0.0', () => {
    console.log('listening on ', '0.0.0.0:'+port);
  });
} else{
  server.listen(port,()=>{
    console.log('listening on ', port);
  });
}
