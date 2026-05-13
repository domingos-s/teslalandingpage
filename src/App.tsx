import { useEffect, useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { ArticleCard } from './components/ArticleCard'
import { fetchCategoryNews } from './services/apiClient'
import { NewsCategory, SourceFilter, Article } from './types/news'

const tabs: { key: NewsCategory; label: string }[] = [
  { key: 'world-politics', label: 'World Politics' },
  { key: 'us-politics', label: 'U.S. Politics' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' }
]

export default function App() {
  const [tab, setTab] = useState<NewsCategory>('world-politics')
  const [source, setSource] = useState<SourceFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [compact, setCompact] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(new Date())
  const [articles, setArticles] = useState<Record<NewsCategory, Article[]>>({ 'world-politics': [], 'us-politics': [], business: [], technology: [] })

  const load = async () => {
    setLoading(true); setError('')
    try {
      const items = await Promise.all(tabs.map(({ key }) => fetchCategoryNews(key, source)))
      setArticles({ 'world-politics': items[0], 'us-politics': items[1], business: items[2], technology: items[3] })
      setUpdatedAt(new Date())
    } catch { setError('Unable to load news feeds.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [source])

  const topStories = useMemo(() => (articles[tab] || []).slice(0, 3), [articles, tab])

  return <main className="min-h-screen bg-ink-950 p-6 text-white md:p-8"><div className="mx-auto max-w-[1380px] space-y-6">
    <TopBar updatedAt={updatedAt.toLocaleTimeString()} source={source} onSourceChange={setSource} onRefresh={load} />
    <section className="flex flex-wrap gap-3">{tabs.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-xl px-5 py-3 text-sm ${tab === t.key ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>{t.label}</button>)}<button onClick={() => setCompact((v) => !v)} className="ml-auto rounded-xl bg-white/10 px-4 py-3 text-sm">{compact ? 'Comfortable' : 'Compact'}</button></section>
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-6"><p className="text-xs uppercase text-slate-300">Top Stories</p><div className="mt-4 grid gap-4 md:grid-cols-3">{topStories.map((a) => <ArticleCard key={a.id} article={a} compact={compact} />)}</div></section>
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">Business Pulse: S&P futures steady · Oil mixed · USD index soft</section>
    {error && <section className="rounded-xl bg-red-500/10 p-4 text-red-200">{error}</section>}
    {loading ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/10" />)}</section> :
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(articles[tab] || []).map((a) => <ArticleCard key={a.id} article={a} compact={compact} />)}</section>}
  </div></main>
}
