// Creating database and populating it

import { insertToLoggerTable } from "./insertDatabaseInformation.js";

let database = null;

// Database creation
export function create_database() {
   const request = indexedDB.open('PhishingDatabase');

   request.onerror = function (event) {
      insertToLoggerTable(event.target.error, 'Problem opening database');
   }

   request.onupgradeneeded = function (event) {
      database = event.target.result;

      // Table ExtensionLogger
      const logger = database.createObjectStore('ExtensionLogger', { keyPath: 'ID' });

      // The structure of ExtensionLogger
      logger.createIndex('TimestampIndex', 'Timestamp', { unique: false });
      logger.createIndex('ErrorIndex', 'Error', { unique: false });
      logger.createIndex('MessageIndex', 'Message', { unique: false });

      // Table PhishingReason
      const phishingReason = database.createObjectStore('PhishingReason', { keyPath: 'ID' });

      //The structure of PhishingReason
      phishingReason.createIndex('NameIndex', 'Name', { unique: true });
      phishingReason.createIndex('Description', 'Description', { unique: false });
      phishingReason.createIndex('MarkerIndex', 'Marker', { unique: true });

      // Table PhishingSample
      const phishingSample = database.createObjectStore('PhishingSample', { keyPath: 'ID' });

      // The structure of PhishingSample
      phishingSample.createIndex('ReasonID', 'Reason_ID', { unique: false });
      phishingSample.createIndex('URLIndex', 'URL', { unique: true });
      phishingSample.createIndex('SampleIndex', 'Sample', { unique: true });

      // Objects stores are created
      logger.transaction.oncomplete = function (event) {
         insertToLoggerTable('', 'Logger object store is created');
      }

      phishingReason.transaction.oncomplete = function (event) {
         insertToLoggerTable('', 'PhishingReason object store is created');
      }

      phishingSample.transaction.oncomplete = function (event) {
         insertToLoggerTable('PhishingSample object store is created');
      }

   }

   request.onsuccess = function (event) {
      database = event.target.result;
      insertToLoggerTable('', 'Database opened');

      checkAndInsertData(database);

      database.onerror = function (event) {
         insertToLoggerTable(event.target.error, 'Failed to open the database');
      }
   }
}

// Populating PhishingReason table with data
function insert_reason_data() {
   return new Promise((resolve, reject) => {
      const transactions = database.transaction(['PhishingReason'], 'readwrite');

      //Insert data to PhishingReason table
      const reasonStore = transactions.objectStore('PhishingReason');
      const reasonData = [
         { ID: 'Plagiarised_Letter', Name: 'Lengvai padirbamos raidės', Description: 'Aptikta plagijuota raidė URL, pavojingose svetainėse kai kurios raidės yra pakeičiamos kitais, panašiais simboliais!', Marker: 'Padirbta raidė' },
         { ID: 'URL_Length', Name: 'URL ilgis', Description: 'Ilgas URL, kuriame duomenų vagys gali paslėpti neįprastus simbolius bei iškraipyti URL!' },
         { ID: 'URL_Shortener', Name: 'URL trumpintuvas', Description: 'Aptiktas URL trumpintuvas, kuris slepia tikrąją nuorodą!', Marker: 'URL trumpintuvas' },
         { ID: 'Native_TLD', Name: 'Šalies TLD', Description: 'Aukščiausio lygio domenas (TLD), esantis URL, nesutampa su šalies aukščiausio lygio domenu!', Marker: 'Ne šalies aukščiausio lygio domenas' },
         { ID: 'Cheap_TLD', Name: 'Pigus TLD', Description: 'Nuorodoje panaudotas pigus aukščiausio lygio domenas (TLD), kuriuos naudoja duomenų vagys, atkreipkite dėmesį į naudojamą aukščiausio lygio domeną!', Marker: 'Pigus aukščiausio lygio domenas' },
         { ID: 'Many_TLD', Name: 'TLD skaičius', Description: 'Aptikta daugiau nei vienas aukščiausio lygio domenas, kas gali reikšti potencialią duomenų viliojimo ataką!', Marker: 'Keletas aukščiausio lygio domenų' },
         { ID: 'At_Sign', Name: '@ simbolis', Description: 'Aptiktas neįprastas simbolis URL, kuris naudojamas nukreipti į kitą svetainę, esančią po @ simbolio!', Marker: 'Neįprastas simbolis @' },
         { ID: 'Dot_Dash', Name: 'Neįprasti simboliai', Description: 'URL pasikartojantys simboliai "." bei "-" gali reikšti, jog tai apgvaikų svetainė!' },
         { ID: 'SSL_Certificate', Name: 'SSL sertifikatas', Description: 'Neaptiktas saugumo sertifikatas, kuris užtikrina saugų duomenų perdavimą!' },
         { ID: 'IP_Address', Name: 'IP adresas', Description: 'URL esantis IP adresas gali reikšti potencialią duomenų viliojimo ataką!', Marker: 'IP adresas' },
         { ID: 'Suffix_Prefix', Name: 'Žodžių pridėjimas į URL', Description: 'Pridėtiniai žodžiai pakeičia URL, atkreipkite dėmesį į URL, ar jis neiškraipytas!', Marker: 'Pridėtinis žodis' }
      ];

      reasonData.forEach(reason => {
         const request = reasonStore.add(reason);
         request.onerror = reject;
         request.onsuccess = resolve;
      });

      transactions.oncomplete = () => {
         insertToLoggerTable('', 'Phishing reason data inserted successfully');
      };
   });
}

