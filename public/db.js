let db; 
// new db request for "budget-tracker" database.
const request = indexedDB.open("budget-tracker", 3);
//create object store called "pending" and set auto increment to true
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", {autoIncrement: true});
}

request.onsuccess = function(event) {
    db = event.target.result;

    //checking if the app is online before reading from the db
    if (navigator.onLine) {
        checkDatabase()
    }
};

request.onerror = function(event) {
    console.log("oops..." + event.target.errorCode)
}

function saveRecord(record) {
     //transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
     // access your pending object store
    const store = transaction.objectStore("pending")
      // adding record to your store using add method
    store.add(record)
}

function checkDatabase () {
    //open transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("pending");
    // get all records from store and set it to variable
    const getAll = store.getAll()

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "content-type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                //if success open a transaction on your pending db
                const transaction = db.transaction(["pending", "readwrite"])
                //access your pending object store
                const store = transaction.objectStore("pending")
                //clear items in your store
                store.clear()
            })
        }
    }

}

window.addEventListener("online", checkDatabase);