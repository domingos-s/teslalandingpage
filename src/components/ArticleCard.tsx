import { formatDistanceToNow } from 'date-fns'
import { Article } from '../types/news'

function formatPublished(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function ArticleCard({ article, compact }: { article: Article; compact: boolean }) {
  const safeUrl = article.url?.startsWith('http') ? article.url : '#'

  return <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="mb-3 h-36 overflow-hidden rounded-xl bg-slate-800">
      {article.imageUrl ? <img src={article.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
    </div>
    <h3 className={`${compact ? 'text-base' : 'text-lg'} font-medium text-white`}>{article.title}</h3>
    <p className="mt-2 line-clamp-2 text-sm text-slate-300">{article.description || 'No summary available.'}</p>
    <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{article.source}</span><span>{formatPublished(article.publishedAt)}</span></div>
    <a className="mt-3 inline-flex rounded-lg bg-white/10 px-3 py-2 text-xs text-white" href={safeUrl} target="_blank" rel="noreferrer">Open Article</a>
  </article>
}
