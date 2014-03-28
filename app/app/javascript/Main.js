var widgetAPI = new Common.API.Widget(),
    tvKey = new Common.API.TVKeyValue(),
    Main = {},
    square = null,
    step = 100,
    squareLeft = 0,
    squareTop = 0,
    squareSide = 100,
    screenWidth = 960,
    screenHeight = 540;

Main.onLoad = function () {
    this.enableKeys();
    widgetAPI.sendReadyEvent();
    square = document.getElementById("square");
};

Main.onUnload = function () { };

Main.enableKeys = function () {
    document.getElementById("anchor").focus();
};

Main.keyDown = function (event) {
    var keyCode = event.keyCode,
        spaceLeft = 0;

    switch (keyCode) {
        case tvKey.KEY_RETURN:
        case tvKey.KEY_PANEL_RETURN:
            widgetAPI.sendReturnEvent();
            break;
        case tvKey.KEY_LEFT:
            if (squareLeft > 0) {
                squareLeft = (squareLeft > step) ? squareLeft - step : 0;
                square.style.left = squareLeft + "px";
            }
            break;
        case tvKey.KEY_RIGHT:
            spaceLeft = screenWidth - squareLeft - squareSide;
            if (spaceLeft > 0) {
                squareLeft += (spaceLeft > step) ? step : spaceLeft;
                square.style.left = squareLeft + "px";
            }
            break;
        case tvKey.KEY_UP:
            if (squareTop > 0) {
                squareTop = (squareTop > step) ? squareTop - step : 0;
                square.style.top = squareTop + "px";
            }
            break;
        case tvKey.KEY_DOWN:
            spaceLeft = screenHeight - squareTop - squareSide;
            if (spaceLeft > 0) {
                squareTop += (spaceLeft > step) ? step : spaceLeft;
                square.style.top = squareTop + "px";
            }
            break;
        case tvKey.KEY_ENTER:
        case tvKey.KEY_PANEL_ENTER:
            alert("ENTER");
            break;
        default:
            alert("Unhandled key");
            break;
    }
};
