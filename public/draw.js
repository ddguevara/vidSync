
var localMode = true;

var baseUrl = 'http://' + (localMode ? '127.0.0.1:3700' : 'tabby.tv');

window.addEventListener('load', function () {
  var socket = io.connect(baseUrl + '/');
  socket.emit('imatv');

  var match = /\?.*channel=([^\&]*)/.exec(window.location.search);
  if (match) {
    socket.emit('channel', { channelId: match[1] });
  }

  var canvas = Shared.setupCanvas(socket);

  // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  document.getElementById('clear').addEventListener('click', function() {
    socket.emit('paintCommand', { type: "clear" });
  }, false);

  var toolStarted = false;

  // Attach the mousedown, mousemove and mouseup event listeners.
  canvas.addEventListener('mousedown', ev_canvas, false);
  canvas.addEventListener('mousemove', ev_canvas, false);
  canvas.addEventListener('mouseup',   ev_canvas, false);

  var methods = {
    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    mousedown: function (ev) {
        socket.emit('paintCommand', { type: "start", _x:ev._x,_y:ev._y });
        toolStarted = true;
    },

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the toolStarted state is set to true (when you are holding down 
    // the mouse button).
    mousemove: function (ev) {
      if (toolStarted) {
        socket.emit('paintCommand', { type: "path", _x:ev._x,_y:ev._y });
      }
    },

    // This is called when you release the mouse button.
    mouseup: function (ev) {
      if (toolStarted) {
        socket.emit('paintCommand', { type: "stop", _x:ev._x,_y:ev._y });
        toolStarted = false;
      }
    }
  };

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = methods[ev.type];
    if (func) {
      func(ev);
    }
  }

  PlayerControls.init(socket);

}, false);
