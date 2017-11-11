const TITLE_ENABLE = "Tracking protection disabled, click to enable";
const TITLE_DISABLE = "Tracking protection enabled, click to disable";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

function onSet(result) {
  if (result) {
    console.log("success");
  } else {
    console.log("failure");
  }
}

/*
Toggle Tracking: based on the setting, enable or disable the tracking.
Update the page action's title and icon to reflect its state.
*/
function toggleTracking(tab) {

  var getting = browser.privacy.websites.trackingProtectionMode.get({});
  getting.then((got) => {
    console.log(got.value);
    if ((got.value === "never") ||
        (got.value === "private_browsing")) {
      var setting = browser.privacy.websites.trackingProtectionMode.set({
        value: "always"
      });
      browser.pageAction.setIcon({tabId: tab.id, path: "images/icon-on.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_DISABLE});
      setting.then(onSet);
    } else {
      var setting = browser.privacy.websites.trackingProtectionMode.set({
          value: "private_browsing"
        });
      browser.pageAction.setIcon({tabId: tab.id, path: "images/icon-off.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_ENABLE});
    }
  });

  /* Just because Fx doesn't support onChange we force pageAction refresh */
  var gettingAllTabs = browser.tabs.query({});
  gettingAllTabs.then((tabs) => {
    for (let tab of tabs) {
      initializePageAction(tab);
    }
  });
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
*/
function protocolIsApplicable(url) {
  var anchor =  document.createElement('a');
  anchor.href = url;
  return APPLICABLE_PROTOCOLS.includes(anchor.protocol);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializePageAction(tab) {
  if (protocolIsApplicable(tab.url)) {
      var getting = browser.privacy.websites.trackingProtectionMode.get({});
      getting.then((got) => {
        console.log(got.value);
        if ((got.value === "never") ||
            (got.value === "private_browsing")) {
                browser.pageAction.setIcon({tabId: tab.id, path: "images/icon-off.svg"});
                browser.pageAction.setTitle({tabId: tab.id, title: TITLE_ENABLE});
                browser.pageAction.show(tab.id);
        } else {
            browser.pageAction.setIcon({tabId: tab.id, path: "images/icon-on.svg"});
            browser.pageAction.setTitle({tabId: tab.id, title: TITLE_DISABLE});
            browser.pageAction.show(tab.id);
        }
      });
  }
}

/*
When first loaded, initialize the page action for all tabs.
*/
var gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

/*
Make sure we catch new tabs
*/
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  initializePageAction(tab);
});

/*
Toggle Tracking protection when the page action is clicked.
*/
browser.pageAction.onClicked.addListener(toggleTracking);

/*
Watch if setting was changed.
*/
browser.privacy.websites.trackingProtectionMode.onChange.addListener(initializePageAction);
