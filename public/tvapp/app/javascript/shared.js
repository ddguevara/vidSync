
Shared = {};

Shared.setupVideo = function(socket, onSetVideo) {

  var videoEl = document.getElementById('video');

  socket.on('setchannel', function(data) {
    socket.emit('setchannel', data);
    videoEl.src = data.videoUrl;
    onSetVideo && onSetVideo();
  });

  setInterval(function() {
    socket.emit('currentTime', { currentTime: videoEl.currentTime });
  }, 1234);

  socket.on('seekTo', function(data) {
    var currentTime = videoEl.currentTime;
    if (Math.abs(currentTime - data.currentTime) > 0.5) {
      videoEl.currentTime = data.currentTime;
    }
  });

  socket.on('play', function() {
    videoEl.play();
  });

  socket.on('pause', function() {
    videoEl.pause();
  });
};


Shared.setupCanvas = function(socket) {
  var canvas, context;

  // Find the canvas element.
  canvas = document.getElementById('imageView');

  // Get the 2D canvas context.
  context = canvas.getContext('2d');

  context.strokeStyle = '#ff0000';

  socket.on('paintCommand', function(data) {
    switch (data.type) {
      case 'clear':
        context.clearRect(0, 0, canvas.width, canvas.height);
        break;
      case 'start':
        context.beginPath();
        context.moveTo(data._x, data._y);
        break;
      case 'path':
        context.lineTo(data._x, data._y);
        context.stroke();
        break;
      case 'stop':
        break;
    }
  });

  return canvas;
};
