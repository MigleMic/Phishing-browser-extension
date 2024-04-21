// Reason to check if URL has a plagiarised letter

import { reasons } from "./phishingReasonArray.js";
import { modifiedUrl, dataIndex, modifyUrlSymbol, updateUrl } from "../page.js";
import { checkWebsiteExistence } from "../additionalUtils.js";
import { callMarkerMessage } from "../markerMessageAddition.js";

export async function checkPlagiarisedLetter() {
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    var foundValue = false;

    if (!reasons.includes('IP_Adress')) {
        for (const character of plagiarisedLetters) {
            if (modifiedUrl.includes(character)) {
                var index = modifiedUrl.indexOf(character);
                
                for (const replaced of replacePlagiarisedLetter[character]) {
                    const modify = modifiedUrl.substring(0, index) + replaced + modifiedUrl.substring(index + 1);
                    
                    if (await checkWebsiteExistence(modify)) {
                        var dIndex = dataIndex;
                        
                        var url  = modifyUrlSymbol(modifiedUrl, index, dIndex);

                        updateUrl(url);

                        reasons.push('Plagiarised_Letter');

                        await callMarkerMessage('Plagiarised_Letter', modifiedUrl, dIndex);

                        foundValue = true;
                        break;
                    }
                }
            }
        }
    }    

    return foundValue;
}