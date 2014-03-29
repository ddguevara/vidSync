var express = require("express");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res) {
  res.render("page");
});
app.get("/mobile", function(req, res) {
  res.render("head");
});


var tvsById = {};


app.get("/:tvId", function(req, res) {
  var tvId = req.params.tvId;
  if (tvsById[tvId]) {
    res.render("link");
  } else {
    res.render("404");
  }
});


var server = app.listen(port);
var io = require('socket.io').listen(server);
console.log("Listening on port " + port);


var messages = [];

messages.push({ message: 'Welcome to the channel!' });


io.of('/tv').on('connection', function(socket) {

  console.log('TV connected');

  var tvId = null;

  var isMaster = function() {
    // TODO: Make the channel creator's TV always be the master.
    return socket === io.of('/tv').clients()[0];
  }

  var disconnect = function() {
    if (tvId) {
      console.log('TV ' + tvId + ' disconnected');
      delete tvsById[tvId];
      tvId = null;
    }
  };

  socket.on('id', function(data) {
    disconnect();
    tvId = data.tvId;
    tvsById[tvId] = socket;
    console.log('TV ' + tvId + ' has identified itself');
  });

  socket.on('currentTime', function(data) {
    if (isMaster()) {
      console.log('broadcasting time ' + data.currentTime);
      socket.broadcast.emit('seekTo', data);
    }
  });

  socket.on('disconnect', disconnect);
});

io.of('/controller').on('connection', function(socket) {

  messages.forEach(function(message) {
    socket.emit('chatmessage', message);
  });

  socket.on('chatmessage', function (data) {
    messages.push(data);
    io.of('/controller').emit('chatmessage', data);
  });
});
