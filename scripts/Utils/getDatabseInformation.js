// Extract information from database

import { insertToLoggerTable } from "./insertDatabaseInformation.js";


export async function getMarkerByID(id) {
    return new Promise((resolve, reject) => {
        var request = window.indexedDB.open('PhishingDatabase', 1);

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(['PhishingReason'], 'readonly');
            var objectStore = transaction.objectStore('PhishingReason');

            var getRequest = objectStore.get(id);

            getRequest.onsuccess = function(event) {
                var data = event.target.result;

                if (data) {
                    var markerValue = data.Marker;
                    resolve(markerValue);
                } else {
                    reject('No data found for ID: ' + id);
                    insertToLoggerTable('', 'No data found for ID: ' + id);
                }
            };

            getRequest.onerror = function(event) {
                reject(event.target.error);
                insertToLoggerTable(event.target.error, 'Error getting data');
            };
        };

        request.onerror = function(event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error opening database');
        };
    });
}