
var localMode = false;

var
  widgetAPI = (typeof Common !== 'undefined') && new Common.API.Widget() || null,
  Main = {};

var generateId = function() {
  var id = "";
  for (var i = 0; i < 6; ++i) {
    id += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return id;
};

Main.onLoad = function () {
  if (widgetAPI) widgetAPI.sendReadyEvent();

  var onResize = function() {
    var fontSize = window.innerHeight / 40;
    document.body.style.fontSize = fontSize + 'px';
  };
  onResize();
  window.addEventListener('resize', onResize);

  var socket = io.connect(localMode ? '127.0.0.1:3700' : 'http://tabby.tv');

  var videoEl = document.getElementById('video');
  var qrContainerEl = document.getElementById('qr-container');

  var tvId = generateId();
  var linkUrl = 'http://tabby.tv/link?tv=' + tvId;

  var qrEl = document.createElement('img');
  qrEl.src = 'http://zxing.org/w/chart?cht=qr&chs=350x350&chl=' + encodeURI(linkUrl);
  qrContainerEl.appendChild(qrEl);
  var urlEl = document.createElement('div');
  urlEl.innerText = 'Scan the code, or visit this URL: ' + linkUrl;
  qrContainerEl.appendChild(urlEl);

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
