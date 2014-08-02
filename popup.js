window.onload = function() {
  document.getElementById("button").onclick = function() {
		var delay = document.getElementById("delay").value;
		console.log('value set: ' + delay);
    chrome.extension.sendMessage({
      type: 'set-delay',
      message: delay
    });
  };
};