// Checks if the URL changes

let previousUrl = '';
let showUrl = '';
let panelWindowId = null;
let panelOpen = false;
let activeTabId = null;
let currentId = '';

// Checking if new tab URL is a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        const url = changeInfo.url;
        if (url !== previousUrl) {
            checkUrl(url);
        }
    }
});

// Checking if there is a different URL when navigating to another page
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const url = details.url;
    const tabId = details.tabId;

    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.active) {
            if (url !== previousUrl) {
                checkUrl(url);
            }
        }
    });
});

// Checking if URL is not of extension itself
function checkUrl(url) {
    if (!url.startsWith('chrome')) { 
        if (url !== previousUrl) {
            previousUrl = url;
        }
        if (!panelOpen) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0 && tabs[0].id) {
                    activeTabId = tabs[0].id;
                } 
    
                if (!url.startsWith(chrome.runtime.getURL("")) && !excludeFromUrlChecking(url)) {
                    if (panelWindowId === null) {
                        chrome.tabs.update(activeTabId, {url: previousUrl});
                            showUrl = url;
                            panelOpen = true;
                            openPanelWindow(url);
                    }
                }
            });
        }
    }
}

function excludeFromUrlChecking(url){
    const excludeDomains = ['google', 'drive', 'about:blank', 'file', 'localhost', '404'];

    for (const excluded of excludeDomains) {
        if (url.includes(excluded)) {
            return true;
        }
    }
    return false;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'getURL') {

        sendResponse({success: true, url: showUrl});
    }

    if (message.action === 'isPhishing') {
        phishing = message.isPhishing;
        if (phishing) {
            chrome.tabs.update(activeTabId, {url: 'warning_page.html'});
            currentId = activeTabId;
        }
        if (phishing === false) {
            closePanelWindow();
        }
        sendResponse({ success: true});
    }  

    if (message.action === 'safetyButtonClicked') {
        closePanelWindow();
        chrome.tabs.goBack(currentId);
    }

    if (message.action === 'dangerButtonClicked') {
        closePanelWindow();
        chrome.tabs.update(currentId, {url: showUrl});
    }
    return true;
});

function openPanelWindow(url) {
    const encodedURL = encodeURIComponent(url);   

    //creates a panel html
    chrome.windows.create({
        url: 'popup.html?url=' + encodedURL,
        type: 'panel',
        left: 300,
        top: 10,
        width: 900,
        height: 800
    }, window => {
        panelWindowId = window.id;
    }); 
}

chrome.windows.onRemoved.addListener(windowId => {
    if (windowId === panelWindowId) {
        panelWindowId = null;
        panelOpen = false;
    }
});

function closePanelWindow() {
    console.log(panelWindowId);
    if (panelWindowId) {
        chrome.windows.remove(panelWindowId);
        panelWindowId = null;
        panelOpen = false;
    }
}