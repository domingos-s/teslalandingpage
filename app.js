const tabs = [
  { key: 'world-politics', label: 'World Politics' },
  { key: 'us-politics', label: 'U.S. Politics' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' }
]

const state = { tab: 'world-politics', data: {} }
const keywordMap = {
  'world-politics': ['world', 'war', 'election', 'geopolitics', 'foreign', 'nation'],
  'us-politics': ['us', 'u.s.', 'america', 'congress', 'senate', 'white house', 'supreme court', 'trump', 'biden'],
  business: ['business', 'market', 'economy', 'earnings', 'finance', 'stock', 'fed', 'inflation'],
  technology: ['ai', 'tech', 'software', 'chip', 'apple', 'google', 'microsoft', 'openai', 'robot']
}

const els = {
  tabs: document.getElementById('tabs'), cards: document.getElementById('cards'), top: document.getElementById('topStories'),
  updated: document.getElementById('updated'), state: document.getElementById('state'), refresh: document.getElementById('refresh')
}

const mock = (category) => Array.from({ length: 8 }).map((_, i) => ({
  title: `Offline sample ${i + 1} for ${category}`,
  description: 'Live source unavailable. This is local fallback content.',
  source: 'Local fallback',
  publishedAt: new Date(Date.now() - i * 36e5).toISOString(), url: '#', imageUrl: ''
}))

const formatTime = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const esc = (s = '') => s.replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]))

function drawTabs() {
  els.tabs.innerHTML = ''
  tabs.forEach((t) => {
    const b = document.createElement('button')
    b.className = `tab ${t.key === state.tab ? 'active' : ''}`
    b.textContent = t.label
    b.onclick = () => { state.tab = t.key; drawTabs(); paint() }
    els.tabs.appendChild(b)
  })
}

function card(a) {
  const img = a.imageUrl ? `<img src="${esc(a.imageUrl)}" alt="" loading="lazy">` : '<div class="thumb" style="display:grid;place-items:center;color:#9eb0c5">No image</div>'
  return `<article class="article card"><div class="thumb">${img}</div><h3>${esc(a.title)}</h3><div class="meta"><span>${esc(a.source)}</span><span>${formatTime(a.publishedAt)}</span></div><p class="desc">${esc(a.description || 'No summary available.')}</p><a class="open" href="${esc(a.url || '#')}" target="_blank" rel="noreferrer">Open Article</a></article>`
}

function paint() {
  const items = state.data[state.tab] || []
  els.top.innerHTML = items.slice(0, 3).map(card).join('')
  els.cards.innerHTML = items.length ? items.map(card).join('') : '<div class="card">No stories available.</div>'
}

async function withTimeout(promise, ms = 7000) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function fetchJson(url) {
  const r = await withTimeout(fetch(url))
  if (!r.ok) throw new Error(`request failed ${r.status}`)
  return r.json()
}

function classify(title, category) {
  const t = (title || '').toLowerCase()
  return keywordMap[category].some((k) => t.includes(k))
}

async function fetchHNByCategory(category) {
  const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json')
  const sampleIds = ids.slice(0, 140)
  const chunks = []
  for (let i = 0; i < sampleIds.length; i += 20) chunks.push(sampleIds.slice(i, i + 20))

  const picked = []
  for (const chunk of chunks) {
    const items = await Promise.all(chunk.map((id) => fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null)))
    for (const item of items) {
      if (!item || !item.title || !item.url) continue
      if (classify(item.title, category)) {
        picked.push({
          id: `hn-${item.id}`,
          title: item.title,
          description: `Trending discussion with ${item.score || 0} points on Hacker News.`,
          source: 'Hacker News',
          publishedAt: new Date((item.time || Date.now() / 1000) * 1000).toISOString(),
          url: item.url,
          imageUrl: ''
        })
      }
      if (picked.length >= 18) return picked
    }
  }
  return picked
}

async function load() {
  els.state.textContent = ''
  els.cards.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'

  await Promise.all(tabs.map(async (t) => {
    try {
      const stories = await fetchHNByCategory(t.key)
      state.data[t.key] = stories.length ? stories : mock(t.key)
      if (!stories.length) els.state.textContent = 'Live stories are limited right now; mixed with fallback content.'
    } catch {
      state.data[t.key] = mock(t.key)
      els.state.textContent = 'Live feed unavailable. Showing fallback content.'
    }
  }))

  els.updated.textContent = `Last updated ${new Date().toLocaleString()}`
  paint()
}

drawTabs()
els.refresh.onclick = load
load()
