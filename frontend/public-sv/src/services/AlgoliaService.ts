import algoliasearch, { type SearchIndex } from 'algoliasearch/lite';
import type AppConfig from '../models/AppConfig';

export default class AlgoliaService {
  index: SearchIndex

  constructor(config: AppConfig) {
    if(config.algoliaApp && config.algoliaKey && config.algoliaIndex) {
      const client = algoliasearch(config.algoliaApp, config.algoliaKey);
      this.index = client.initIndex(config.algoliaIndex)
    } else {
      throw new Error("Missing configurations")
    }
  }

  async search(query: string, filters: string) {
    if(filters) {
      return await this.index.search(query, {
        hitsPerPage: 500,
        filters
      })
    } else {
      return await this.index.search(query, {
        hitsPerPage: 500
      })
    }
  }
}