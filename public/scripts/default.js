//Code for painting on canvas

var context;
var drawPoints = [];
var historyPoints = [];
var paint;
var localuser = {};

$(document).ready(function () {
    var canvas = document.getElementById('paint');
    canvas.height = 400;
    canvas.width = 600;
    context = canvas.getContext("2d");
    canvas.addEventListener('mousedown', ev_mousedown, false);
    canvas.addEventListener('mousemove', ev_mousemove, false);
    canvas.addEventListener('mouseup', drawFinished, false);
    canvas.addEventListener('mouseleave', drawFinished, false);
});

function ev_mousedown(e) {
    paint = true;
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    draw(drawPoints);
}

function ev_mousemove(e) {
    if (paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        draw(drawPoints);
    }
}

function drawFinished() {   
    paint = false;
    sendMessage(drawPoints)
    drawPoints = [];
}

function addClick(x, y, dragging) {
    var point = {"x": x, "y": y, "dragging": dragging};
    drawPoints.push(point);
    historyPoints.push(point);
}

function draw(points, color) {
    if(!color) {color = localuser.color;}
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = 3;

    for (var i=0; i < points.length; i++) { 
        
        context.beginPath();
        if(points[i].dragging && i){
            context.moveTo(points[i-1].x, points[i-1].y);
        }else{
            context.moveTo(points[i].x-1, points[i].y);
        }
        context.lineTo(points[i].x, points[i].y);
        context.closePath();
        context.stroke();
    }
  
}


//Code for socket.io communication

var socket;

$(document).ready(function () {
    socket = io.connect('http://localhost:8080');
    socket.on('connect', addUser);
    socket.on('updatepaint', processMessage);
    socket.on('setuser', setUser);
    socket.on('updateusers', updateUserList);
});

function addUser() {
    socket.emit('adduser', prompt("What's your name?"));
}

function processMessage(data, color) {
    draw(data, color);
}

function setUser(data) {
    localuser = data;
}

function updateUserList(data) {
    $('#users').empty();
    $.each(data, function (key, value) {
        $('#users').append('<div style="color:' + value.color +'">' + value.name + '</div>');
    });
}

function sendMessage(points) {
    if(points.lenght === 0) {return}
    socket.emit('sendpaint', points);
}
