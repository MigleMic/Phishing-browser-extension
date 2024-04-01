//Script file for modifying information, looking for phishing signs

// Displaying the URL of the current active tab
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    console.log('SIUNCIAM');
    // Send message to background script with the URL
    chrome.runtime.sendMessage({ action: 'getURL', url: url }, (response) => {
        console.log('GAVOM ATSAKA');
        if(response.success){
            const currentUrl = url;
            if(checkPhishingSigns(currentUrl))
            {
                document.getElementById('url-display').textContent = currentUrl;
            } 
        }
    });
});

// Checking for defined phishing signs
function checkPhishingSigns(url){
    //TBA add collapsibles and markers
    console.log('CHECKING');
    if(checkPlagiarisedLetter(url)){
        console.log('Rasta plagijuota raidė');
            return true;
    }
    if(checkLongUrl(url)){
        console.log('Rastas ilgas URL');
        return true;
    }
    if(checkUrlShorteners(url)){
        console.log('Rastas URL trumpintojas');
        return true;
    }
    if(checkNativeTLD(url)){
        console.log('Rastas ne šalies aukščiausio lygio domenas');
    }
    return false;
}

function checkPlagiarisedLetter(url){
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    for (const character of plagiarisedLetters){
        if (url.includes(character)){
            var index = url.indexOf(character);
            for (const replaced of replacePlagiarisedLetter[character])
            {
                const modifiedUrl = url.replace(new RegExp(replaced, 'g'), character);
                if(checkWebsiteExistence(modifiedUrl)){
                    //Čia reiktų įdėti marker
                    console.log('URL su raide - ', url);
                    var newUrl = modifyUrlSymbol(url, index);
                    document.getElementById('url-display').innerHTML = newUrl;
                    return;
                }
            }
        }
    }
    return false;
}

function checkLongUrl(url){
    const longUrl = 54;
    var regex = /(?:https?:\/\/)?(?:www\.)?/;
    
    var cleanedUrl = url.replace(regex, "");
    if(cleanedUrl.length >= 54){
        return true;
    }
    return false;
}

function checkUrlShorteners(url){
    const urlShorteners = ['tinyurl.com', 'qrco.de', 'shorturl.at', 'bit.ly'];

    for (const shortener of urlShorteners){
        if(url.includes(shortener)){
            var index = url.indexOf(shortener);
            var newUrl = modifyUrlPart(url, index, shortener.length);
            document.getElementById('url-display').innerHTML = newUrl;
            return;
        }
    }
    return false;
}

function checkNativeTLD(url){
    let nativeTLD = 'lt';
    
    if(!checkUrlShorteners(url))
    {
        const urlObject = new URL(url);
        let hostname = urlObject.hostname;
        const splitHostname = hostname.split('.');
        const oldTLD  = splitHostname.pop().toString();

        if(oldTLD !== nativeTLD)
        {
            console.log('URL su TLD - ', urlObject);
            // Assigning the native TLD, to see if a website like that exists
            splitHostname.push(nativeTLD);
            hostname = splitHostname.join('.');
            urlObject.hostname = hostname;

            var newUrl = urlObject.href;

            if(checkWebsiteExistence(newUrl)){
                var index = url.indexOf(oldTLD);
                var modifiedUrl = modifyUrlPart(url, index, oldTLD.length);
                document.getElementById('url-display').innerHTML = modifiedUrl;
                return true;
            }
        }
    }
    return false;
}

function modifyUrlPart(url, index, length){
    return url.substring(0, index) + '<span class="dangerousSymbol">' + url.substring(index, index + length) + '</span>' + url.substring(index + length + 1);
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