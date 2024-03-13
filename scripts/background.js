//background service
//checks if the URL changes

let previousUrl = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.url && tab.active) {

        var currentUrl = changeInfo.url;

        if (currentUrl !== previousUrl) {

            previousUrl = currentUrl;
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

                //checking if URL is not extension's URL
                if (!currentUrl.startsWith(chrome.runtime.getURL(""))) {
                    const activeTab = tabs[0];
                    chrome.tabs.create({
                        url: "popup.html?url=" + encodeURIComponent(activeTab.url)
                    });
                }
            });
        }
    }
});