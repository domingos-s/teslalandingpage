export type NewsCategory = 'world-politics' | 'us-politics' | 'business' | 'technology'
export type SourceFilter = 'all' | 'newsapi' | 'gnews' | 'nyt'

export interface Article {
  id: string
  title: string
  description: string
  source: string
  provider: Exclude<SourceFilter, 'all'>
  author?: string
  url: string
  imageUrl?: string
  publishedAt: string
  category: NewsCategory
  region?: string
}
