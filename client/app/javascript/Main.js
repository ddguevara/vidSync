var
  widgetAPI = (typeof Common !== 'undefined') && new Common.API.Widget() || null,
  Main = {};

Main.onLoad = function () {
  if (widgetAPI) widgetAPI.sendReadyEvent();

  var socket = io.connect('http://188.226.203.5');
  // var socket = io.connect('127.0.0.1:3700');

  var videoEl = document.getElementById('video');

  setInterval(function() {
    socket.emit('currentTime', { currentTime: videoEl.currentTime });
  }, 1234);

  socket.on('seekTo', function(data) {
    var currentTime = videoEl.currentTime;
    if (Math.abs(currentTime - data.currentTime) > 0.5) {
      videoEl.currentTime = data.currentTime;
    }
  });

  var content = document.getElementById("content");

  var displayMessage = function(data) {
    var html = '';
    html += '<b>' + (data.username || 'Server') + ': </b>';
    html += data.message;
    var chatLineEl = document.createElement('div');
    chatLineEl.innerHTML = html;
    content.appendChild(chatLineEl);
    // TODO: Start trimming chat lines when there are too many.

    content.scrollTop = content.scrollHeight;
  }

  socket.on('chatmessage', displayMessage);
};

Main.onUnload = function () {
};
