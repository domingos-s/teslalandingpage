import { Article, NewsCategory, SourceFilter } from '../types/news'

export interface NewsProvider {
  name: Exclude<SourceFilter, 'all'>
  fetchCategory(category: NewsCategory): Promise<Article[]>
}

export const dedupeAndRank = (articles: Article[]) => {
  const seen = new Map<string, Article>()
  for (const article of articles) {
    const key = article.url.replace(/^https?:\/\//, '').replace(/\?.*/, '') || article.title.toLowerCase().replace(/\W+/g, ' ')
    const existing = seen.get(key)
    if (!existing || new Date(article.publishedAt) > new Date(existing.publishedAt)) seen.set(key, article)
  }
  return [...seen.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
}

export const fetchWithTimeoutRetry = async (url: string, init?: RequestInit, retries = 2, timeoutMs = 8000): Promise<Response> => {
  for (let i = 0; i <= retries; i += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timer)
      if (!response.ok && response.status >= 500 && i < retries) continue
      return response
    } catch (error) {
      clearTimeout(timer)
      if (i === retries) throw error
    }
  }
  throw new Error('unreachable')
}
