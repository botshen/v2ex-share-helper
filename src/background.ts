chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openNewTab") {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/App.html") }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (info.status === 'complete' && tabId === tab.id) {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, {
            action: "showPostContent",
            data: message.data
          });
        }
      });
    });
  }
});
