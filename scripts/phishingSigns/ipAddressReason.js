// Reason to check if URL has an IP adress inside

import { reasons } from "./phishingReasonArray.js";
import { modifiedUrl, dataIndex, modifyUrlPart, updateUrl } from "../page.js";
import { callMarkerMessage } from "../markerMessageAddition.js";

export async function checkIPAddress(url) {
    var foundValue = false;
    // Regex for IPv4
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    
    // Regex for IPv6
    const ipv6Regex = /(?:^|\s)(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}(?:$|\s)/i;

    const ipv4Match = url.match(ipv4Regex);
    if (ipv4Match) {
        var index = modifiedUrl.indexOf(ipv4Match[0]);
        var length = index + ipv4Match.length;
        var dIndex = dataIndex;

        var url = modifyUrlPart(modifiedUrl, index, length, dIndex);

        updateUrl(url);

        reasons.push('IP_Address');

        await callMarkerMessage('IP_Address', modifiedUrl, dIndex);
        
        foundValue = true;
    }

    const ipv6Match = modifiedUrl.match(ipv6Regex);
    if (ipv6Match) {
        var index = modifiedUrl.indexOf(ipv6Match[0]);
        var length = index + ipv6Match.length;
        var dIndex = dataIndex;

        var url = modifyUrlPart(modifiedUrl, index, length, dIndex);

        updateUrl(url);

        reasons.push('IP_Address');

        await callMarkerMessage('IP_Address', modifiedUrl, dIndex);

        foundValue = true;
    }

    return foundValue;
}