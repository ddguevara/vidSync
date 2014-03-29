
var localMode = false;

var
  widgetAPI = (typeof Common !== 'undefined') && new Common.API.Widget() || null,
  Main = {};

Main.onLoad = function () {
  if (widgetAPI) widgetAPI.sendReadyEvent();

  var socket = io.connect(localMode ? '127.0.0.1:3700' : 'http://188.226.203.5');

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
    if (data.avatar) html += '<img src="' + data.avatar + '">'
    html += '<b>' + (data.username || 'Server') + ': </b>';
    html += data.message;
    var chatLineEl = document.createElement('div');
    chatLineEl.classList.add('chatline', 'fadeout');
    chatLineEl.innerHTML = html;
    content.appendChild(chatLineEl);

    setTimeout(function() {
      chatLineEl.classList.remove('fadeout');
    }, 0);

    setTimeout(function() {
      chatLineEl.classList.add('fadeout');
      setTimeout(function() {
        chatLineEl.parentElement.removeChild(chatLineEl);
      }, 2000);
    }, 5000);

    content.scrollTop = content.scrollHeight;
  }

  socket.on('chatmessage', displayMessage);
};

Main.onUnload = function () {
};
