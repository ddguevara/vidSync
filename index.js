var express = require("express");
var app = express();
var port = 3700;

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res) {
  res.render("home");
});
app.get("/mobile", function(req, res) {
  res.render("head");
});


var tvsById = {};
var channelsById = {};



var withTv = function(req, res, next) {
  var tvId = req.query.tv;
  if (tvsById[tvId]) {
    res.locals.tvId = tvId;
    next();
  } else {
    res.render("404");
  }
};

var withChannel = function(req, res, next) {
  var channelId = req.query.channel;
  if (channelsById[channelId]) {
    res.locals.channelId = channelId;
    next();
  } else {
    res.render("404");
  }
};

app.get("/link", withTv, function(req, res) {
  res.render("link");
});

app.get("/join", withTv, function(req, res) {
  res.render("join");
});

app.get("/create", withTv, function(req, res) {
  res.render("create");
});

app.post("/create", withTv, function(req, res) {
  console.log(req.body);
  var channelId = req.body.channelName;  // TODO: Use generated IDs?
  var tvId = req.query.tv;
  var tv = tvsById[tvId];
  tv.channelId = channelId;
  if (!channelsById[channelId]) {
    tv.isMaster = true;

    var channel = {
      id: channelId,
      videoUrl: req.body.videoUrl,
      tvIds: [ tvId ],
      messages: [ { message: 'Welcome to channel ' + channelId + '!' } ]
    };
    channelsById[channelId] = channel;
  }
  tv.socket.emit('setvideo', { videoUrl: channel.videoUrl });
  res.redirect("/chat?channel=" + channelId);
});

app.get("/chat", withChannel, function(req, res) {
  res.render("page");
});


var server = app.listen(port);
var io = require('socket.io').listen(server);
console.log("Listening on port " + port);


io.of('/tv').on('connection', function(socket) {

  console.log('TV connected');

  var tv = {
    id: null,
    channelId: null,
    isMaster: false,
    socket: socket
  };

  var disconnect = function() {
    if (tv.id) {
      console.log('TV ' + tv.id + ' disconnected');
      delete tvsById[tv.id];
      tv.id = null;
    }
  };

  socket.on('id', function(data) {
    disconnect();
    tv.id = data.tvId;
    tvsById[tv.id] = tv;
    console.log('TV ' + tv.id + ' has identified itself');
  });

  socket.on('currentTime', function(data) {
    if (tv.isMaster) {
      console.log('broadcasting time ' + data.currentTime);
      socket.broadcast.emit('seekTo', data);
    }
  });

  socket.on('disconnect', disconnect);
});

io.of('/controller').on('connection', function(socket) {

  var channel = null;

  var disconnect = function() {
    channel = null;
  };

  socket.on('setchannel', function(data) {
    disconnect();
    channel = channelsById[data.channelId];

    if (! channel) return;  // TODO: Send an error.

    channel.messages.forEach(function(message) {
      socket.emit('chatmessage', message);
    });
  });

  socket.on('chatmessage', function (data) {
    if (! channel) return;
    channel.messages.push(data);
    // TODO: Limit number of messages stored.
    io.of('/controller').emit('chatmessage', data);
  });
});
