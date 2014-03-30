
var express = require("express");
var app = express();
var port = 3700;

var tvsById = {};
var channelsById = {};


app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res) {
  var channels = [];
  for (channelId in channelsById) {
    channels.push(channelId);
  }
  res.locals.channels = channels;
  res.render("home");
});


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
  var channelId = req.query.channel;
  if (channelId) {
    channelId = req.query.channel;
    var channel = channelsById[channelId];
    if (! channel) return res.send(404, "Oops, that channel is gone!");
    var tvId = req.query.tv;
    var tv = tvsById[tvId];
    tv.socket.emit('setchannel', { channelId: channelId, videoUrl: channel.videoUrl });
    res.redirect("/chat?channel=" + channelId);
  }
  var channels = [];
  for (channelId in channelsById) {
    channels.push(channelId);
  }
  res.locals.channels = channels;
  res.render("join");
});

app.get("/create", withTv, function(req, res) {
  res.render("create");
});

app.post("/create", withTv, function(req, res) {
  var channelId = req.body.channelName;  // TODO: Use generated IDs?
  var tvId = req.query.tv;
  var tv = tvsById[tvId];
  tv.channelId = channelId;
  var channel = channelsById[channelId];
  if (! channel) {
    tv.isMaster = true;

    var channel = {
      id: channelId,
      videoUrl: req.body.videoUrl,
      tvIds: [],
      messages: [ { message: 'Welcome to channel ' + channelId + '!' } ]
    };
    channelsById[channelId] = channel;
  }
  tv.socket.emit('setchannel', { channelId: channelId, videoUrl: channel.videoUrl });
  res.redirect("/chat?channel=" + channelId);
});

app.get("/chat", withChannel, function(req, res) {
  res.render("chat");
});

app.get("/draw", withChannel, function(req, res) {
  res.render("draw");
});


var server = app.listen(port);
var io = require('socket.io').listen(server);
console.log("Listening on port " + port);


var generateId = function() {
  var id = "";
  for (var i = 0; i < 6; ++i) {
    id += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return id;
};


io.sockets.on('connection', function(socket) {

  var channel = null;
  var tv = null;

  socket.on('imatv', function() {
    tv = {
      id: generateId(),
      channelId: null, // Remove this?
      isMaster: false,
      socket: socket
    };
    tvsById[tv.id] = tv;
    socket.emit('id', { tvId: tv.id });
    console.log('TV ' + tv.id + ' connected');
  });


  var disconnect = function() {
    if (tv) {
      console.log('TV ' + tv.id + ' disconnected');
      delete tvsById[tv.id];
      tv = null;
    }
  };

  socket.on('currentTime', function(data) {
    if (! tv) return;
    if (! tv.isMaster) return;
    if (! channel) throw new Error('no channel');
    console.log('broadcasting time ' + data.currentTime);
    for (var i = 0; i < channel.tvIds.length; ++i) {
      var tvId = channel.tvIds[i];
      if (tv.id === tvId) continue;
      var otherTv = tvsById[tvId];
      if (otherTv) otherTv.socket.emit('seekTo', data);
    }
  });

  socket.on('setchannel', function(data) {
    // TODO: Remove the TV from its previous channel, if any.
    var channelId = data.channelId;
    channel = channelsById[channelId];
    if (! channel) throw new Error('no channel');
    if (tv) {
      tv.channelId = channelId;
      channel.tvIds.push(tv.id);
    }
    channel.messages.forEach(function(message) {
      socket.emit('chatmessage', message);
    });
  });

  socket.on('paintCommand', function(data) {
    if (! channel) throw new Error('no channel');
    for (var i = 0; i < channel.tvIds.length; ++i) {
      var tvId = channel.tvIds[i];
      var otherTv = tvsById[tvId];
      if (otherTv) otherTv.socket.emit('paintCommand', data);
    }
  });

  socket.on('disconnect', disconnect);

  socket.on('chatmessage', function (data) {
    if (! channel) throw new Error('no channel');
    // TODO: Limit number of messages stored.
    channel.messages.push(data);

    for (var i = 0; i < channel.tvIds.length; ++i) {
      var tvId = channel.tvIds[i];
      var tv = tvsById[tvId];
      if (! tv) continue;
      tv.socket.emit('chatmessage', data);
    }
  });

  socket.on('play', function() {
    if (! channel) throw new Error('no channel');
    for (var i = 0; i < channel.tvIds.length; ++i) {
      var tvId = channel.tvIds[i];
      var tv = tvsById[tvId];
      if (! tv) continue;
      tv.socket.emit('play');
    }
  });

  socket.on('pause', function() {
    if (! channel) throw new Error('no channel');
    for (var i = 0; i < channel.tvIds.length; ++i) {
      var tvId = channel.tvIds[i];
      var tv = tvsById[tvId];
      if (! tv) continue;
      tv.socket.emit('pause');
    }
  });
});
