const tabs = [
  { key: 'world-politics', label: 'World Politics', query: 'global diplomacy elections conflict', keywords: ['world','geopolitics','diplomacy','war','un','nato','foreign policy','election'], rss: ['https://feeds.bbci.co.uk/news/world/rss.xml','https://www.aljazeera.com/xml/rss/all.xml','https://www.dw.com/en/top-stories/s-9097/rss','https://rss.nytimes.com/services/xml/rss/nyt/World.xml','https://www.theguardian.com/world/rss'] },
  { key: 'us-politics', label: 'U.S. Politics', query: 'US congress white house election policy', keywords: ['u.s.','united states','congress','senate','house','white house','supreme court','governor','election','democrat','republican'], rss: ['https://rss.politico.com/politics-news.xml','https://feeds.npr.org/1014/rss.xml','https://rss.nytimes.com/services/xml/rss/nyt/US.xml','https://www.theguardian.com/us-news/rss','https://www.cbsnews.com/latest/rss/politics'] },
  { key: 'business', label: 'Business', query: 'markets economy business finance', keywords: ['market','economy','business','finance','stocks','earnings','inflation','federal reserve','nasdaq','dow'], rss: ['https://www.cnbc.com/id/10001147/device/rss/rss.html','https://feeds.a.dj.com/rss/RSSMarketsMain.xml','https://rss.nytimes.com/services/xml/rss/nyt/Business.xml','https://www.ft.com/rss/home/us','https://www.theguardian.com/business/rss'] },
  { key: 'technology', label: 'Technology', query: 'technology AI software chips cybersecurity', keywords: ['technology','ai','software','chip','cyber','apple','google','microsoft','startup','openai'], rss: ['https://www.theverge.com/rss/index.xml','https://feeds.arstechnica.com/arstechnica/technology-lab','https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml','https://techcrunch.com/feed/','https://www.wired.com/feed/rss'] }
]

const state = { tab: 'world-politics', data: {} }
const els = { tabs: document.getElementById('tabs'), cards: document.getElementById('cards'), top: document.getElementById('topStories'), updated: document.getElementById('updated'), state: document.getElementById('state'), refresh: document.getElementById('refresh') }

const mock = (category) => Array.from({ length: 8 }).map((_, i) => ({ title: `Offline sample ${i + 1} for ${category}`, description: 'Live source unavailable. This is local fallback content.', source: 'Local fallback', publishedAt: new Date(Date.now() - i * 36e5).toISOString(), url: '#', imageUrl: '' }))
const formatTime = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
const esc = (s = '') => s.replace(/[&<>'"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[m]))

function drawTabs() { els.tabs.innerHTML = ''; tabs.forEach((t) => { const b = document.createElement('button'); b.className = `tab ${t.key === state.tab ? 'active' : ''}`; b.textContent = t.label; b.onclick = () => { state.tab = t.key; drawTabs(); paint() }; els.tabs.appendChild(b) }) }
function card(a) { const img = a.imageUrl ? `<img src="${esc(a.imageUrl)}" alt="" loading="lazy">` : '<div class="thumb" style="display:grid;place-items:center;color:#9eb0c5">No image</div>'; return `<article class="article card"><div class="thumb">${img}</div><h3>${esc(a.title)}</h3><div class="meta"><span>${esc(a.source)}</span><span>${formatTime(a.publishedAt)}</span></div><p class="desc">${esc(a.description || 'No summary available.')}</p><a class="open" href="${esc(a.url || '#')}" target="_blank" rel="noreferrer">Open Article</a></article>` }
function paint() { const items = state.data[state.tab] || []; els.top.innerHTML = items.slice(0, 3).map(card).join(''); els.cards.innerHTML = items.length ? items.map(card).join('') : '<div class="card">No stories available.</div>' }

async function withTimeout(promise, ms = 9000) { let timer; const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms) }); return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) }
async function fetchJson(url) { const r = await withTimeout(fetch(url)); if (!r.ok) throw new Error(`request failed ${r.status}`); return r.json() }

async function fetchGuardian(query) {
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&page-size=20&show-fields=thumbnail,trailText&order-by=newest&api-key=test`
  const json = await fetchJson(url)
  return (json.response?.results || []).map((item) => ({ id: `guardian-${item.id}`, title: item.webTitle, description: item.fields?.trailText?.replace(/<[^>]+>/g, '') || 'Latest reporting from The Guardian.', source: 'The Guardian', publishedAt: item.webPublicationDate, url: item.webUrl, imageUrl: item.fields?.thumbnail || '' }))
}

async function fetchRss(rssUrl) {
  const json = await fetchJson(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
  return (json.items || []).slice(0, 12).map((item, idx) => ({ id: `rss-${idx}-${item.guid || item.link}`, title: item.title || 'Untitled', description: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 220), source: json.feed?.title || 'RSS', publishedAt: item.pubDate || new Date().toISOString(), url: item.link, imageUrl: item.thumbnail || '' }))
}

function matchesCategory(article, tab) {
  const text = `${article.title} ${article.description}`.toLowerCase()
  return tab.keywords.some((k) => text.includes(k))
}

function dedupe(items) { const map = new Map(); items.forEach((a) => { const key = (a.url || a.title).toLowerCase().replace(/^https?:\/\//, '').replace(/\?.*/, ''); if (!map.has(key)) map.set(key, a) }); return [...map.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)) }

async function load() {
  els.state.textContent = ''
  els.cards.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'

  await Promise.all(tabs.map(async (tab) => {
    try {
      const guardian = await fetchGuardian(tab.query)
      const rssResults = (await Promise.all(tab.rss.map((r) => fetchRss(r).catch(() => [])))).flat()
      const filtered = [...guardian, ...rssResults].filter((a) => matchesCategory(a, tab))
      const merged = dedupe(filtered).slice(0, 24)
      state.data[tab.key] = merged.length ? merged : mock(tab.key)
      if (!merged.length) els.state.textContent = 'Live sources returned no stories for one or more categories.'
    } catch {
      state.data[tab.key] = mock(tab.key)
      els.state.textContent = 'Some sources are unavailable right now. Showing fallback content where needed.'
    }
  }))

  els.updated.textContent = `Last updated ${new Date().toLocaleString()}`
  paint()
}

drawTabs(); els.refresh.onclick = load; load()