// Populating PhishingSample table with data
function insert_sample_data() {
   return new Promise((resolve, reject) => {
      const transactions = database.transaction(['PhishingSample'], 'readwrite');

      //Insert data to PhishingSample table
      const sampleStore = transactions.objectStore('PhishingSample');
      const sampleData = [
         { ID: 'Letter1', Reason_ID: 'Plagiarised_Letter', URL: 'www.paypa1.com' },
         { ID: 'Letter2', Reason_ID: 'Plagiarised_Letter', URL: 'www.lumin0r.lt' },
         { ID: 'Letter3', Reason_ID: 'Plagiarised_Letter', URL: 'www.po1icija.lt' },
         { ID: 'Letter4', Reason_ID: 'Plagiarised_Letter', URL: 'www.sw3dbank.lt' },
         { ID: 'Length1', Reason_ID: 'URL_Length', Sample: 'Atkreipkite dėmesį į URL ilgį bei ar URL nėra iškraipytas' },
         { ID: 'Shortener1', Reason_ID: 'URL_Shortener', URL: 'www.tinyurl.com/urlShortener' },
         { ID: 'Shortener2', Reason_ID: 'URL_Shortener', URL: 'www.qrco.de/urlShortener' },
         { ID: 'Shortener3', Reason_ID: 'URL_Shortener', URL: 'www.shorturl.at/urlShortener' },
         { ID: 'Shortener4', Reason_ID: 'URL_Shortener', URL: 'www.bit.ly/urlShortener' },
         { ID: 'NativeD1', Reason_ID: 'Native_TLD', Sample: 'Atkreipkite dėmesį ar bandote patekti į nuorodą su šiuo domenu' },
         { ID: 'CheapD1', Reason_ID: 'Cheap_TLD', URL: 'www.dpd.xyz' },
         { ID: 'CheapD2', Reason_ID: 'Cheap_TLD', URL: 'www.netflix.info' },
         { ID: 'CheapD3', Reason_ID: 'Cheap_TLD', URL: 'www.emokymai.online' },
         { ID: 'CheapD4', Reason_ID: 'Cheap_TLD', URL: 'www.youtube.pw' },
         { ID: 'ManyT1', Reason_ID: 'Many_TLD', URL: 'www.itella.lt.com' },
         { ID: 'ManyT2', Reason_ID: 'Many_TLD', URL: 'www.lpexpress.lt.en' },
         { ID: 'ManyT3', Reason_ID: 'Many_TLD', URL: 'www.amazon.de.cn' },
         { ID: 'At1', Reason_ID: 'At_Sign', URL: 'www.seb.lt@netikra.lt' },
         { ID: 'At2', Reason_ID: 'At_Sign', URL: 'www.vu.lt@kitas.lt' },
         { ID: 'At3', Reason_ID: 'At_Sign', URL: 'www.policija.lt@moketi-bauda.lt' },
         { ID: 'At4', Reason_ID: 'At_Sign', URL: 'www.posti.lt@p0sti.lt' },
         { ID: 'DD1', Reason_ID: 'Dot_Dash', URL: 'www.posti.lt/keisti-pristatymo-laika-busena' },
         { ID: 'DD2', Reason_ID: 'Dot_Dash', URL: 'www.amazon.com/account-history-transaction-make' },
         { ID: 'DD3', Reason_ID: 'Dot_Dash', URL: 'www.vu.lt/informacija.studentams.bakalauras.dokumentai' },
         { ID: 'DD4', Reason_ID: 'Dot_Dash', URL: 'www.delfi.lt/naujienos.pasaulyje.popup.html?=data.html' },
         { ID: 'SSL1', Reason_ID: 'SSL_Certificate', Sample: 'Jei svetainė turi saugumo sertifikatą, adreso juostoje yra matomas užrakto simbolis bei HTTPS protokolas, ne HTTP!' },
         { ID: 'IP1', Reason_ID: 'IP_Address', Sample: 'URL negali turėti IP adreso, pasitikrinkite ar tikrai norite patekti į šią svetainę' },
         { ID: 'SP1', Reason_ID: 'Suffix_Prefix', URL: 'www.swedbank-netikra.lt' },
         { ID: 'SP2', Reason_ID: 'Suffix_Prefix', URL: 'www.saugus-seb.lt' },
         { ID: 'SP3', Reason_ID: 'Suffix_Prefix', URL: 'www.lrmuitine-mokestis.lt' },
         { ID: 'SP4', Reason_ID: 'Suffix_Prefix', URL: 'www.gmail-box.com' },
      ];

      sampleData.forEach(sample => {
         const request = sampleStore.add(sample);
         request.onerror = reject;
         request.onsuccess = resolve;
      });

      transactions.oncomplete = () => {
         insertToLoggerTable('', 'Phishing sample data inserted successfully');
      };
   });
}

// Checking if possible to insert the data to tables
function checkAndInsertData(database) {
   const transaction = database.transaction(['PhishingReason', 'PhishingSample'], 'readonly');
   const reasonStore = transaction.objectStore('PhishingReason');
   const sampleStore = transaction.objectStore('PhishingSample');

   const reasonRequest = reasonStore.getAll();
   const sampleRequest = sampleStore.getAll();

   transaction.oncomplete = function () {
      if (reasonRequest.result.length === 0 && sampleRequest.result.length === 0) {
         insert_reason_data().then(() => {
            insert_sample_data();
         });
      } else {
         insertToLoggerTable('', 'Database already contains data, skipping insertion');
      }
   };
}