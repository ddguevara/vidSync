var
  widgetAPI = new Common.API.Widget(),
  Main = {};

Main.onLoad = function () {
  widgetAPI.sendReadyEvent();

  var socket = io.connect('http://188.226.203.5');

  document.getElementById('debug').textContent = 'it works! ' + socket.toString();
};

Main.onUnload = function () {
};
