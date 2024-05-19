// Reason to see if URL uses not native TLD

import { reasons } from "./phishingReasonArray.js";
import { checkWebsiteExistence } from "../Utils/additionalUtils.js";
import { modifiedUrl, dataIndex, modifyUrlPart, updateUrl } from "../page.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";
import { showTrueURL } from "../panelAdditions/trueURLAddition.js";

export async function checkNativeTLD(url) {
   let nativeTLD = 'lt';

   var foundValue = false;

   if (!reasons.includes('URL_Shortener') && !reasons.includes('Cheap_TLD')) {
      const urlObject = new URL(url);
      let hostname = urlObject.hostname;
      const splitHostname = hostname.split('.');
      const oldTLD = splitHostname.pop().toString();

      if (oldTLD !== nativeTLD) {
         // Assigning the native TLD, to see if a website like that exists
         splitHostname.push(nativeTLD);
         hostname = splitHostname.join('.');
         urlObject.hostname = hostname;

         var newUrl = urlObject.href;

         if (await checkWebsiteExistence(newUrl)) {
            var index = modifiedUrl.indexOf(oldTLD);
            var dIndex = dataIndex;

            var url2 = modifyUrlPart(modifiedUrl, index, oldTLD.length, dIndex);

            updateUrl(url2);

            showTrueURL(newUrl, 'Native_TLD');

            reasons.push('Native_TLD');

            await callMarkerMessage('Native_TLD', modifiedUrl, dIndex);
            await callCollapsible('Native_TLD');

            foundValue = true;
         }
      }
   }

   return foundValue;
}