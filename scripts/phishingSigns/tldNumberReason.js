// Reason to count the number of TLDs inside URL 

import { modifiedUrl, dataIndex, updateUrl, modifyUrlPart } from "../page.js";
import { reasons } from "./phishingReasonArray.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";

export async function checkTLDNumber(url) {
   var foundValue = false;

   const ignorePatterns = /^(https?:\/\/www\.|https\/\/www\.|https?:\/\/|http:\/\/|www\.)/;
   let splitUrl = url;

   splitUrl = splitUrl.replace(ignorePatterns, '');

   splitUrl = splitUrl.split('/')[0];

   const urlObject = new URL(url);

   let hostname = urlObject.hostname;

   if (hostname.startsWith('www')) {
      hostname = hostname.substring(4);
   }

   let splitHostname = hostname.split('.');

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
      let markerAdded = false;

      for (const tld of tlds) {
         const index = modifiedUrl.indexOf(tld);
         var dIndex = dataIndex;

         var url2 = modifyUrlPart(modifiedUrl, index, tld.length, dIndex);

         updateUrl(url2);

         if (!markerAdded) {
            await callMarkerMessage('Many_TLD', modifiedUrl, dIndex);
            await callCollapsible('Many_TLD');
            markerAdded = true;
         }
      }
      reasons.push('Many_TLD');
      foundValue = true;
   }

   return foundValue;
}