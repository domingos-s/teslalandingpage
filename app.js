const tabs = [
  { key: 'world-politics', label: 'World Politics' },
  { key: 'us-politics', label: 'U.S. Politics' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' }
]

const state = { tab: 'world-politics', source: 'all', data: {} }
const qMap = {
  'world-politics': 'geopolitics OR foreign policy OR election',
  'us-politics': 'US politics OR congress OR senate OR white house',
  business: 'business OR economy OR markets OR earnings',
  technology: 'technology OR AI OR software OR chips'
}

const els = {
  tabs: document.getElementById('tabs'), cards: document.getElementById('cards'), top: document.getElementById('topStories'),
  updated: document.getElementById('updated'), state: document.getElementById('state'), refresh: document.getElementById('refresh'), source: document.getElementById('source')
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

async function fetchHNQuery(query) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=24`
  const r = await fetch(url)
  if (!r.ok) throw new Error('HN request failed')
  const j = await r.json()
  return (j.hits || []).map((h, i) => ({
    id: `hn-${i}-${h.objectID}`,
    title: h.title || h.story_title || 'Untitled',
    description: h._highlightResult?.title?.value?.replace(/<[^>]+>/g, '') || 'News discussion item',
    source: h.author ? `HN / ${h.author}` : 'Hacker News',
    publishedAt: h.created_at || new Date().toISOString(),
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    imageUrl: ''
  }))
}

async function withTimeout(promise, ms = 6000) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function load() {
  els.state.textContent = ''
  els.cards.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'

  await Promise.all(tabs.map(async (t) => {
    try {
      if (state.source === 'gdelt') throw new Error('GDELT disabled in keyless mode')
      const hnStories = await withTimeout(fetchHNQuery(qMap[t.key]))
      state.data[t.key] = hnStories.slice(0, 18)
      if (!state.data[t.key].length) state.data[t.key] = mock(t.key)
    } catch {
      state.data[t.key] = mock(t.key)
      els.state.textContent = 'Live feed unavailable for some categories. Showing fallback content.'
    }
  }))

  els.updated.textContent = `Last updated ${new Date().toLocaleString()}`
  paint()
}

drawTabs()
els.refresh.onclick = load
els.source.innerHTML = '<option value="all">All Sources (No Key)</option><option value="hn">Hacker News Query Feed</option>'
els.source.onchange = (e) => { state.source = e.target.value; load() }
load()
