// Reason to check if URL does not have at sign @ 

import { modifiedUrl, dataIndex, updateUrl, modifyUrlSymbol } from "../page.js";
import { reasons } from "./phishingReasonArray.js";
import { callMarkerMessage } from "../panelAdditions/markerMessageAddition.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";
import { showTrueURL } from "../panelAdditions/trueURLAddition.js";

export async function checkAtSymbol(url) {
   const atSymbol = '@';

   var foundValue = false;

   if (modifiedUrl.includes(atSymbol)) {
      var index = modifiedUrl.indexOf(atSymbol);
      var dIndex = dataIndex;

      var url2 = modifyUrlSymbol(modifiedUrl, index, dIndex);

      updateUrl(url2);

      var splitUrl = 'https://' + url.split('@')[1];

      showTrueURL(splitUrl, 'At_Sign');

      await callMarkerMessage('At_Sign', modifiedUrl, dIndex);
      await callCollapsible('At_Sign');

      reasons.push('At_Sign');
      foundValue = true;
   }

   return foundValue;
}