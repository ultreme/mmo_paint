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

var users = {};
var usercolors = ["#ff0000", "#00ff00"] //, "#0000ff", "#c49a1b", "#b63bcc", "#3ddbe3", "#f77502"]

io.sockets.on('connection', function(socket){
  
  socket.on('sendpaint', function(data) {
    io.sockets.emit('updatepaint', socket.username, data);
  });

  socket.on('adduser', function(username){
    var user = createUser(username)
    socket.username = username;
    users[username] = createUser(username);
    io.sockets.emit('updateusers', users);
  });

  socket.on('disconnect', function() {
    delete users[socket.username];
    io.sockets.emit('updateusers', users);
  });

});

function createUser(name) {
  return {name: name,
          color: usercolors[Object.keys(users).length % usercolors.length]}  
}

var port = 8080;
server.listen(port);
console.log('Listening on port: ' + port);


