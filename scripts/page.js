//Script file for modifying information, looking for phishing signs
let messageSent = false;

// Displaying the URL of the current active tab
document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get('url');

        if(checkPhishingSigns(url))
        {
            document.getElementById('url-display').textContent = url;
        } 
});

// Checking for defined phishing signs
function checkPhishingSigns(url){
    //TBA add collapsibles
    if(checkPlagiarisedLetter(url)){
        console.log("Rasta plagijuota raidė");
            return true;
    }
    if(checkLongUrl(url)){
        console.log("Rastas ilgas URL");
        return true;
    }
    if(checkUrlShorteners(url)){
        console.log("Rastas URL trumpintojas");
        return true;
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
                    var newUrl = modifyUrlSymbol(url, index);
                    document.getElementById('url-display').innerHTML = newUrl;
                }
            }
        }
    }
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
        }
    }
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
    try{
        const response = await fetch(url);
        return response.ok;
        }
    catch (error){
        console.error("Error checking existence", error.message || error.toString());
    }
}