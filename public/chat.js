
var localMode = true;

document.addEventListener("DOMContentLoaded", function() {

  var socket = io.connect(localMode ? 'http://localhost:3700/controller' : 'http://tabby.tv/controller');

  var chatmessage = document.getElementById("chatmessage");
  var content = document.getElementById("content");
  var name = document.getElementById("name");
  var avatarEl = document.getElementById("avatar");
  var form = document.getElementsByClassName("controls")[0];

  var displayMessage = function(data) {
    var html = '';
    html += '<b>' + (data.username || 'Server') + ': </b>';
    html += data.message;
    var chatLineEl = document.createElement('div');
    chatLineEl.innerHTML = html;
    content.appendChild(chatLineEl);
    // TODO: Add Like button.
    // TODO: Start trimming chat lines when there are too many.

    content.scrollTop = content.scrollHeight;
  }

  socket.emit('setchannel', { channelId: CHANNEL_ID });

  socket.on('chatmessage', displayMessage);

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (name.value == "") {
      displayMessage({message: "Please type your name!", username: "Error"});
    } else {
      var text = chatmessage.value;
      socket.emit('chatmessage', { message: text, username: name.value, avatar: avatarEl.value });
      chatmessage.value = "";
    }
    return false;
  });
});
