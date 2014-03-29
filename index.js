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



app.get("/tv", function(req, res){
  res.render("tv");
});

//app.listen(port);
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {

  var isMaster = function() {
    var clients = io.sockets.clients();
    console.log(clients);
    return socket === io.sockets.clients()[0];
  }

  socket.emit('chatmessage', { message: 'welcome to the chat' });
  socket.on('chatmessage', function (data) {
    io.sockets.emit('chatmessage', data);
  });
  socket.on('message', function(data) {
    console.log(data);
  });
  socket.on('currentTime', function(data) {
    if (isMaster()) {
      console.log('broadcasting time ' + data.currentTime);
      socket.broadcast.emit('seekTo', data);
    }
  });
});

console.log("Listening on port " + port);
