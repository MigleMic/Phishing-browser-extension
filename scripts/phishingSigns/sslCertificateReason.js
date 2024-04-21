// Reason to check if URL has SSL certificate

import { reasons } from "./phishingReasonArray.js";
import { modifiedUrl } from "../page.js";

export function checkSSLCertificate() {
    const sslCertificate = 'https://';

    reasons.push('SSL_Certificate');

    return modifiedUrl.startsWith(sslCertificate);
}
