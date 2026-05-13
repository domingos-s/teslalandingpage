import { SourceFilter } from '../types/news'

export function TopBar({ updatedAt, source, onSourceChange, onRefresh }: { updatedAt: string; source: SourceFilter; onSourceChange: (s: SourceFilter) => void; onRefresh: () => void }) {
  return <header className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-wide text-white">PulseDrive News</h1>
        <p className="text-sm text-slate-300">Last updated {updatedAt}</p>
      </div>
      <div className="flex items-center gap-3">
        <select value={source} onChange={(e) => onSourceChange(e.target.value as SourceFilter)} className="rounded-xl border border-white/15 bg-ink-900 px-4 py-3 text-sm text-white">
          <option value="all">All Sources</option><option value="newsapi">NewsAPI</option><option value="gnews">GNews</option><option value="nyt">NYT</option>
        </select>
        <button onClick={onRefresh} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">Refresh</button>
      </div>
    </div>
  </header>
}
