// Reason to check if URL has additional prefix and sufix

import { modifiedUrl, dataIndex, modifyUrlPart, updateUrl } from "../page.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { reasons } from "./phishingReasonArray.js";

export async function checkPrefixSufix(url) {
    const words = ['saugus', 'patvirtinimas', 'nemokamas', 'ispardavimas', 'parama', 'mokestis'];

    var foundValue = false;

    for (const word of words) {
        if(url.includes(word)) {
            var index = modifiedUrl.indexOf(word);
            var dIndex = dataIndex;

            var url2 = modifyUrlPart(modifiedUrl, index, word.length, dIndex);

            updateUrl(url2);

            await callMarkerMessage('Suffix_Prefix', modifiedUrl, dIndex);
            
            reasons.push('Suffix_Prefix');
            
            foundValue = true;
            break;
        }
    }
    
    return foundValue;
}