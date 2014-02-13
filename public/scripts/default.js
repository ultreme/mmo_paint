//Code for painting on canvas

var context;
var drawPoints = [];
var historyPoints = [];
var paint;

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
    draw();
}

function ev_mousemove(e) {
    if (paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        draw();
    }
}

function drawFinished() {
    paint = false;
    drawPoints = [];
}

function addClick(x, y, dragging) {
    var point = {"x": x, "y": y, "dragging": dragging};
    drawPoints.push(point);
    historyPoints.push(point);
}

function draw() {

    setUserStyle();

    for (var i=0; i < drawPoints.length; i++) { 
        
        context.beginPath();
        if(drawPoints[i].dragging && i){
            context.moveTo(drawPoints[i-1].x, drawPoints[i-1].y);
        }else{
            context.moveTo(drawPoints[i].x-1, drawPoints[i].y);
        }
        context.lineTo(drawPoints[i].x, drawPoints[i].y);
        context.closePath();
        context.stroke();
    }
  
}

function setUserStyle() {
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;
}

//Code for socket.io communication

var socket;

$(document).ready(function () {
    socket = io.connect('http://localhost:8080');
    socket.on('connect', addUser);
    socket.on('updatepaint', processMessage);
    socket.on('updateusers', updateUserList);
    $('#datasend').click(sendMessage);
    $('#data').keypress(processEnterPress);
});

function addUser() {
    socket.emit('adduser', prompt("What's your name?"));
}

function processMessage(username, data) {
    $('<b>' + username + ':</b>' + data + '<br />')
        .insertAfter($('#conversation'));
}

function updateUserList(data) {
    $('#users').empty();
    $.each(data, function (key, value) {
        $('#users').append('<div>' + key + '</div>');
    });
}

function sendMessage() {
    var message = $('#data').val();
    $('#data').val('');
    socket.emit('sendpaint', message);
    $('#data').focus();
}

function processEnterPress(e) {
    if(e.which == 13) {
        e.preventDefault();
        $(this).blur();
        $('#datasend').focus().click();
    }
}