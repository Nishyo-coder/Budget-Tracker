// GIVEN a user is on Budget App without an internet connection
// WHEN the user inputs a withdrawal or deposit
// THEN that will be shown on the page, and added to their transaction history when their connection is back online.

let db;
// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    const objectStore = db.createObjectStore("transactions");
    objectStore.createIndex("purchases", "complete");
}

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};
// Open a transaction on your BudgetStore db
  // access your BudgetStore object
  // Get all records from store and set to a variable

function checkDatabase() {
  console.log('check db invoked');
  let transaction = db.transaction(['transactions'], 'readwrite');
  const store = transaction.objectStore('transactions');
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
        .then(response => response.json())
        .then(() => {
        const transaction = db.transaction(['transactions'], 'readwrite');
        const Currentstore = transaction.objectStore('transactions');
        Currentstore.clear();
        console.log('Clearing store 🧹');
           
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
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(['transactions'], 'readwrite');
  // Access your BudgetStore object store
  const store = transaction.objectStore('transactions');
  // Add record to your store with add method.
  store.add(record);
};

function deleteTransaction() {
    const transaction = db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        store.clear();
        console.log('Clearing store 🧹');

}

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
