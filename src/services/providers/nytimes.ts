import { NewsProvider } from '../newsProvider'
export const nytimesProvider: NewsProvider = { name: 'nyt', async fetchCategory() { return [] } }
