//Script file for modifying information, looking for phishing signs

let modifiedUrl = '';

const sslCertificate = false;
const dangerousSymbolStart = '<span class="dangerousSymbol">';
const dangerousSymbolEnd = '</span>';

// Displaying the URL of the current active tab
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    console.log('SIUNCIAM');
    // Send message to background script with the URL
    chrome.runtime.sendMessage({ action: 'getURL', url: url }, (response) => {
        console.log('GAVOM ATSAKA');

        if (response.success){
            const currentUrl = url;

            modifiedUrl = currentUrl;

            if (checkPhishingSigns())
            {
                document.getElementById('url-display').innerHTML = modifiedUrl;
                console.log('Checking');
            } 
        }
    });
});

// Checking for defined phishing signs
function checkPhishingSigns(){
    var phishing = false;
    var url = modifiedUrl;

    //TBA add collapsibles and markers inside of this
    if (checkPlagiarisedLetter()){
        logMessage('Rasta plagijuota raidė');
        phishing = true;
    }

    if (checkLongUrl()){
        logMessage('Rastas ilgas URL');
        phishing = true;
    }

    if (checkUrlShorteners()){
        logMessage('Rastas URL trumpintojas');
        phishing = true;
    }

    if (checkNativeTLD(url)){
        logMessage('Rastas ne šalies aukščiausio lygio domenas');
        phishing = true;
    }

    if (checkCheapTLD(url)){
        logMessage('Rastas pigus aukščiausio lygio domenas');
        phishing = true;
    }

    if (checkTLDNumber(url)){
        logMessage('Rastas daugiau nei vienas TLD');
        phishing = true;
    }

    if(checkAtSymbol()){
        logMessage('Rastas @ simbolis');
        phishing = true;
    }

    if (checkDotsDashes()){
        logMessage('Rastas didelis brūkšnelių ir taškų skaičius');
        phishing = true;
    }

    if(!checkSSLCertificate(url)){
        logMessage('SSL Sertifikatas nerastas');
        phishing = true;
    }

    if (checkIPAdress(url)){
        logMessage('Rastas IP adresas');
        phishing = true;
    }

    if (checkPrefixSufix(url)){
        logMessage('Rastas pridėtinis žodis');
        phishing = true;
    }

    return phishing;
    
}

function checkPlagiarisedLetter(){
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    var foundValue = false;

    if (!checkIPAdress(modifiedUrl)){

        for (const character of plagiarisedLetters){

            if (modifiedUrl.includes(character)){
                var index = modifiedUrl.indexOf(character);
                
                for (const replaced of replacePlagiarisedLetter[character])
                {
                    const modify = modifiedUrl.substring(0, index) + replaced + modifiedUrl.substring(index + 1);
                    
                    if (checkWebsiteExistence(modify)){
                        modifiedUrl = modifyUrlSymbol(modifiedUrl, index);

                        foundValue = true;
                        break;
                    }
                }
            }
        }
    }    

    return foundValue;
}

function checkLongUrl(){
    var foundValue = false;

    const longUrl = 54;
    var regex = /(?:https?:\/\/)?(?:www\.)?/;
    
    var cleanedUrl = modifiedUrl.replace(regex, "");
    if (cleanedUrl.length >= longUrl){
        foundValue = true;
    }

    return foundValue;
}

function checkUrlShorteners(){
    const urlShorteners = ['tinyurl.com', 'qrco.de', 'shorturl.at', 'bit.ly'];
    var foundValue = false;

    for (const shortener of urlShorteners){
        if (modifiedUrl.includes(shortener)){
            var index = modifiedUrl.indexOf(shortener);

            modifiedUrl = modifyUrlPart(modifiedUrl, index, shortener.length);
            foundValue = true;
            break;
        }
    }

    return foundValue;
}

function checkNativeTLD(url){
    let nativeTLD = 'lt';

    var foundValue = false;
    
    if (!checkUrlShorteners(url) && !checkCheapTLD(url)){
        const urlObject = new URL(url);
        let hostname = urlObject.hostname;
        const splitHostname = hostname.split('.');
        const oldTLD  = splitHostname.pop().toString();

        if (oldTLD !== nativeTLD)
        {
            // Assigning the native TLD, to see if a website like that exists
            splitHostname.push(nativeTLD);
            hostname = splitHostname.join('.');
            urlObject.hostname = hostname;

            var newUrl = urlObject.href;

            if (checkWebsiteExistence(newUrl)){
                var index = modifiedUrl.indexOf(oldTLD);
                modifiedUrl = modifyUrlPart(modifiedUrl, index, oldTLD.length);
                
                foundValue = true;
            }
        }
    }

    return foundValue;
}

