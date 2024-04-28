//Script file for modifying information, looking for phishing signs
import { create_database } from "./Utils/databaseCreation.js";

import { checkIPAddress } from "./phishingSigns/ipAddressReason.js";
import { checkPlagiarisedLetter } from "./phishingSigns/plagiarisedLetterReason.js";
import { checkLongUrl } from "./phishingSigns/longUrlReason.js";
import { checkUrlShorteners } from "./phishingSigns/urlShortenerReason.js";
import { checkCheapTLD } from "./phishingSigns/cheapTLDReason.js";
import { checkNativeTLD } from "./phishingSigns/nativeTLDReason.js";
import { checkTLDNumber } from "./phishingSigns/tldNumberReason.js";
import { checkAtSymbol } from "./phishingSigns/atSymbolReason.js";
import { checkDotsDashes } from "./phishingSigns/dotAndDashReason.js";
import { checkSSLCertificate } from "./phishingSigns/sslCertificateReason.js";
import { checkPrefixSufix } from "./phishingSigns/prefixSufixReason.js";
import { insertToLoggerTable } from "./Utils/insertDatabaseInformation.js";

create_database();

export let modifiedUrl = '';
export let dataIndex = 1;

// Displaying the URL of the current active tab
document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    insertToLoggerTable('', 'Sending URL to background');
    chrome.runtime.sendMessage({ action: 'getURL', url: url }, async (response) => {
        insertToLoggerTable('', 'Got a response from background');
        console.log(url);
        if (response && response.success){
            const currentUrl = url;
            modifiedUrl = currentUrl;

            var isPhishing = await checkPhishingSigns();
            if (isPhishing)
            {
                document.getElementById('url-display').innerHTML = modifiedUrl;             
            } 
            chrome.runtime.sendMessage({ action: 'isPhishing', isPhishing: isPhishing, url : currentUrl}); 
        }
    });
});

// Checking for defined phishing signs
async function checkPhishingSigns() {
    var phishing = false;
    var url = modifiedUrl;

    //TBA add collapsibles and markers inside of this
    if (await checkIPAddress(url)) {
        phishing = true;
    }
    
    if (await checkPlagiarisedLetter()) {
        phishing = true;
    }

    if (await checkLongUrl(url)) {
        phishing = true;
    }

    if (await checkUrlShorteners()) {
        phishing = true;
    }

    if (await checkCheapTLD(url)) {
        phishing = true;
    }

    if (await checkNativeTLD(url)) {
        phishing = true;
    }

    if (await checkTLDNumber(url)) {
        phishing = true;
    }

    if (await checkAtSymbol()) {
        phishing = true;
    }

    if (await checkDotsDashes()) {
        phishing = true;
    }

    if (!await checkSSLCertificate(url)) {
        phishing = true;
    }

    if (await checkPrefixSufix(url)) {
        phishing = true;
    }

    return phishing;   
}

// Highlightening dangerous parts of URL
export function modifyUrlPart(url, index, length, dIndex) {
    const span = `<span class="dangerousSymbol" dataIndex="${dIndex}">`;
    return url.substring(0, index) +  span + url.substring(index, index + length) + '</span>' + url.substring(index + length);
}


// Highlightening dangerous symbol of URL
export function modifyUrlSymbol(url, index, dIndex){
    const span = `<span class="dangerousSymbol" dataIndex="${dIndex}">`;
    return url.substring(0, index) + span + url.charAt(index) + '</span>' + url.substring(index + 1);
}

export function updateUrl(url) {
    modifiedUrl = url;
}

export function updateDataIndex() {
    dataIndex++;
}

export function modifyUrl(url) {
    document.getElementById('url-display').innerHTML = url;

    updateDataIndex();
}