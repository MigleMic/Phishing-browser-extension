// Reason to check if URL does not have more dots and dashes than is considered safe
import { modifiedUrl, dataIndex, modifyUrlSymbol, updateUrl, modifyUrl } from "../page.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";
import { reasons } from "./phishingReasonArray.js";

export async function checkDotsDashes() {
   var foundValue = false;

   let dashCount = 0;
   let dotCount = 0;

   var dashIndexes = [];
   var dotIndexes = [];

   for (let i = 0; i < modifiedUrl.length; i++) {
      if (modifiedUrl[i] === '-') {
         dashCount++;
         dashIndexes.push(i);
      }
      if (modifiedUrl[i] === '.') {
         dotCount++;
         dotIndexes.push(i);

      }
   }

   var dangerousSymbolStart = '<span class="dangerousSymbol" dataIndex="1">';
   var dangerousSymbolEnd = '</span>';

   if (dashCount > 3) {
      foundValue = true;
      var count = 0;

      for (const dash of dashIndexes) {
         var dIndex = dataIndex;

         var url2 = modifyUrlSymbol(modifiedUrl, dash + count, dIndex);

         updateUrl(url2);

         count += dangerousSymbolStart.length + dangerousSymbolEnd.length;

         modifyUrl(url2);
      }
      reasons.push('Dot_Dash');
   }

   if (dotCount > 4) {
      foundValue = true;
      var count = 0;

      for (const dot of dotIndexes) {
         var dIndex = dataIndex;

         var url2 = modifyUrlSymbol(modifiedUrl, dot + count, dIndex);

         updateUrl(url2);

         count += dangerousSymbolStart.length + dangerousSymbolEnd.length;

         modifyUrl(url2);
      }
      reasons.push('Dot_Dash');
   }

   if (foundValue) {
      await callCollapsible('Dot_Dash');
   }

   return foundValue;
}