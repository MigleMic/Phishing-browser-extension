// Background service
// Checks if the URL changes and loads the database

let previousUrl = '';

// Checking if new tab URL is a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
        const currentUrl = changeInfo.url;
        if (currentUrl !== previousUrl) {
            checkUrl(currentUrl);
        }
    }
});

// Checking if there is a different URL when navigating to another page
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const currentUrl = details.url;
    const tabId = details.tabId;
    chrome.tabs.get(tabId, (tab) =>{
        if (tab && tab.active){
            if (currentUrl !== previousUrl) {
                checkUrl(currentUrl);
            }
        }
    });
});

// Checking if URL is not of extension itself
function checkUrl(url) {
    if (!url.startsWith("chrome")) { 
        if (url !== previousUrl) {
            previousUrl = url;
        }
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];   
            if (!url.startsWith(chrome.runtime.getURL(""))) {
                openPanelWindow(url); // Open panel for non-extension URLs
            }
        });
    }
}

// Open a popup window of an extension
function openPanelWindow(url){
    const encodedURL = encodeURIComponent(url);   

    //creates a panel html
    chrome.windows.create({
        url: "popup.html?url=" + encodedURL,
        type: "panel",
        left: 250,
        top: 100
    });
}

// Install database on runtime 
chrome.runtime.onInstalled.addListener(function(){
    create_database();
});

let database = null;

// Database creation
function create_database(){
    const request = indexedDB.open('PhishingDatabase');

    request.onerror = function (event){
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
        phishingReason.transaction.oncomplete = function (event){
            console.log('PhishingReason object store is created');
        }

        phishingSample.transaction.oncomplete = function (event){
            console.log('PhishingSample object store is created');
        }
    }
    request.onsuccess = function (event){
        database = event.target.result;
        console.log('Database opened');

        // insert_reason_data().then(() => {
        //     insert_sample_data();
        // });
        checkAndInsertData(database);

        database.onerror = function (event){
            console.log('Failed to open the database', event.target.error);
        }
    }
}

// Populating PhishingReason table with data
function insert_reason_data(){
    return new Promise((resolve, reject) => {
        const transactions = database.transaction(['PhishingReason'], 'readwrite');

        //Insert data to PhishingReason table
        const reasonStore = transactions.objectStore('PhishingReason');
        const reasonData = [
            {ID: 'Plagiarised_Letter', Name: 'Lengvai padirbamos raidės', Description: 'Aptikas plagijuota raidė URL, pavojingose svetainėse kai kurios raidės yra pakeičiamos kitais, panašiais simboliais!', Marker: 'Padirba raidė'},
            {ID: 'URL_Length', Name: 'URL ilgis', Description: 'Ilgas URL, kuriame duomenų vagys gali būti paslėpę neįprastus simbolius bei iškraipę URL!'},
            {ID: 'Native_Domain', Name: 'Šalies domenas', Description: 'URL esantis URL nesutampa su šalies domenu!', Marker: 'Ne šalies domenas'},
            {ID: 'Cheap_Domain', Name: 'Pigus domenas', Description: 'Nuorodoje panaudotas pigus domenas, kuriuos naudoja duomenų vagys, atkreipkite dėmesį į naudojamą domeną!', Marker: 'Pigus domenas'},
            {ID: 'At_Sign', Name: '@ simbolis', Description: 'Aptikas neįprastas simbolis URL, kuris naudojamas nukreipti į kitą svetainę, esančią po @ simbolio!', Marker: 'Neįprastas simbolis @'},
            {ID: 'Dot_Dash', Name: 'Neįprasti simboliai', Description: 'URL pasikartojantys simboliai "." bei "-" gali reikšti, jog tai apgvaikų svetainė!'},
            {ID: 'SSL_Certificate', Name: 'SSL sertifikatas', Description: 'Neaptikas saugumo sertifikatas, kuris užtikrina saugų duomenų perdavimą!'},
            {ID: 'IP_Adress', Name: 'IP adresas', Description: 'URL esantis IP adresas gali reikšti potencialią duomenų ataką!', Marker: 'IP adresas'},
            {ID: 'Favicon', Name: 'Svetainės piktograma', Description: 'Oficialios svetainės turi savo piktogramas, jos neturėjimas gali reikšti duomenų viliojimo ataką!'},
            {ID: 'Website_Age', Name: 'Internetinės svetainės amžius', Description: 'Jaunesnė nei pusė metų internetinė svetainė gali reikšti potencialią duomenų viliojimo ataką!'},
            {ID: 'Suffix_Prefix', Name: 'Žodžių pridėjimas į URL', Description: 'Pridėtiniai žodžiai pakeičia URL, atkreipkite dėmesį į URL, ar jis neiškraipytas!'}
        ];

        reasonData.forEach(reason => {
            const request = reasonStore.add(reason);
            request.onerror = reject;
            request.onsuccess = resolve;
        });
        transactions.oncomplete = () =>{
            console.log('Phishing reason data inserted successfully');
        };
    });
}

// Populating PhishingSample table with data
function insert_sample_data(){
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
            {ID: 'NativeD1', Reason_ID:'Native_Domain', Sample: 'Atkreipkite dėmesį ar bandote patekti į nuorodą su šiuo domenu'},
            {ID: 'CheapD1', Reason_ID:'Cheap_Domain', URL: 'www.dpd.com.xyz'},
            {ID: 'CheapD2', Reason_ID:'Cheap_Domain', URL: 'www.netflix.com.info'},
            {ID: 'CheapD3', Reason_ID:'Cheap_Domain', URL: 'www.emokymai.online'},
            {ID: 'CheapD4', Reason_ID:'Cheap_Domain', URL: 'www.youtube.pw'},
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
            {ID: 'Fv1', Reason_ID:'Favicon', Sample: 'Svetainės piktogramą galite pamatyti adreso juostoje arba lango viršuje, atkreipkite dėmesį'},
            {ID: 'WA1', Reason_ID:'Website_Age', Sample: 'Venkite ėjimo į nežinomas internetines svetaines, jei URL jums nežinomas'},
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
        transactions.oncomplete = () =>{
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
        // Check if both object stores are empty
        if (reasonRequest.result.length === 0 && sampleRequest.result.length === 0) {
            // Both object stores are empty, insert data
            insert_reason_data().then(() => {
                insert_sample_data();
            });
        } else {
            console.log('Database already contains data, skipping insertion');
        }
    };
}