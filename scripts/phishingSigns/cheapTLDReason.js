// Reason to check if URL does not have cheap TLD

import { dataIndex, modifiedUrl, updateUrl, modifyUrlPart } from "../page.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { reasons } from "./phishingReasonArray.js";

export async function checkCheapTLD(url) {
    const cheapTLDs = ['xyz', 'info', 'cf', 'gq', 'ml', 'tk', 'ga'];
    var foundValue = false;

    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    const splitHostname = hostname.split('.');
    const tld  = splitHostname.pop().toString();

    for (const cheap of cheapTLDs) {
        if (tld === cheap) {
            var index = modifiedUrl.indexOf(cheap);
            var dIndex = dataIndex;

            var url2 = modifyUrlPart(modifiedUrl, index, tld.length, dIndex);

            updateUrl(url2);

            reasons.push('Cheap_TLD');

            await callMarkerMessage('Cheap_TLD', modifiedUrl, dIndex);
            
            foundValue = true;
            break;
        }
    }

    return foundValue;
}