function checkCheapTLD(url){
    const cheapTLDs = ['xyz', 'info', 'cf', 'gq', 'ml', 'tk', 'ga'];
    var foundValue = false;

    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    const splitHostname = hostname.split('.');
    const tld  = splitHostname.pop().toString();

    for (const cheap of cheapTLDs){
        if (tld === cheap){
            var index = modifiedUrl.indexOf(cheap);
            modifiedUrl = modifyUrlPart(modifiedUrl, index, tld.length);

            foundValue = true;
        }
    }

    return foundValue;
}

function checkTLDNumber(url){
    var foundValue = false;

    const urlObject = new URL(url);

    const hostname = urlObject.hostname;
    const splitHostname = hostname.startsWith('www.') ? hostname.substring(4).split('.') : hostname.split('.');
    
    // No TLD found
    if (splitHostname.length <= 1){
        return foundValue;
    }

    let numberOfTLDs = 0;
    const tlds = [];
    const tldRegex = /^[a-zA-Z0-9]+$/;
    
    for (let i = splitHostname.length - 1; i >= 1; i--){
        if (splitHostname[i] !== '' && tldRegex.test(splitHostname[i])){
            numberOfTLDs++;
            tlds.push(splitHostname[i]);
        } else {
            break;
        }
    }

    if (numberOfTLDs > 1){
        tlds.forEach(tld =>{
            const index = modifiedUrl.indexOf(tld);
            modifiedUrl = modifyUrlPart(modifiedUrl, index, tld.length);
        });

        foundValue = true;
    }

    return foundValue;
}

function checkAtSymbol(){
    const atSymbol = '@';

    var foundValue = false;

    if (modifiedUrl.includes(atSymbol)){
        var index = modifiedUrl.indexOf(atSymbol);
        modifiedUrl = modifyUrlSymbol(modifiedUrl, index);

        foundValue = true;
    }

    return foundValue;
}

function checkDotsDashes(){
    var foundValue = false;

    let dashCount = 0;
    let dotCount = 0;

    var dashIndexes = [];
    var dotIndexes = [];

    for (let i = 0; i < modifiedUrl.length; i++){
        if (modifiedUrl[i] === '-'){
            dashCount++;
            dashIndexes.push(i);
        }
        if (modifiedUrl[i] === '.'){
            dotCount++;
            dotIndexes.push(i);
        
        }
    }

    if (dashCount > 3){
        foundValue = true;
        var count = 0;

        dashIndexes.forEach(dash => {
            modifiedUrl = modifyUrlSymbol(modifiedUrl, dash + count);
            count += dangerousSymbolStart.length + dangerousSymbolEnd.length;
        });
    }

    if (dotCount > 4){
        foundValue = true;
        var count = 0;

        dotIndexes.forEach(dot =>{
            modifiedUrl = modifyUrlSymbol(modifiedUrl, dot + count);
            count += dangerousSymbolStart.length + dangerousSymbolEnd.length;
        });
    }

    return foundValue;
}

function checkSSLCertificate(){
    const sslCertificate = 'https://';

    return modifiedUrl.startsWith(sslCertificate);
}

function checkIPAdress(url){
    var foundValue = false;
    // Regex for IPv4
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    
    // Regex for IPv6
    const ipv6Regex = /(?:^|\s)(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}(?:$|\s)/i;

    const ipv4Match = url.match(ipv4Regex);
    logMessage(ipv4Match);
    if (ipv4Match){
        var index = modifiedUrl.indexOf(ipv4Match[0]);
        var length = index + ipv4Match.length;
        modifiedUrl = modifyUrlPart(modifiedUrl, index, length);
        
        foundValue = true;
    }

    const ipv6Match = modifiedUrl.match(ipv6Regex);
    if (ipv6Match){
        var index = modifiedUrl.indexOf(ipv6Match[0]);
        modifiedUrl = modifyUrlPart(modifiedUrl, index, ipv6Match.length);
        
        foundValue = true;
    }

    return foundValue;
}

function checkPrefixSufix(url){
    const words = ['saugus', 'patvirtinimas', 'nemokamas', 'ispardavimas', 'parama'];

    var foundValue = false;

    for (const word of words){
        if(url.includes(word)){
            var index = modifiedUrl.indexOf(word);

            modifiedUrl = modifyUrlPart(modifiedUrl, index, word.length);
            foundValue = true;
            break;
        }
    }
    
    return foundValue;
}

function modifyUrlPart(url, index, length){
    return url.substring(0, index) + dangerousSymbolStart + url.substring(index, index + length) + dangerousSymbolEnd + url.substring(index + length);
}

// Highlightening dangerous parts of URL
function modifyUrlSymbol(url, index){
    return url.substring(0, index) + dangerousSymbolStart + url.charAt(index) + dangerousSymbolEnd + url.substring(index + 1);
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