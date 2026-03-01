const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export async function searchDuckDuckGo(query, numResults = 5) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const res = await fetch(CORS_PROXY + encodeURIComponent(url))
  const html = await res.text()

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const links = doc.querySelectorAll('.result__a')
  const snippets = doc.querySelectorAll('.result__snippet')

  const results = []
  links.forEach((a, i) => {
    if (i >= numResults) return
    let href = a.getAttribute('href') || ''
    if (href.includes('uddg=')) {
      try {
        const u = new URL('https://duckduckgo.com' + href)
        href = decodeURIComponent(u.searchParams.get('uddg') || href)
      } catch { /* keep original */ }
    }
    results.push({
      title: a.textContent.trim(),
      url: href,
      snippet: snippets[i]?.textContent?.trim() || '',
    })
  })
  return results
}

export async function scrapePage(url, maxLen = 500) {
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(url))
    const html = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    doc.querySelectorAll('script,style,nav,footer,header,aside,iframe').forEach(el => el.remove())

    const title = doc.querySelector('title')?.textContent?.trim() || ''
    const meta = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const headings = [...doc.querySelectorAll('h1,h2,h3')].slice(0, 10).map(h => h.textContent.trim())
    const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, maxLen)
    const links = [...doc.querySelectorAll('a[href]')].slice(0, 20).map(a => ({
      text: a.textContent.trim().slice(0, 80),
      url: a.href,
    })).filter(l => l.text && l.url.startsWith('http'))

    return { title, meta, headings, text, links }
  } catch (e) {
    return { title: '', meta: '', headings: [], text: `Error: ${e.message}`, links: [] }
  }
}
