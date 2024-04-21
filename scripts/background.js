// Checks if the URL changes

let previousUrl = '';
let showUrl = '';
let panelWindowId;

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

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];  

            if (!url.startsWith(chrome.runtime.getURL("")) && !excludeFromUrlChecking(url)) {
                    showUrl = url;
                    openPanelWindow(url);
            }
        });
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
        const url = message.url;
        
        if (url === showUrl) {
            sendResponse({ success: true, url: showUrl }); 
        }
    }

    else if (message.action === 'isPhishing') {
        phishing = message.isPhishing;
        console.log(phishing);
        if (phishing) {
            // displayPanel();
            console.log('TIKRINAM PHISHING ', phishing);
        }
        if (phishing === false) {
            console.log('Norim uzdaryti',  panelWindowId);
            closePanelWindow();
        }
        sendResponse({ success: true});
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
        width: 850,
        height: 800
    }, window => {
        panelWindowId = window.id;
        console.log(panelWindowId);
    }); 

    console.log(panelWindowId);
}

function closePanelWindow() {
    console.log(panelWindowId);
    if (panelWindowId) {
        chrome.windows.remove(panelWindowId);
        panelWindowId = null;
    }
}