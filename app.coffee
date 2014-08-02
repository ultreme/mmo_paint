#!/usr/bin/env coffee

express =   require('express')
http =      require('http')
socket_io = require('socket.io')

app = express()
server = http.createServer(app)
io = socket_io.listen(server);

app.use express.static "#{__dirname}/public"

app.get '/', (req, res) ->
  res.sendfile "#{__dirname}/public/index.html"

app.get '/', (req, res) ->
  res.response.redirect 'default.html'

users = {}
usercolors = ["#ff0000", "#00ff00", "#0000ff", "#c49a1b", "#b63bcc", "#3ddbe3", "#f77502"]
colorindex = 0
drawhistory = []


io.sockets.on 'connection', (socket) ->

  socket.on 'sendpaint', (data) ->
    socket.broadcast.emit 'updatepaint', data, users[socket.username].color
    drawhistory.push
      username: socket.username
      data: data

  socket.on 'adduser', (username) ->
    if users[username]
      socket.emit 'retryusername', username
      return
    user = createUser username
    socket.username = username
    users[username] = user
    socket.emit 'setuser', user
    io.sockets.emit 'updateusers', users
    for i in [0...drawhistory.length]
      socket.emit 'updatepaint', drawhistory[i].data, users[drawhistory[i].username].color

  socket.on 'disconnect', ->
    socket.broadcast.emit 'clearpaint'
    temphistory = []
    for i in [0...drawhistory.length]
      unless drawhistory[i].username == socket.username
        temphistory.push drawhistory[i]
    drawhistory = temphistory;
    for i in [0...drawhistory.length]
      socket.broadcast.emit 'updatepaint', drawhistory[i].data, users[drawhistory[i].username].color
    delete users[socket.username]
    io.sockets.emit 'updateusers', users


createUser = (name) ->
  user =
    name: name
    color: usercolors[colorindex % usercolors.length]
  colorindex++
  return user


port = 8080
server.listen port, '0.0.0.0'
console.log "Listening on port: #{port}"
