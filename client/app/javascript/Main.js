var
  widgetAPI = new Common.API.Widget(),
  Main = {};

Main.onLoad = function () {
  widgetAPI.sendReadyEvent();
};

Main.onUnload = function () {
};
