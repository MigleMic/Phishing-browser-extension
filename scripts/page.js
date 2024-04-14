//Script file for modifying information, looking for phishing signs
import { create_database, getMarkerByID } from "./databaseCreation.js";

create_database();

let modifiedUrl = '';
let dataIndex = 1;

// Displaying the URL of the current active tab
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    console.log('Sending message');
    // Send message to background script with the URL
    chrome.runtime.sendMessage({ action: 'getURL', url: url }, (response) => {
        console.log('Getting response');

        if (response.success){
            const currentUrl = url;
            modifiedUrl = currentUrl;

            if (checkPhishingSigns())
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

    if (await checkNativeTLD(url)) {
        logMessage('Rastas ne šalies aukščiausio lygio domenas');
        phishing = true;
    }

    if (await checkCheapTLD(url)) {
        logMessage('Rastas pigus aukščiausio lygio domenas');
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

    if (await checkIPAdress(url)) {
        logMessage('Rastas IP adresas');
        phishing = true;
    }

    if (await checkPrefixSufix(url)) {
        logMessage('Rastas pridėtinis žodis');
        phishing = true;
    }

    return phishing;   
}

 async function checkPlagiarisedLetter() {
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    var foundValue = false;
    var checkIPAdressResult = await checkIPAdress(modifiedUrl);

    if (!checkIPAdressResult) {
        for (const character of plagiarisedLetters) {
            if (modifiedUrl.includes(character)) {
                var index = modifiedUrl.indexOf(character);
                
                for (const replaced of replacePlagiarisedLetter[character]) {
                    const modify = modifiedUrl.substring(0, index) + replaced + modifiedUrl.substring(index + 1);
                    
                    if (checkWebsiteExistence(modify)) {
                        modifiedUrl = modifyUrlSymbol(modifiedUrl, index, dataIndex);
                        document.getElementById('url-display').innerHTML = modifiedUrl;

                        const element = document.getElementById('url-display');
                        const marker = await getMarkerByID('Plagiarised_Letter');

                        getMessage(element, dataIndex, marker);

                        foundValue = true;
                        break;
                    }
                }
            }
        }
    }    

    return foundValue;
}

function checkLongUrl(url) {
    var foundValue = false;

    const longUrl = 54;
    var regex = /(?:https?:\/\/)?(?:www\.)?/;
    
    var cleanedUrl = url.replace(regex, "");
    if (cleanedUrl.length >= longUrl){
        foundValue = true;
    }

    return foundValue;
}

async function checkUrlShorteners() {
    const urlShorteners = ['tinyurl.com', 'qrco.de', 'shorturl.at', 'bit.ly'];
    var foundValue = false;

    for (const shortener of urlShorteners) {
        if (modifiedUrl.includes(shortener)) {
            var index = modifiedUrl.indexOf(shortener);

            modifiedUrl = modifyUrlPart(modifiedUrl, index, shortener.length, dataIndex);

            document.getElementById('url-display').innerHTML = modifiedUrl;

            const element = document.getElementById('url-display');
            const marker = await getMarkerByID('URL_Shortener');

            getMessage(element, dataIndex, marker);

            foundValue = true;
            break;
        }
    }

    return foundValue;
}

async function checkNativeTLD(url) {
    let nativeTLD = 'lt';

    var foundValue = false;

    var checkUrlShortenerResult = await checkUrlShorteners(url);
    var checkCheapTLDResult = await checkCheapTLD(url);

    if (!checkUrlShortenerResult && !checkCheapTLDResult) {
        const urlObject = new URL(url);
        let hostname = urlObject.hostname;
        const splitHostname = hostname.split('.');
        const oldTLD  = splitHostname.pop().toString();

        if (oldTLD !== nativeTLD) {
            // Assigning the native TLD, to see if a website like that exists
            splitHostname.push(nativeTLD);
            hostname = splitHostname.join('.');
            urlObject.hostname = hostname;

            var newUrl = urlObject.href;

            if (checkWebsiteExistence(newUrl)) {
                var index = modifiedUrl.indexOf(oldTLD);
                modifiedUrl = modifyUrlPart(modifiedUrl, index, oldTLD.length, dataIndex);

                document.getElementById('url-display').innerHTML = modifiedUrl;

                const element = document.getElementById('url-display');
                const marker = await getMarkerByID('Native_Domain');

                getMessage(element, dataIndex, marker);
                
                foundValue = true;
            }
        }
    }

    return foundValue;
}

async function checkCheapTLD(url) {
    const cheapTLDs = ['xyz', 'info', 'cf', 'gq', 'ml', 'tk', 'ga'];
    var foundValue = false;

    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    const splitHostname = hostname.split('.');
    const tld  = splitHostname.pop().toString();

    for (const cheap of cheapTLDs) {
        if (tld === cheap) {
            var index = modifiedUrl.indexOf(cheap);
            modifiedUrl = modifyUrlPart(modifiedUrl, index, tld.length, dataIndex);

            document.getElementById('url-display').innerHTML = modifiedUrl;

            const element = document.getElementById('url-display');
            const marker = await getMarkerByID('Cheap_Domain');

            getMessage(element, dataIndex, marker);

            foundValue = true;
        }
    }

    return foundValue;
}

async function checkTLDNumber(url) {
    var foundValue = false;

    const urlObject = new URL(url);

    const hostname = urlObject.hostname;
    const splitHostname = hostname.startsWith('www.') ? hostname.substring(4).split('.') : hostname.split('.');
    
    // No TLD found
    if (splitHostname.length <= 1) {
        return foundValue;
    }

    let numberOfTLDs = 0;
    const tlds = [];
    const tldRegex = /^[a-zA-Z0-9]+$/;
    
    for (let i = splitHostname.length - 1; i >= 1; i--) {
        if (splitHostname[i] !== '' && tldRegex.test(splitHostname[i])) {
            numberOfTLDs++;
            tlds.push(splitHostname[i]);
        } else {
            break;
        }
    }

    if (numberOfTLDs > 1) {
        tlds.forEach(async tld => {
            const index = modifiedUrl.indexOf(tld);
            modifiedUrl = modifyUrlPart(modifiedUrl, index, tld.length);

            document.getElementById('url-display').innerHTML = modifiedUrl;

            const element = document.getElementById('url-display');
            const marker = await getMarkerByID('Cheap_Domain');

            getMessage(element, dataIndex, marker);
        });

        foundValue = true;
    }

    return foundValue;
}

async function checkAtSymbol() {
    const atSymbol = '@';

    var foundValue = false;

    if (modifiedUrl.includes(atSymbol)) {
        var index = modifiedUrl.indexOf(atSymbol);
        modifiedUrl = modifyUrlSymbol(modifiedUrl, index);

        document.getElementById('url-display').innerHTML = modifiedUrl;

        const element = document.getElementById('url-display');
        const marker = await getMarkerByID('At_Sign');

        getMessage(element, dataIndex, marker);

        foundValue = true;
    }

    return foundValue;
}

function checkDotsDashes() {
    var foundValue = false;

    let dashCount = 0;
    let dotCount = 0;

    var dashIndexes = [];
    var dotIndexes = [];

    for (let i = 0; i < modifiedUrl.length; i++) {
        if (modifiedUrl[i] === '-') {
            dashCount++;
            dashIndexes.push(i);
        }
        if (modifiedUrl[i] === '.') {
            dotCount++;
            dotIndexes.push(i);
        
        }
    }

    if (dashCount > 3) {
        foundValue = true;
        var count = 0;

        dashIndexes.forEach(dash => {
            modifiedUrl = modifyUrlSymbol(modifiedUrl, dash + count);
            count += dangerousSymbolStart.length + dangerousSymbolEnd.length;
        });
    }

    if (dotCount > 4) {
        foundValue = true;
        var count = 0;

        dotIndexes.forEach(dot => {
            modifiedUrl = modifyUrlSymbol(modifiedUrl, dot + count);
            count += dangerousSymbolStart.length + dangerousSymbolEnd.length;
        });
    }

    return foundValue;
}

function checkSSLCertificate() {
    const sslCertificate = 'https://';

    return modifiedUrl.startsWith(sslCertificate);
}

async function checkIPAdress(url) {
    var foundValue = false;
    // Regex for IPv4
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    
    // Regex for IPv6
    const ipv6Regex = /(?:^|\s)(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}(?:$|\s)/i;

    const ipv4Match = url.match(ipv4Regex);
    logMessage(ipv4Match);

    if (ipv4Match) {
        var index = modifiedUrl.indexOf(ipv4Match[0]);
        var length = index + ipv4Match.length;
        modifiedUrl = modifyUrlPart(modifiedUrl, index, length);

        document.getElementById('url-display').innerHTML = modifiedUrl;

        const element = document.getElementById('url-display');
        const marker = await getMarkerByID('IP_Adress');

        getMessage(element, dataIndex, marker);
        
        foundValue = true;
    }

    const ipv6Match = modifiedUrl.match(ipv6Regex);
    if (ipv6Match) {
        var index = modifiedUrl.indexOf(ipv6Match[0]);
        modifiedUrl = modifyUrlPart(modifiedUrl, index, ipv6Match.length);

        document.getElementById('url-display').innerHTML = modifiedUrl;

        const element = document.getElementById('url-display');
        const marker = await getMarkerByID('IP_Adress');

        getMessage(element, dataIndex, marker);
        
        foundValue = true;
    }

    return foundValue;
}

async function checkPrefixSufix(url) {
    const words = ['saugus', 'patvirtinimas', 'nemokamas', 'ispardavimas', 'parama', 'mokestis'];

    var foundValue = false;

    for (const word of words) {
        if(url.includes(word)) {
            var index = modifiedUrl.indexOf(word);

            modifiedUrl = modifyUrlPart(modifiedUrl, index, word.length);

            document.getElementById('url-display').innerHTML = modifiedUrl;

            const element = document.getElementById('url-display');
            const marker = await getMarkerByID('Suffix_Prefix');

            getMessage(element, dataIndex, marker);

            foundValue = true;
            break;
        }
    }
    
    return foundValue;
}

// Highlightening dangerous parts of URL
function modifyUrlPart(url, index, length, dataIndex) {
    const span = `<span class="dangerousSymbol" dataIndex="${dataIndex}">`;
    dataIndex++;
    return url.substring(0, index) +  span + url.substring(index, index + length) + '</span>' + url.substring(index + length);
}

// Highlightening dangerous symbol of URL
function modifyUrlSymbol(url, index, dataIndex){
    const span = `<span class="dangerousSymbol" dataIndex="${dataIndex}">`;
    dataIndex++;
    return url.substring(0, index) + span + url.charAt(index) + '</span>' + url.substring(index + 1);
}

// Helper function to check if given website exists
async function checkWebsiteExistence(url){
    // try{
    //     const response = await fetch(url);
    //     return response.ok;
    //     }
    // catch (error){
    //     console.error('Error checking existence', error.message || error.toString());
    // }
    try {
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
            console.log('URL exists:', url);
            return true;
        } else {
            console.log('URL does not exist:', url);
            return false;
        }
    } catch (error) {
        console.error('Error checking URL: ', url);
        return false;
    }

}

function logMessage(message){
    const logContainer = document.getElementById('log-container');
    const logMessage = document.createElement('div');
    logMessage.textContent = message;
    logContainer.appendChild(logMessage);
}

function getMessage(element, dataIndex, marker){
    const spanElements = element.querySelectorAll('span.dangerousSymbol');

    spanElements.forEach(spanElement => {
        const dataIndexElement = parseInt(spanElement.getAttribute('dataIndex'));

        if (dataIndex === dataIndexElement){
            const spanBox = spanElement.getBoundingClientRect();
            const x = spanBox.left + 10;
            const y = spanBox.top - 25;

            showMessage(x, y, marker);
        }
    });
}

function showMessage(x, y, marker){
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');
    messageBox.style.left = `${x}px`;
    messageBox.style.top = `${y}px`;
    messageBox.width = 200;
    messageBox.height = 200;

    messageBox.style.display = 'block';
    messageBox.textContent = marker;

    document.body.appendChild(messageBox);
}