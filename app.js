const tabs = [
  { key: 'world-politics', label: 'World Politics' },
  { key: 'us-politics', label: 'U.S. Politics' },
  { key: 'business', label: 'Business' },
  { key: 'technology', label: 'Technology' }
];

const state = { tab: 'world-politics', source: 'all', data: {} };
const qMap = {
  'world-politics': 'world politics OR geopolitics',
  'us-politics': 'US politics OR congress OR white house',
  business: 'business economy markets',
  technology: 'technology AI software'
};

const els = {
  tabs: document.getElementById('tabs'),
  cards: document.getElementById('cards'),
  top: document.getElementById('topStories'),
  updated: document.getElementById('updated'),
  state: document.getElementById('state'),
  refresh: document.getElementById('refresh'),
  source: document.getElementById('source')
};

const mock = (category) => Array.from({ length: 8 }).map((_, i) => ({
  title: `Offline sample ${i + 1} for ${category}`,
  description: 'Network or provider unavailable. This is local fallback content.',
  source: 'Local fallback',
  publishedAt: new Date(Date.now() - i * 36e5).toISOString(),
  url: '#',
  imageUrl: ''
}));

function formatTime(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function drawTabs() {
  els.tabs.innerHTML = '';
  tabs.forEach((t) => {
    const b = document.createElement('button');
    b.className = `tab ${t.key === state.tab ? 'active' : ''}`;
    b.textContent = t.label;
    b.onclick = () => { state.tab = t.key; drawTabs(); paint(); };
    els.tabs.appendChild(b);
  });
}

function card(a) {
  const image = a.imageUrl ? `<img src="${a.imageUrl}" alt="" loading="lazy">` : '<div class="thumb" style="display:grid;place-items:center;color:#9eb0c5">No image</div>';
  return `<article class="article card"><div class="thumb">${a.imageUrl ? image : image}</div><h3>${a.title}</h3><div class="meta"><span>${a.source}</span><span>${formatTime(a.publishedAt)}</span></div><p class="desc">${a.description || 'No summary available.'}</p><a class="open" href="${a.url || '#'}" target="_blank" rel="noreferrer">Open Article</a></article>`;
}

function paint() {
  const items = state.data[state.tab] || [];
  els.top.innerHTML = items.slice(0, 3).map(card).join('');
  els.cards.innerHTML = items.map(card).join('');
}

async function fetchGdelt(category) {
  const q = encodeURIComponent(qMap[category]);
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&format=json&maxrecords=20`;
  const r = await fetch(url);
  const j = await r.json();
  return (j.articles || []).map((a, i) => ({
    id: `gdelt-${i}`,
    title: a.title,
    description: a.seendate ? `Seen ${a.seendate}` : '',
    source: a.domain || 'GDELT',
    publishedAt: a.seendate ? new Date(a.seendate).toISOString() : new Date().toISOString(),
    url: a.url,
    imageUrl: a.socialimage || ''
  }));
}

async function fetchHN() {
  const r = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page');
  const j = await r.json();
  return (j.hits || []).map((h, i) => ({
    id: `hn-${i}`,
    title: h.title || h.story_title || 'Untitled',
    description: 'Top discussion in technology and startups.',
    source: 'Hacker News',
    publishedAt: h.created_at,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    imageUrl: ''
  }));
}

async function load() {
  els.state.textContent = '';
  els.cards.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  for (const t of tabs) {
    try {
      const gdelt = state.source === 'hn' ? [] : await fetchGdelt(t.key);
      const hn = (state.source === 'all' || state.source === 'hn') && t.key === 'technology' ? await fetchHN() : [];
      state.data[t.key] = [...gdelt, ...hn].slice(0, 18);
      if (!state.data[t.key].length) state.data[t.key] = mock(t.key);
    } catch {
      state.data[t.key] = mock(t.key);
      els.state.textContent = 'Some live sources are unavailable; showing fallback where needed.';
    }
  }
  els.updated.textContent = `Last updated ${new Date().toLocaleString()}`;
  paint();
}

drawTabs();
els.refresh.onclick = load;
els.source.onchange = (e) => { state.source = e.target.value; load(); };
load();
