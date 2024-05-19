// Reason to check if there are no URL shorteners in URL

import { modifiedUrl, dataIndex, updateUrl, modifyUrlPart } from "../page.js";
import { reasons } from "./phishingReasonArray.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";


export async function checkUrlShorteners() {
   const urlShorteners = ['tinyurl.com', 'qrco.de', 'shorturl.at', 'bit.ly'];
   var foundValue = false;

   for (const shortener of urlShorteners) {
      if (modifiedUrl.includes(shortener)) {
         var index = modifiedUrl.indexOf(shortener);
         var dIndex = dataIndex;

         var url = modifyUrlPart(modifiedUrl, index, shortener.length, dIndex);

         updateUrl(url);

         reasons.push('URL_Shortener');

         await callMarkerMessage('URL_Shortener', modifiedUrl, dIndex);
         await callCollapsible('URL_Shortener');

         foundValue = true;
         break;
      }
   }

   return foundValue;
}