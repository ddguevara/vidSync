var express = require("express");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
  res.render("page");
});
app.get("/mobile", function(req, res){
  res.render("head");
});



//app.listen(port);
var io = require('socket.io').listen(app.listen(port));

var messages = [];

messages.push({ message: 'welcome to the chat' });

io.sockets.on('connection', function (socket) {

  var isMaster = function() {
    var clients = io.sockets.clients();
    return socket === io.sockets.clients()[0];
  }

  messages.forEach(function(message) {
    socket.emit('chatmessage', message);
  });

  socket.on('chatmessage', function (data) {
    messages.push(data);
    io.sockets.emit('chatmessage', data);
  });
  socket.on('currentTime', function(data) {
    if (isMaster()) {
      console.log('broadcasting time ' + data.currentTime);
      socket.broadcast.emit('seekTo', data);
    }
  });
});

console.log("Listening on port " + port);
