import { IManifestCache } from "./interfaces/IManifestCache";

export class IndexedDbService implements IManifestCache {
  // @ts-ignore TODO: make this nullable and add checks below
  database: IDBDatabase
  dbName: string
  dbVersion: number

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName
    this.dbVersion = dbVersion
  }

  async init(collectionNames: string[]): Promise<null> {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = e => {
        console.log('Error opening db', e);
        reject('Error');
      };

      request.onsuccess = e => {
        // @ts-ignore
        this.database = e.target.result
        resolve(null)
      };

      request.onupgradeneeded = e => {
        // @ts-ignore
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
          collectionNames.forEach(el => {
            this.database.createObjectStore(el)
          })
        }
        resolve(null)
      };
    });
  }

  async add(storeName: string, key: string, value: any): Promise<null> {
    console.log("writing to", storeName, key)
    return new Promise((resolve, reject) => {
      try {
        let trans = this.database.transaction([storeName], 'readwrite')
  
        trans.oncomplete = e => {
          resolve(null)
        }
  
        trans.onerror = e => {
          if(e && e.type === "error") {
            // @ts-ignore
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
      } catch (err) {
        console.error("failed to add to", storeName, " -- ", err)
        reject()
      }
    })
  }

  async put(storeName: string, key: string, value: any): Promise<null> {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve(null)
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          // @ts-ignore
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

  async get(storeName: string, key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      console.log("(InexedDbService) get: ", storeName, key)
      try {
        let trans = this.database.transaction([storeName], 'readwrite')
  
        trans.oncomplete = e => {
          resolve(null)
        }
  
        trans.onerror = e => {
          if(e && e.type === "error") {
            // @ts-ignore
            console.error("failed to get data", storeName, key, e.srcElement.error)
          }
          reject(e)
        }
  
        let store = trans.objectStore(storeName)
        let data = store.get(key)
        data.onsuccess = () => {
          resolve(data.result)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // async getAll(storeName: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let trans = this.database.transaction([storeName], 'readwrite')

  //     trans.oncomplete = e => {
  //       resolve()
  //     }

  //     trans.onerror = e => {
  //       if(e && e.type === "error") {
  //         console.error("failed to get data", storeName, e.srcElement.error)
  //       }
  //       reject()
  //     }

  //     let store = trans.objectStore(storeName)
  //     let data = store.getAll()
  //     data.onsuccess = () => {
  //       resolve(data.result)
  //     }
  //   })
  // }

  async getKeys(storeName: string): Promise<string[] | null> {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve(null)
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          // @ts-ignore
          console.error("failed to get data", storeName, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.getAllKeys()
      data.onsuccess = () => {
        // @ts-ignore
        resolve(data.result)
      }
    })
  }

  async clearStore(storeName: string): Promise<null> {
    return new Promise((resolve, reject) => {
      let trans = this.database.transaction([storeName], 'readwrite')

      trans.oncomplete = e => {
        resolve(null)
      }

      trans.onerror = e => {
        if(e && e.type === "error") {
          // @ts-ignore
          console.error("failed to clear store", storeName, e.srcElement.error)
        }
        reject()
      }

      let store = trans.objectStore(storeName)
      let data = store.clear()
      data.onsuccess = () => {
        resolve(null)
      }
    })
  }
}