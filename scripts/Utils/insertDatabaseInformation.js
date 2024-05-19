// Adding new data to table 

export async function insertToLoggerTable(error, message) {
   return new Promise((resolve, reject) => {
      var request = window.indexedDB.open('PhishingDatabase', 1);

      request.onsuccess = function (event) {
         var db = event.target.result;
         var transaction = db.transaction(['ExtensionLogger'], 'readwrite');
         var objectStore = transaction.objectStore('ExtensionLogger');

         var id = generateID();
         var timestamp = new Date().getTime();

         var insertData = { ID: id, Timestamp: timestamp, Error: error, Message: message };
         var postRequest = objectStore.add(insertData);

         postRequest.onerror = function (event) {
            reject(event.target.error);
            insertToLoggerTable(event.target.error, 'Error posting data');
         };
      };

      request.onerror = function (event) {
         reject(event.target.error);
         insertToLoggerTable(event.target.error, 'Error opening database');
      };
   });
}

function generateID() {
   var randomNumber = Math.floor(Math.random() * 1000);
   var timestamp = new Date().getTime();

   var id = timestamp.toString() + randomNumber.toString();

   return id;
}