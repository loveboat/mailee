window.onload = function() {
  document.getElementById("currentSetting").innerHTML += chrome.extension.getBackgroundPage().timeToBeOpenInMinutes + " min";

  document.getElementById("button").onclick = function() {
		var delay = document.getElementById("delay").value;
    chrome.extension.sendMessage({
      type: 'set-delay',
      message: delay
    });
  };
};