export default class IndexedDbService {
  constructor(dbName, dbVersion) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  async init(collectionNames) {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = e => {
        console.log('Error opening db', e);
        reject('Error');
      };

      request.onsuccess = e => {
        this.database = e.target.result
        resolve(this.database);
      };

      request.onupgradeneeded = e => {
        console.log("onupgradeneeded", e)
        this.database = e.target.result;

        // Delete all stores
        if(this.database.objectStoreNames) {
          let storeNames = Array.from(this.database.objectStoreNames)
          storeNames.forEach(el => {
            this.database.deleteObjectStore(el)
          })
        }

        // Setup
        console.log("collectionNames", collectionNames)
        if(collectionNames) {
          Object.keys(collectionNames).forEach(el => {
            this.database.createObjectStore(collectionNames[el])
          })
        }
      };
    });
  }

  add = async function (storeName, key, value) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to add data", storeName, key, value, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      try {
        store.add(value, key)
      } catch (err) {
        console.error("failed to add data", storeName, key, value, err)
        reject()
      }
    })
  }

  put = async function (storeName, key, value) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to put data", storeName, key, value, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      try {
        store.put(value, key)
      } catch (err) {
        console.error("failed to put data", storeName, key, value, err)
        reject()
      }
    })
  }

  get = async function (storeName, key) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to get data", storeName, key, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.get(key)
      data.onsuccess = () => {
        resolve(data.result)
      }
    })
  }

  getAll = async function (storeName) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to get data", storeName, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.getAll()
      data.onsuccess = () => {
        resolve(data.result)
      }
    })
  }

  getKeys = async function (storeName) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to get data", storeName, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.getAllKeys()
      data.onsuccess = () => {
        resolve(data.result)
      }
    })
  }

  clearStore = async function(storeName) {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve()
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          console.error("failed to clear store", storeName, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.clear()
      data.onsuccess = () => {
        resolve()
      }
    })
  }

}