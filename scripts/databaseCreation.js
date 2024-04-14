let database = null;

// Database creation
export function create_database() {
    const request = indexedDB.open('PhishingDatabase');

    request.onerror = function (event) {
        console.log('Problem opening database:', event.target.error);
    }

    request.onupgradeneeded = function (event) {
        database = event.target.result;

        //Table PhishingReason
        const phishingReason = database.createObjectStore('PhishingReason', {keyPath: 'ID'});

        //The structure of PhishingReason
        phishingReason.createIndex('NameIndex', 'Name', {unique: true});
        phishingReason.createIndex('Description', 'Description', {unique: false});
        phishingReason.createIndex('MarkerIndex', 'Marker', {unique: true});

        //Table PhishingSample
        const phishingSample = database.createObjectStore('PhishingSample', {keyPath: 'ID'});

        //The structure of PhishingSample
        phishingSample.createIndex('ReasonID', 'Reason_ID', {unique: false});
        phishingSample.createIndex('URLIndex', 'URL', {unique: true});
        phishingSample.createIndex('SampleIndex', 'Sample', {unique: true});

        //Objects stores are created
        phishingReason.transaction.oncomplete = function (event) {
            console.log('PhishingReason object store is created');
        }

        phishingSample.transaction.oncomplete = function (event) {
            console.log('PhishingSample object store is created');
        }

        const logger = database.createObjectStore('ExtensionLogger', {keyPath: 'ID'});
        
        logger.createIndex('TimestampIndex', 'Timestamp', {unique: false});
        logger.createIndex('ErrorIndex', 'Error', {unique: false});
        logger.createIndex('MessageIndex', 'Message', {unique: false});

        logger.transaction.oncomplete = function (event) {
            console.log('Logger object store is created');
        }
    }

    request.onsuccess = function (event) {
        database = event.target.result;
        console.log('Database opened');

        checkAndInsertData(database);

        database.onerror = function (event) {
            console.log('Failed to open the database', event.target.error);
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
            {ID: 'Plagiarised_Letter', Name: 'Lengvai padirbamos raidės', Description: 'Aptikta plagijuota raidė URL, pavojingose svetainėse kai kurios raidės yra pakeičiamos kitais, panašiais simboliais!', Marker: 'Padirbta raidė'},
            {ID: 'URL_Length', Name: 'URL ilgis', Description: 'Ilgas URL, kuriame duomenų vagys gali būti paslėpę neįprastus simbolius bei iškraipę URL!'},
            {ID: 'URL_Shortener', Name: 'URL trumpintojas', Description: 'Aptiktas URL trumpintojas, kuris slepia tikrąją nuorodą!', Marker: 'URL trumpintojas'},
            {ID: 'Native_TLD', Name: 'Šalies TLD', Description: 'Aukščiausio lygio domenas, esantis URL, nesutampa su šalies aukščiausio lygio domenu!', Marker: 'Ne šalies aukščiausio lygio domenas'},
            {ID: 'Cheap_TLD', Name: 'Pigus TLD', Description: 'Nuorodoje panaudotas pigus aukščiausio lygio domenas, kuriuos naudoja duomenų vagys, atkreipkite dėmesį į naudojamą aukščiausio lygio domeną!', Marker: 'Pigus aukščiausio lygio domenas'},
            {ID: 'Many_TLD', Name: 'TLD skaičius', Description: 'Aptikta daugiau nei vienas aukščiausio lygio domenas, kas gali reikšti potencialią duomenų viliojimo ataką!', Marker: 'Keletas aukščiausio lygio domenų'},
            {ID: 'At_Sign', Name: '@ simbolis', Description: 'Aptiktas neįprastas simbolis URL, kuris naudojamas nukreipti į kitą svetainę, esančią po @ simbolio!', Marker: 'Neįprastas simbolis @'},
            {ID: 'Dot_Dash', Name: 'Neįprasti simboliai', Description: 'URL pasikartojantys simboliai "." bei "-" gali reikšti, jog tai apgvaikų svetainė!'},
            {ID: 'SSL_Certificate', Name: 'SSL sertifikatas', Description: 'Neaptiktas saugumo sertifikatas, kuris užtikrina saugų duomenų perdavimą!'},
            {ID: 'IP_Adress', Name: 'IP adresas', Description: 'URL esantis IP adresas gali reikšti potencialią duomenų viliojimo ataką!', Marker: 'IP adresas'},
            {ID: 'Suffix_Prefix', Name: 'Žodžių pridėjimas į URL', Description: 'Pridėtiniai žodžiai pakeičia URL, atkreipkite dėmesį į URL, ar jis neiškraipytas!', Marker: 'Pridėtinis žodis'}
        ];

        reasonData.forEach(reason => {
            const request = reasonStore.add(reason);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        transactions.oncomplete = () => {
            console.log('Phishing reason data inserted successfully');
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
            {ID: 'Letter1', Reason_ID:'Plagiarised_Letter', URL: 'www.paypa1.com'},
            {ID: 'Letter2', Reason_ID:'Plagiarised_Letter', URL: 'www.lumin0r.lt'},
            {ID: 'Letter3', Reason_ID:'Plagiarised_Letter', URL: 'www.po1icija.lt'},
            {ID: 'Letter4', Reason_ID:'Plagiarised_Letter', URL: 'www.sw3dbank.lt'},
            {ID: 'Length1', Reason_ID:'URL_Length', Sample: 'Atkreipkite dėmesį į URL ilgį, ar URL nėra iškraipytas'},
            {ID: 'Shortener1', Reason_ID:'URL_Shortener', URL: 'www.tinyurl.com/urlShortener'},
            {ID: 'Shortener2', Reason_ID:'URL_Shortener', URL: 'www.qrco.de/urlShortener'},
            {ID: 'Shortener3', Reason_ID:'URL_Shortener', URL: 'www.shorturl.at/urlShortener'},
            {ID: 'Shortener4', Reason_ID:'URL_Shortener', URL: 'www.bit.ly/urlShortener'},
            {ID: 'NativeD1', Reason_ID:'Native_TLD', Sample: 'Atkreipkite dėmesį ar bandote patekti į nuorodą su šiuo domenu'},
            {ID: 'CheapD1', Reason_ID:'Cheap_TLD', URL: 'www.dpd.xyz'},
            {ID: 'CheapD2', Reason_ID:'Cheap_TLD', URL: 'www.netflix.info'},
            {ID: 'CheapD3', Reason_ID:'Cheap_TLD', URL: 'www.emokymai.online'},
            {ID: 'CheapD4', Reason_ID:'Cheap_TLD', URL: 'www.youtube.pw'},
            {ID: 'ManyT1', Reason_ID:'Many_TLD', URL: 'www.itella.lt.com'},
            {ID: 'ManyT2', Reason_ID:'Many_TLD', URL: 'www.lpexpress.lt.en'},
            {ID: 'ManyT3', Reason_ID:'Many_TLD', URL: 'www.amazon.de.cn'},
            {ID: 'At1', Reason_ID:'At_Sign', URL: 'www.seb.lt@netikra.lt'},
            {ID: 'At2', Reason_ID:'At_Sign', URL: 'www.vu.lt@kitas.lt'},
            {ID: 'At3', Reason_ID:'At_Sign', URL: 'www.policija.lt@moketi-bauda.lt'},
            {ID: 'At4', Reason_ID:'At_Sign', URL: 'www.posti.lt@p0sti.lt'},
            {ID: 'DD1', Reason_ID:'Dot_Dash', URL: 'www.posti.lt/keisti-pristatymo-laika-busena'},
            {ID: 'DD2', Reason_ID:'Dot_Dash', URL: 'www.amazon.com/account-history-transaction-make'},
            {ID: 'DD3', Reason_ID:'Dot_Dash', URL: 'www.vu.lt/informacija.studentams.bakalauras.dokumentai'},
            {ID: 'DD4', Reason_ID:'Dot_Dash', URL: 'www.delfi.lt/naujienos.pasaulyje.popup.html?=data.html'},    
            {ID: 'SSL1', Reason_ID:'SSL_Certificate', Sample: 'Jei svetainė turi saugumo sertifikatą, adreso juostoje yra matomas užrakto simbolis'},
            {ID: 'IP1', Reason_ID:'IP_Adress', Sample: 'URL negali būti IP adresas, pasitikrinkite ar tikrai norite patekti į šią svetainę'}, 
            {ID: 'SP1', Reason_ID:'Suffix_Prefix', URL: 'www.swedbank-netikra.lt'},
            {ID: 'SP2', Reason_ID:'Suffix_Prefix', URL: 'www.saugus-seb.lt'},
            {ID: 'SP3', Reason_ID:'Suffix_Prefix', URL: 'www.lrmuitine-mokestis.lt'},
            {ID: 'SP4', Reason_ID:'Suffix_Prefix', URL: 'www.gmail-box.com'},
        ];

        sampleData.forEach(sample => {
            const request = sampleStore.add(sample);
            request.onerror = reject;
            request.onsuccess = resolve;
        });

        transactions.oncomplete = () => {
            console.log('Phishing sample data inserted successfully');
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

    transaction.oncomplete = function() {
        if (reasonRequest.result.length === 0 && sampleRequest.result.length === 0) {
            insert_reason_data().then(() => {
                insert_sample_data();
            });
        } else {
            console.log('Database already contains data, skipping insertion');
        }
    };
}

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
                }
            };

            getRequest.onerror = function(event) {
                reject('Error getting data: ' + event.target.error);
            };
        };

        request.onerror = function(event) {
            reject('Error opening database: ' + event.target.error);
        };
    });
}
