export interface IManifestCache {
  init: (collectionNames: string[]) => Promise<null>
  add: (storeName: string, key: string, value: any) => Promise<null>
  get: (storeName: string, key: string) => Promise<any>
  put: (storeName: string, key: string, value: any) => Promise<null>
  // getAll: (storeName: string) => Promise<any>
  getKeys: (storeName: string) => Promise<string[] | null>
  clearStore: (storeName: string) => Promise<null>
}