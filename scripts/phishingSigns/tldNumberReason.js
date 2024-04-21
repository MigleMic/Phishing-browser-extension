// Reason to count the number of TLDs inside URL 

import { modifiedUrl, dataIndex, updateUrl, modifyUrlPart } from "../page.js";
import { reasons } from "./phishingReasonArray.js";
import { callMarkerMessage } from "../markerMessageAddition.js";

export async function checkTLDNumber(url) {
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
        if (!reasons.includes('IP_Address')) {
            let markerAdded = false;

            for (const tld of tlds) {
                const index = modifiedUrl.indexOf(tld);
                var dIndex = dataIndex;

                var url2 = modifyUrlPart(modifiedUrl, index, tld.length, dIndex);
                
                updateUrl(url2);

                if (!markerAdded) {
                    await callMarkerMessage('Many_TLD', modifiedUrl, dIndex);

                    markerAdded = true;
                }
            }
            reasons.push('Many_TLD');
            foundValue = true;
        }
    }

    return foundValue;
}