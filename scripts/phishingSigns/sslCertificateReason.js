// Reason to check if URL has SSL certificate

import { reasons } from "./phishingReasonArray.js";
import { modifiedUrl } from "../page.js";
import { callCollapsible } from "../panelAdditions/collapsibleContentAddition.js";

export async function checkSSLCertificate() {
   const sslCertificate = 'https://';

   var foundValue = false;

   if (!modifiedUrl.startsWith(sslCertificate)) {
      reasons.push('SSL_Certificate');
      await callCollapsible('SSL_Certificate');
      foundValue = true;
   }

   return foundValue;
}