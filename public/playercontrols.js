
PlayerControls = {};

PlayerControls.init = function(socket) {

  var playEl = document.getElementById('play');
  var pauseEl = document.getElementById('pause');

  playEl.addEventListener('click', function(ev) {
    socket.emit('play');
  });

  pauseEl.addEventListener('click', function(ev) {
    socket.emit('pause');
  });
};
