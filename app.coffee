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
usercolors = [
  "#ff0000", "#00ff00", "#0000ff", "#c49a1b", "#b63bcc", "#3ddbe3",
  "#f77502", "#9932CC", "#9400D3",
]
colorindex = 0
drawhistory = []
default_color = '#888888'
limit = 250


io.sockets.on 'connection', (socket) ->

  socket.on 'sendpaint', (data) ->
    color = users[socket.username]?.color || default_color
    socket.broadcast.emit 'updatepaint', data, color
    if drawhistory.length > limit
      drawhistory.splice(0, 1)
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
      color = users[drawhistory[i]?.username]?.color || default_color
      socket.emit 'updatepaint', drawhistory[i].data, color

  socket.on 'disconnect', ->
    #users["#{socket.username}-#{Math.random()}"] = users[socket.username]
    delete users[socket.username]
    io.sockets.emit 'updateusers', users
    return
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


port = 5821
server.listen port, '0.0.0.0'
console.log "Listening on port: #{port}"
