// Reason to check if URL does not have at sign @ 

import { modifiedUrl, dataIndex, updateUrl, modifyUrlSymbol } from "../page.js";
import { reasons } from "./phishingReasonArray.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";

export async function checkAtSymbol() {
    const atSymbol = '@';

    var foundValue = false;

    if (modifiedUrl.includes(atSymbol)) {
        var index = modifiedUrl.indexOf(atSymbol);
        var dIndex = dataIndex;
        
        var url2 = modifyUrlSymbol(modifiedUrl, index, dIndex);

        updateUrl(url2);

        await callMarkerMessage('At_Sign', modifiedUrl, dIndex);
        
        reasons.push('At_Sign');
        foundValue = true;
    }

    return foundValue;
}