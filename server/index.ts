import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

type Category = 'world-politics' | 'us-politics' | 'business' | 'technology'
const cache = new Map<string, { at: number; data: unknown }>()
const TTL = Number(process.env.CACHE_TTL_MS || 120000)

const withTimeout = async (url: string, retries = 2): Promise<any> => {
  for (let i = 0; i <= retries; i += 1) {
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 8000)
    try {
      const r = await fetch(url, { signal: ac.signal }); clearTimeout(t)
      if (!r.ok) throw new Error(String(r.status))
      return r.json()
    } catch (e) { clearTimeout(t); if (i === retries) throw e; await new Promise((r) => setTimeout(r, 450 * (i + 1))) }
  }
}

const normalize = (raw: any, provider: 'newsapi'|'gnews'|'nyt', category: Category) => raw.map((a: any, idx: number) => ({
  id: `${provider}-${idx}-${(a.url || a.link || '').slice(-24)}`,
  title: a.title,
  description: a.description || a.abstract || '',
  source: a.source?.name || a.source || 'Unknown',
  provider,
  author: a.author || a.byline,
  url: a.url,
  imageUrl: a.urlToImage || a.image || a.multimedia?.[0]?.url,
  publishedAt: a.publishedAt || a.published_date || new Date().toISOString(),
  category,
  region: category === 'us-politics' ? 'US' : 'Global'
}))

async function fetchMerged(category: Category, source: string) {
  const tasks: Promise<any[]>[] = []
  const allow = (s: string) => source === 'all' || source === s
  if (allow('newsapi') && process.env.NEWSAPI_KEY) {
    const map = { 'world-politics': 'q=world%20politics', 'us-politics': 'country=us&q=politics', business: 'category=business&country=us', technology: 'category=technology&country=us' } as const
    tasks.push(withTimeout(`https://newsapi.org/v2/top-headlines?${map[category]}&apiKey=${process.env.NEWSAPI_KEY}`).then((d) => normalize(d.articles || [], 'newsapi', category)).catch(() => []))
  }
  if (allow('gnews') && process.env.GNEWS_KEY) {
    const map = { 'world-politics': 'world', 'us-politics': 'nation', business: 'business', technology: 'technology' } as const
    tasks.push(withTimeout(`https://gnews.io/api/v4/top-headlines?category=${map[category]}&lang=en&apikey=${process.env.GNEWS_KEY}`).then((d) => normalize(d.articles || [], 'gnews', category)).catch(() => []))
  }
  if (allow('nyt') && process.env.NYT_KEY) {
    const map = { 'world-politics': 'world', 'us-politics': 'us', business: 'business', technology: 'technology' } as const
    tasks.push(withTimeout(`https://api.nytimes.com/svc/topstories/v2/${map[category]}.json?api-key=${process.env.NYT_KEY}`).then((d) => normalize(d.results || [], 'nyt', category)).catch(() => []))
  }
  const merged = (await Promise.all(tasks)).flat().sort((a,b)=>+new Date(b.publishedAt)-+new Date(a.publishedAt))
  const unique = new Map<string, any>()
  for (const a of merged) { const k=(a.url||'').replace(/^https?:\/\//,'').replace(/\?.*/,'')||a.title.toLowerCase(); if(!unique.has(k)) unique.set(k,a) }
  return [...unique.values()]
}

app.get('/api/news/:category', async (req, res) => {
  const category = req.params.category as Category
  const source = String(req.query.source || 'all')
  const key = `${category}:${source}`
  const c = cache.get(key)
  if (c && Date.now() - c.at < TTL) return res.json({ articles: c.data, cached: true })
  try {
    const data = await fetchMerged(category, source)
    cache.set(key, { at: Date.now(), data })
    res.json({ articles: data, cached: false })
  } catch {
    if (process.env.ENABLE_MOCK_FALLBACK === 'true') return res.json({ articles: [] })
    res.status(500).json({ message: 'fetch failed' })
  }
})

app.listen(Number(process.env.PORT || 8787), () => console.log('server started'))
