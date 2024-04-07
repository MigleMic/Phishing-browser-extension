//Script file for modifying information, looking for phishing signs

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

            if (checkPhishingSigns(currentUrl))
            {
                console.log('Checking');
            } 
        }
    });
});

// Checking for defined phishing signs
function checkPhishingSigns(url){
    var phishing = false;

    //TBA add collapsibles and markers inside of this
    if (checkPlagiarisedLetter(url)){
        logMessage('Rasta plagijuota raidė');
        phishing = true;
    }

    if (checkLongUrl(url)){
        logMessage('Rastas ilgas URL');
        phishing = true;
    }

    if (checkUrlShorteners(url)){
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

    if(checkAtSymbol(url)){
        logMessage('Rastas @ simbolis');
        phishing = true;
    }

    if (checkDotsDashes(url)){
        logMessage('Rastas didelis brūkšnelių ir taškų skaičius');
        phishing = true;
    }
    
    return phishing;
}

function checkPlagiarisedLetter(url){
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    var foundValue = false;

    for (const character of plagiarisedLetters){
        logMessage('simbolis' + character);

        if (url.includes(character)){
            var index = url.indexOf(character);
            
            for (const replaced of replacePlagiarisedLetter[character])
            {
                logMessage('modify ' + replaced);
                const modifiedUrl = url.substring(0, index) + replaced + url.substring(index + 1);
                
                if (checkWebsiteExistence(modifiedUrl)){
                    //Čia reiktų įdėti marker
                    logMessage('URL su raide - ' +  modifiedUrl);
                    
                    var newUrl = modifyUrlSymbol(url, index);
                    document.getElementById('url-display').innerHTML = newUrl;
                    foundValue = true;
                }
            }
        }
    }

    return foundValue;
}

function checkLongUrl(url){
    var foundValue = false;

    const longUrl = 54;
    var regex = /(?:https?:\/\/)?(?:www\.)?/;
    
    var cleanedUrl = url.replace(regex, "");
    if (cleanedUrl.length >= longUrl){
        document.getElementById('url-display').textContent = url;
        
        foundValue = true;
    }

    return foundValue;
}

function checkUrlShorteners(url){
    const urlShorteners = ['tinyurl.com', 'qrco.de', 'shorturl.at', 'bit.ly'];
    var foundValue = false;

    for (const shortener of urlShorteners){
        if (url.includes(shortener)){
            var index = url.indexOf(shortener);
            var newUrl = modifyUrlPart(url, index, shortener.length);
            
            document.getElementById('url-display').innerHTML = newUrl;
            foundValue = true;
        }
    }

    return foundValue;
}

function checkNativeTLD(url){
    let nativeTLD = 'lt';

    var foundValue = false;
    
    if (!checkUrlShorteners(url)){
        const urlObject = new URL(url);
        let hostname = urlObject.hostname;
        const splitHostname = hostname.split('.');
        const oldTLD  = splitHostname.pop().toString();

        if (oldTLD !== nativeTLD)
        {
            logMessage('URL su TLD - ' +  urlObject);
            // Assigning the native TLD, to see if a website like that exists
            splitHostname.push(nativeTLD);
            hostname = splitHostname.join('.');
            urlObject.hostname = hostname;

            var newUrl = urlObject.href;

            if (checkWebsiteExistence(newUrl)){
                var index = url.indexOf(oldTLD);
                var modifiedUrl = modifyUrlPart(url, index, oldTLD.length);
                
                document.getElementById('url-display').innerHTML = modifiedUrl;
                
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
            var index = url.indexOf(cheap);
            var newUrl = modifyUrlPart(url, index, tld.length);
            document.getElementById('url-display').innerHTML = newUrl;

            foundValue = true;
        }
    }

    return foundValue;
}

function checkTLDNumber(url){
    var foundValue = false;

    const urlObject = new URL(url);

    const hostname = urlObject.hostname;
    const splitHostname = hostname.split('.');
    
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
            const index = url.indexOf(tld);
            var newUrl = modifyUrlPart(url, index, tld.length);
            document.getElementById('url-display').innerHTML = newUrl;
        });
        foundValue = true;
    }

    return foundValue;
}

function checkAtSymbol(url){
    const atSymbol = '@';

    var foundValue = false;

    if (url.includes(atSymbol)){
        var index = url.indexOf(atSymbol);
        var newUrl = modifyUrlSymbol(url, index);

        document.getElementById('url-display').innerHTML = newUrl;

        foundValue = true;
    }

    return foundValue;
}

function checkDotsDashes(url){
    var foundValue = false;

    let dashCount = 0;
    let dotCount = 0;

    const dashIndexes = [];
    const dotIndexes = [];

    for (let i = 0; i < url.length; i++){
        if (url[i] === '-'){
            dashCount++;
            dashIndexes.push(i);
        }
        if (url[i] === '.'){
            dotCount++;
            dotIndexes.push(i);
        }
    }

    if (dashCount > 3){
        dashIndexes.forEach(dash =>{
            var modifyUrl = modifyUrlSymbol(url, dash);
            document.getElementById('url-display').innerHTML = modifyUrl;
        });
        foundValue = true;
    }

    if (dotCount > 4){
        dotIndexes.forEach(dot =>{
            var modifyUrl = modifyUrlSymbol(url, dot);
            document.getElementById('url-display').innerHTML = modifyUrl;
        });
        foundValue = true;
    }
    return foundValue;
}

function modifyUrlPart(url, index, length){
    return url.substring(0, index) + '<span class="dangerousSymbol">' + url.substring(index, index + length) + '</span>' + url.substring(index + length);
}

// Highlightening dangerous parts of URL
function modifyUrlSymbol(url, index){
    return url.substring(0, index) + '<span class="dangerousSymbol">' + url.charAt(index) + '</span>' + url.substring(index + 1);
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