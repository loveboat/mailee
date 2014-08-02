window.onload = function() {
	var delay = chrome.extension.getBackgroundPage().timeToBeOpenInMinutes;
	document.getElementById("delay").value = delay;
  
  document.getElementById("button").onclick = function() {
		delay = document.getElementById("delay").value;
    chrome.extension.sendMessage({
      type: 'set-delay',
      message: delay
    });
  };
};