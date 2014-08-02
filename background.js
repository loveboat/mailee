var timeToBeOpenInMinutes = 1;
var mailUrl = 'https://mail.google.com/mail/';

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
	});
}

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
	if (buttonIndex === 0) {
		console.log('notification: extend the delay');
		setKillAlarm(5);
	} else if (buttonIndex === 1) {
		console.log('notification: closing email tab(s)');
		// TODO close the tab
	}

	clearNotifications();
});

function clearNotifications() {
	chrome.notifications.clear('mailee-notification', function (wasCleared) {
		console.log('notification: cleared');
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
			console.log('tabs count: ' + tabs.length);
			tabs.forEach(function(tab) {

				// is it in use?
				if (tab.highlighted) {
					console.log('extending alarm');

					notifyUser();
					setKillAlarm(1);
				} else {
					console.log('closing tab');

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
			chrome.browserAction.setBadgeText({text: '..zZ'});
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