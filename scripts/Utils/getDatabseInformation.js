// Extract information from database

import { insertToLoggerTable } from "./insertDatabaseInformation.js";

export async function getNameByID(id) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['PhishingReason'], 'readonly');
         var objectStore = transaction.objectStore('PhishingReason');

         var getRequest = objectStore.get(id);

         getRequest.onsuccess = function (event) {
            var data = event.target.result;

            if (data) {
               var name = data.Name;
               resolve(name);
            } else {
               reject('No data found for ID: ' + id);
               insertToLoggerTable('', 'No data found for ID: ' + id);
            }
         };

         getRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error getting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}

export async function getMarkerByID(id) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['PhishingReason'], 'readonly');
         var objectStore = transaction.objectStore('PhishingReason');

         var getRequest = objectStore.get(id);

         getRequest.onsuccess = function (event) {
            var data = event.target.result;

            if (data) {
               var markerValue = data.Marker;
               resolve(markerValue);
            } else {
               reject('No data found for ID: ' + id);
               insertToLoggerTable('', 'No data found for ID: ' + id);
            }
         };

         getRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error getting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}

export async function getDescriptionByID(id) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['PhishingReason'], 'readonly');
         var objectStore = transaction.objectStore('PhishingReason');

         var getRequest = objectStore.get(id);

         getRequest.onsuccess = function (event) {
            var data = event.target.result;

            if (data) {
               var descriptionString = data.Description;
               resolve(descriptionString);
            } else {
               resolve('');
               insertToLoggerTable('', 'No data found for ID: ' + id);
            }
         };

         getRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error getting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}

export async function getSampleByID(id) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['PhishingSample'], 'readonly');
         var objectStore = transaction.objectStore('PhishingSample');

         var index = objectStore.index('ReasonID');
         var getRequest = index.get(id);

         getRequest.onsuccess = function (event) {
            var data = event.target.result;

            if (data) {
               var sampleString = data.Sample;
               resolve(sampleString);
            } else {
               resolve('');
               insertToLoggerTable('', 'No data found for ID: ' + id);
            }
         };

         getRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error getting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}

export async function getUrlsByID(id) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['PhishingSample'], 'readonly');
         var objectStore = transaction.objectStore('PhishingSample');

         var urls = [];
         var cursorRequest = objectStore.openCursor();

         cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor) {
               if (cursor.value && cursor.value.Reason_ID === id) {
                  urls.push(cursor.value.URL);
               }
               cursor.continue();

            } else {
               if (urls.length > 0) {
                  resolve(urls);
               } else {
                  resolve('');
                  insertToLoggerTable('', 'No data found for ID: ' + id);
               }
            }
         };

         cursorRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error getting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}