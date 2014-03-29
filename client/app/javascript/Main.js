var
  widgetAPI = new Common.API.Widget(),
  Main = {};

Main.onLoad = function () {
  widgetAPI.sendReadyEvent();

  var socket = io.connect('http://188.226.203.5');
  // var socket = io.connect('127.0.0.1:3700');

  var videoEl = document.getElementById('video');
  var debugEl = document.getElementById('debug');

  setInterval(function() {
    socket.emit('currentTime', { currentTime: videoEl.currentTime });
  }, 1234);

  socket.on('seekTo', function(data) {
    var currentTime = videoEl.currentTime;
    if (Math.abs(currentTime - data.currentTime) > 0.5) {
      videoEl.currentTime = data.currentTime;
    }
  });
};

Main.onUnload = function () {
};
