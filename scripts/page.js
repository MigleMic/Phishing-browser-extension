//Script file for modifying information, saved in 
let messageSent = false;

// Displaying the URL of the current active tab
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    const modifiedUrl = modifyUrl(url);

    document.getElementById('url-display').innerHTML = modifiedUrl;
});

// Send a message to background.js to get the modified URL
// if(!messageSent){
// chrome.runtime.sendMessage({ action: 'getModifiedUrl' }, function(response) {
//     if (response && response.modifiedUrl) {
//         const modifiedUrl = response.modifiedUrl;
//         // Handle the modified URL received from background.js
//         console.log("Modified URL received in page.js:", modifiedUrl);
//         // Now you can use the modified URL as needed
//         console.log('What I received - ', modifiedUrl);
//         addContentToPanel(modifiedUrl);
//     }
// });
// messageSent = true;
// }
function modifyUrl(url){
    console.log("MODIFIED HERE");
    const modified = '<span class="dangerousSymbol">' + url + '</span>'; 
    return modified;
}