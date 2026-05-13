const tabs = [
  { key: 'world-politics', label: 'World Politics', query: 'world politics geopolitics diplomacy' },
  { key: 'us-politics', label: 'U.S. Politics', query: 'united states politics congress white house' },
  { key: 'business', label: 'Business', query: 'business economy markets finance' },
  { key: 'technology', label: 'Technology', query: 'technology AI software chips' }
]

const state = { tab: 'world-politics', data: {} }

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

async function withTimeout(promise, ms = 8000) {
  let timer
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms) })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function fetchJson(url) {
  const r = await withTimeout(fetch(url))
  if (!r.ok) throw new Error(`request failed ${r.status}`)
  return r.json()
}

async function fetchGuardian(query) {
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&page-size=24&show-fields=thumbnail,trailText&order-by=newest&api-key=test`
  const json = await fetchJson(url)
  return (json.response?.results || []).map((item) => ({
    id: `guardian-${item.id}`,
    title: item.webTitle,
    description: item.fields?.trailText?.replace(/<[^>]+>/g, '') || 'Latest reporting from The Guardian.',
    source: 'The Guardian',
    publishedAt: item.webPublicationDate,
    url: item.webUrl,
    imageUrl: item.fields?.thumbnail || ''
  }))
}

async function fetchHN(topic) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(topic)}&tags=story&hitsPerPage=12`
  const json = await fetchJson(url)
  return (json.hits || []).map((h) => ({
    id: `hn-${h.objectID}`,
    title: h.title || h.story_title || 'Untitled',
    description: 'Supplementary discussion from Hacker News.',
    source: 'Hacker News',
    publishedAt: h.created_at || new Date().toISOString(),
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    imageUrl: ''
  }))
}

function dedupe(items) {
  const map = new Map()
  items.forEach((a) => {
    const key = (a.url || a.title).toLowerCase().replace(/^https?:\/\//, '').replace(/\?.*/, '')
    if (!map.has(key)) map.set(key, a)
  })
  return [...map.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
}

async function load() {
  els.state.textContent = ''
  els.cards.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'

  await Promise.all(tabs.map(async (tab) => {
    try {
      const [guardian, hn] = await Promise.all([fetchGuardian(tab.query), fetchHN(tab.query)])
      const merged = dedupe([...guardian, ...hn]).slice(0, 18)
      state.data[tab.key] = merged.length ? merged : mock(tab.key)
    } catch {
      state.data[tab.key] = mock(tab.key)
      els.state.textContent = 'Some sources are unavailable right now. Showing fallback content where needed.'
    }
  }))

  els.updated.textContent = `Last updated ${new Date().toLocaleString()}`
  paint()
}

drawTabs()
els.refresh.onclick = load
load()
