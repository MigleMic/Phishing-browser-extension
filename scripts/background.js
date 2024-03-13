let previousUrl = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        var currentUrl = changeInfo.url;
        if (currentUrl !== previousUrl) {
            previousUrl = currentUrl;
            chrome.tabs.create({ url: "page.html" });
        }
    }
});