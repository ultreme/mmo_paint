var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/', function(req, res) {
  res.response.redirect('default.html');
});

var usernames = {};

io.sockets.on('connection', function(socket){
  
  socket.on('sendpaint', function(data) {
    io.socket.emit('updatepaint', socket.username, data);
  });

  socket.on('adduser', function(username){
    socket.username = username;
    usernames[username] = username;
    socket.emit('updatepaint', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatepaint', 'SERVER', username + ' has connected.');
    io.sockets.emit('updateusers', usernames);
  });

  socket.on('disconnect', function() {
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatepaint', 'SERVER', socket.username + ' has disconnected');
  });

});

var port = 8080;
server.listen(port);
console.log('Listening on port: ' + port);


