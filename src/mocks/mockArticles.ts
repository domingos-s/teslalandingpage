import { Article } from '../types/news'

export const mockArticles: Article[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `mock-${i}`,
  title: `Sample Headline ${i + 1}: Markets and policy updates`,
  description: 'Fallback local data while API keys are missing or provider rate limits are hit.',
  source: 'Local Mock Wire',
  provider: 'gnews',
  url: 'https://example.com',
  publishedAt: new Date(Date.now() - i * 1000 * 60 * 40).toISOString(),
  category: (['world-politics', 'us-politics', 'business', 'technology'] as const)[i % 4],
  imageUrl: ''
}))
