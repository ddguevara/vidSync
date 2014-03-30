
var localMode = false;

var baseUrl = 'http://' + (localMode ? '127.0.0.1:3700' : 'tabby.tv');

var
  widgetAPI = (typeof Common !== 'undefined') && new Common.API.Widget() || null,
  Main = {};


Main.onLoad = function () {
  if (widgetAPI) widgetAPI.sendReadyEvent();

  var onResize = function() {
    var fontSize = window.innerHeight / 40;
    document.body.style.fontSize = fontSize + 'px';
  };
  onResize();
  window.addEventListener('resize', onResize);

  var socket = io.connect(baseUrl + '/');
  socket.emit('imatv');

  var qrContainerEl = document.getElementById('qr-container');

  socket.on('id', function(data) {
    var tvId = data.tvId;

    var linkUrl = baseUrl + '/link?tv=' + tvId;

    var qrEl = document.createElement('img');
    qrEl.src = 'http://zxing.org/w/chart?cht=qr&chs=350x350&chl=' + encodeURI(linkUrl);
    qrContainerEl.appendChild(qrEl);
    var urlEl = document.createElement('div');
    urlEl.innerText = 'Scan the code, or visit this URL: ' + linkUrl;
    qrContainerEl.appendChild(urlEl);
  });

  // socket.on('connect', function() {
  //   socket.emit('id', { tvId: tvId });
  // });

  var onSetVideo = function() {
    qrContainerEl.classList.add('hidden');
  };

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

  Shared.setupVideo(socket, onSetVideo);
  Shared.setupCanvas(socket);
};

Main.onUnload = function () {
};
