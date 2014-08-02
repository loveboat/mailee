var timeToBeOpenInMinutes = 1;

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

function notifyUser() {
	var options = {
		type: "basic",
		title: "Mailee would like a word..",
		message: "time to stop reading your email perhaps?",
		iconUrl: "icon_128.png"
	};

	chrome.notifications.create('mailee', options, function (notificationId) {
		console.log('your notification has fired!');
	});
}

chrome.alarms.onAlarm.addListener(function (alarm) {
	console.log('alarm triggered');

	if (alarm.name === 'gmail-killer') {
		chrome.tabs.query({}, function (tabs) {
			tabs.forEach(function(tab) {

				// mail tab is open
				if (tab.url.indexOf('https://mail.google.com/mail/') !== -1) {

					// is it in use?
					if (tab.highlighted) {
						console.log('extending alarm');

						notifyUser();

						chrome.alarms.create('gmail-killer', {delayInMinutes: 1});
					} else {
						console.log('closing tab');
						chrome.tabs.remove(tab.id);
					}
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

				console.log('mail open - setting alarm (delay: ' + timeToBeOpenInMinutes + ' mins)');
				chrome.alarms.create('gmail-killer', {delayInMinutes: timeToBeOpenInMinutes});
			}
		});
	});
}

// listen for an event coming from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
		case 'set-delay': {
			timeToBeOpenInMinutes = parseInt(request.message, 10);
			console.log('setting delay: ' + timeToBeOpenInMinutes);
			tabsCount();
		}
		break;
	}
	return true;
});