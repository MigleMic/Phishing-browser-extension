// Reason to check if URL has a plagiarised letter

import { reasons } from "./phishingReasonArray.js";
import { modifiedUrl, dataIndex, modifyUrlSymbol, updateUrl, modifyUrl } from "../page.js";
import { checkWebsiteExistence } from "../Utils/additionalUtils.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";
import { showTrueURL } from "../panelAdditions/trueURLAddition.js";

export async function checkPlagiarisedLetter() {
    const plagiarisedLetters = [0, 1, 3];
    const replacePlagiarisedLetter = {
        '1': ['l', 'i'],
        '0': ['o', 'O'],
        '3': ['e', 'E']
    };

    var foundValue = false;
    var plagiarisedLettersIndex = [];
    var plagiarisedLettersCount = 0;  

    if (!reasons.includes('IP_Adress')) {
        for (let i = 0; i < modifiedUrl.length; i++) {
            const character = modifiedUrl[i];

            if (character === '<' && modifiedUrl.substring(i).startsWith('<span')) {
                const spanEndIndex = modifiedUrl.indexOf('>', i);
                i = spanEndIndex;

                while (modifiedUrl[i] !== '<') {
                    i++;
                }
                continue;
            }

            if (plagiarisedLetters.includes(parseInt(character))) {
                for (const replaced of replacePlagiarisedLetter[character]) {
                    const modify = modifiedUrl.substring(0, i) + replaced + modifiedUrl.substring(i + 1);
                    
                    if (await checkWebsiteExistence(modify) && !reasons.includes('At_Sign')) {
                        showTrueURL(modify, 'Plagiarised_Letter');
                    }
                    
                    plagiarisedLettersIndex.push(i);
                    plagiarisedLettersCount++;
                        
                    foundValue = true;
                    break;
                }
            }
        }
    }

    if (plagiarisedLettersCount > 0) {
        var spanTextLength = 0;

        var dangerousSymbolStart = '<span class="dangerousSymbol" dataIndex="1">';
        var dangerousSymbolEnd = '</span>';

        for (const plagiarised of plagiarisedLettersIndex) {
            var dIndex = dataIndex;
            var url  = modifyUrlSymbol(modifiedUrl, plagiarised + spanTextLength, dIndex);

            updateUrl(url);

            spanTextLength += dangerousSymbolStart.length + dangerousSymbolEnd.length;

            await callMarkerMessage('Plagiarised_Letter', modifiedUrl, dIndex);
        }

        reasons.push('Plagiarised_Letter');
        await callCollapsible('Plagiarised_Letter');
    }

    return foundValue;
}