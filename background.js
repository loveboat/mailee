chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
	if (props.status === "complete") {
		tabsCount();
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
	tabsCount();
});

chrome.tabs.onRemoved.addListener(function(tabId, props) {
	tabsCount();
});

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   tabsCount();
// });

var timeToBeOpenInMinutes = 1;

chrome.alarms.onAlarm.addListener(function (alarm) {
	console.log('alarm triggered');

	if (alarm.name === 'gmail-killer') {
		chrome.tabs.query({}, function (tabs) {
			tabs.forEach(function(tab) {
				if (tab.url.indexOf('https://mail.google.com/mail/') !== -1) {
					console.log('gmail tab closed');
					chrome.tabs.remove(tab.id);
				}
			});
		});
	}
});

function tabsCount() {
	chrome.tabs.query({}, function (tabs) {
		chrome.browserAction.setBadgeText({text: tabs.length.toString()});

		tabs.forEach(function (tab) {
			if (tab.url.indexOf('https://mail.google.com/mail/') !== -1) {
				chrome.browserAction.setBadgeText({text: 'Yes'});

				console.log('setting alarm');
				chrome.alarms.create('gmail-killer', {delayInMinutes: 0.1});
			}
		});
	});
}

// listen for an event coming from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
		case 'set-delay': {
			timeToBeOpenInMinutes = request.message;
			console.log('setting delay: ' + timeToBeOpenInMinutes);
		}
		break;
	}
	return true;
});