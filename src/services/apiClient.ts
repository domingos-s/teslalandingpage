import { Article, NewsCategory, SourceFilter } from '../types/news'
import { mockArticles } from '../mocks/mockArticles'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchCategoryNews(category: NewsCategory, source: SourceFilter): Promise<Article[]> {
  const url = `${BASE}/api/news/${category}?source=${source}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('request failed')
    return (await res.json()).articles
  } catch {
    return mockArticles.filter((item) => item.category === category)
  }
}
