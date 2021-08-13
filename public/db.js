// GIVEN a user is on Budget App without an internet connection
// WHEN the user inputs a withdrawal or deposit
// THEN that will be shown on the page, and added to their transaction history when their connection is back online.

let db;
// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

//Onupgradeneeded will run if we need to create the database or upgrade it
request.onupgradeneeded = function (e) {
    console.log('Upgrade needed in IndexDB');
    db = e.target.result;
    if (db.objectStoreNames.length === 0) {
      db.createObjectStore('BudgetStore', { autoIncrement: true });
      const Budget = db.createObjectStore("BudgetStorage", {keyPath: "listID"});
      Budget.createIndex("statusIndex", "status"); 
    }
  };
  
  request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
  };
  
  function checkDatabase() {
    console.log('check db invoked');
  
    // Open a transaction on the Budget db
        // const objectStore = db.createObjectStore("toDoList");

    let transaction = db.transaction(['BudgetStorage'], 'readwrite');
    const Budget = transaction.objectStore("BudgetStorage", {keyPath: "listID"});
    const statusIndex = Budget.index("statusIndex");
  
    // Adds data to our objectStore
    Budget.add({ listID: "1", status: "pending" });
    Budget.add({ listID: "2", status: "pending" });
    Budget.add({ listID: "3", status: "pending" });
    Budget.add({ listID: "4", status: "pending" });

    const getRequest = Budget.get("1");
    getRequest.onsuccess = () => {
    console.log(getRequest.result);
        };

     // Return an item by index
    const getRequestIdx = statusIndex.getAll("complete");
    getRequestIdx.onsuccess = () => {
    console.log(getRequestIdx.result); 
    };
    // objectStore.createIndex("BudgetStore", "BudgetStore");
    // access your Budget object
    const store = transaction.objectStore('BudgetStorage');
    // Get all records from store and set to a variable
    const getAll = store.getAll();
  
    // If the request was successful
    getAll.onsuccess = function () {
      // If there are items in the store, we need to bulk add them when we are back online
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((res) => {
            // If our returned response is not empty
            if (res.length !== 0) {
              // Open another transaction to BudgetStore with the ability to read and write
              transaction = db.transaction(['BudgetStorage'], 'readwrite');
              // Clear existing entries because our bulk add was successful
              Store.clear();
              console.log('Clearing store 🧹');
            }
          });
      }
    };
  }
  
  request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;
  
    // Check if app is online before reading from db
    if (navigator.onLine) {
      console.log('Backend online! 🗄️');
      checkDatabase();
    }
  };
  
  const saveRecord = (record) => {
    console.log('Save record invoked');
    // // Create a transaction on the BudgetStore db with readwrite access
    const transaction = db.transaction(["BudgetStore"], 'readwrite');
    // // Access your BudgetStore object store
    const store = transaction.objectStore("BudgetStore");
  
    // Add record to your store with add method.
    store.add(record);
  };
  
  // Listen for app coming back online
  window.addEventListener('online', checkDatabase);