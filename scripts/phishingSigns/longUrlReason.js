// Reason to check if URL is not too long

import { reasons } from "./phishingReasonArray.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";

export async function checkLongUrl(url) {
   var foundValue = false;

   const longUrl = 54;
   var regex = /(?:https?:\/\/)?(?:www\.)?/;

   var cleanedUrl = url.replace(regex, "");
   if (cleanedUrl.length >= longUrl) {
      foundValue = true;
      reasons.push('URL_Length');
      await callCollapsible('URL_Length');
   }

   return foundValue;
}