//Script file for modifying information, looking for phishing signs
import { create_database } from "./databaseCreation.js";

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

create_database();

export let modifiedUrl = '';
export let dataIndex = 1;

// Displaying the URL of the current active tab
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    console.log('Sending message');
    // Send message to background script with the URL
    chrome.runtime.sendMessage({ action: 'getURL', url: url }, async (response) => {
        console.log('Getting response');

        if (response.success){
            const currentUrl = url;
            modifiedUrl = currentUrl;

            const isPhishing = await checkPhishingSigns();
            if (isPhishing)
            {
                document.getElementById('url-display').innerHTML = modifiedUrl;
            } 
        }
    });
});

// Checking for defined phishing signs
async function checkPhishingSigns() {
    var phishing = false;
    var url = modifiedUrl;

    //TBA add collapsibles and markers inside of this
    if (await checkIPAddress(url)) {
        logMessage('Rastas IP adresas');
        phishing = true;
    }
    
    if (await checkPlagiarisedLetter()) {
        logMessage('Rasta plagijuota raidė');
        phishing = true;
    }

    if (checkLongUrl(url)) {
        logMessage('Rastas ilgas URL');
        phishing = true;
    }

    if (await checkUrlShorteners()) {
        logMessage('Rastas URL trumpintojas');
        phishing = true;
    }

    if (await checkCheapTLD(url)) {
        logMessage('Rastas pigus aukščiausio lygio domenas');
        phishing = true;
    }

    if (await checkNativeTLD(url)) {
        logMessage('Rastas ne šalies aukščiausio lygio domenas');
        phishing = true;
    }

    if (await checkTLDNumber(url)) {
        logMessage('Rastas daugiau nei vienas TLD');
        phishing = true;
    }

    if (await checkAtSymbol()){
        logMessage('Rastas @ simbolis');
        phishing = true;
    }

    if (checkDotsDashes()) {
        logMessage('Rastas didelis brūkšnelių ir taškų skaičius');
        phishing = true;
    }

    if (!checkSSLCertificate(url)) {
        logMessage('SSL Sertifikatas nerastas');
        phishing = true;
    }

    if (await checkPrefixSufix(url)) {
        logMessage('Rastas pridėtinis žodis');
        phishing = true;
    }

    return phishing;   
}

function logMessage(message) {
    const logContainer = document.getElementById('log-container');
    const logMessage = document.createElement('div');
    logMessage.textContent = message;
    logContainer.appendChild(logMessage);
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