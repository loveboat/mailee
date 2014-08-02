var timeToBeOpenInMinutes = 1;
var mailUrl = 'https://mail.google.com/mail/';
var userNotified = false;

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
		iconUrl: "icon_128.png",
		buttons: [
			{ title: 'Give me five..'},
			{ title: "Ok, I'm done!"}
		]
	};

	chrome.notifications.create('mailee-notification', options, function (notificationId) {
		console.log('notification: fired');
		userNotified = true;
	});
}

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
	if (buttonIndex === 0) {
		console.log('notification: extend the delay');
		setKillAlarm(5);
	} else if (buttonIndex === 1) {
		console.log('notification: closing email tab(s)');
		chrome.tabs.query({}, function (tabs) {
			tabs = filterMailTabs(tabs);
			tabs.forEach(function (tab) {
				chrome.tabs.remove(tab.id);
			});
		});
	}

	clearNotifications();
});

function clearNotifications() {
	chrome.notifications.clear('mailee-notification', function (wasCleared) {
		console.log('notification: cleared');
		userNotified = false;
	});
}

function setKillAlarm(delay) {
	chrome.alarms.create('mailee-kill', {delayInMinutes: delay});
}

chrome.alarms.onAlarm.addListener(function (alarm) {
	console.log('alarm triggered');

	if (alarm.name === 'mailee-kill') {
		chrome.tabs.query({}, function (tabs) {

			tabs = filterMailTabs(tabs);
			tabs.forEach(function(tab) {

				// is it in use?
				if (tab.highlighted) {
					if (userNotified) {
						// beligerant mode - close the tab if the notification was ignored
						chrome.tabs.remove(tab.id);
						clearNotifications();
					} else {
						notifyUser();
						setKillAlarm(1);
					}
				} else {
					chrome.tabs.remove(tab.id);
					clearNotifications();
				}
			});
		});
	}
});

function tabsCount() {
	chrome.tabs.query({}, function (tabs) {
		
		tabs = filterMailTabs(tabs);
		if (tabs.length > 0) {
			chrome.browserAction.setBadgeText({text: 'o.O'});
			console.log('mail open - setting alarm (delay: ' + timeToBeOpenInMinutes + ' mins)');
			setKillAlarm(timeToBeOpenInMinutes);
		} else {
			chrome.browserAction.setBadgeText({text: 'Zz..'});
		}
	});
}

function filterMailTabs(tabs) {
	return tabs.filter(function (tab) {
		return tab.url.indexOf(mailUrl) !== -1;
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