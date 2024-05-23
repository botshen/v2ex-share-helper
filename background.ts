console.log('background start')
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'openNewTab') { 
//     try {
//       const targetUrl = chrome.runtime.getURL("tabs/App.html")
//       chrome.tabs.create({ url: targetUrl })
//     } catch (error) {
//       console.error(error)
//     } 
//   }
// });

 
// background.ts
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

