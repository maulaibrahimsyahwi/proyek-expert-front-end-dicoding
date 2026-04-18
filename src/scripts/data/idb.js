const DB_NAME = "story-app-db";
const DB_VERSION = 1;
const STORE_FAVORITE = "favorites";
const STORE_SYNC = "sync-stories";

const dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_FAVORITE)) {
      db.createObjectStore(STORE_FAVORITE, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(STORE_SYNC)) {
      db.createObjectStore(STORE_SYNC, { keyPath: "id" });
    }
  };
  request.onsuccess = (event) => resolve(event.target.result);
  request.onerror = (event) => reject(event.target.error);
});

export const idb = {
  async get(storeName, key) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async getAll(storeName) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async put(storeName, data) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async delete(storeName, key) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
};

export { STORE_FAVORITE, STORE_SYNC };
