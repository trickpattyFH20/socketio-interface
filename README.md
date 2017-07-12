# socketio-interface
socketio-interface is a web interface and API to monitor / manage socketio connections

## Install
`npm i --save socketio-interface`

## Implement
```
var socketInterface = require('socketio-interface');
socketInterface(io[, config]);
```
## Config
the config argument is optional and supports the following properties:
- port: (Number) Defaults to 13333
- ssl: (Object) Defaults to null
  - key: String
  - cert: String
  - port: Number
  
## Use
The web interface will be hosted at the same domain/host as your socket.io instance on port 13333 (or the port you specify).

If you are working locally, start your socket.io server and then visit http://localhost:13333/sockets/json

## Endpoints

/sockets/total  
/sockets/json  
/sockets/:id  
/sockets/:id/uptime  
  
/rooms/total  
/rooms/json  
  
## Example
this is an example how you could implement socketio-interface on top of the [official socket.io chat example](https://github.com/socketio/chat-example):


```
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var socketInterface = require('socketio-interface')(io);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.join('dicks');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
```

