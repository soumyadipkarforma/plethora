const CORS_PROXY = 'https://api.allorigins.win/raw?url='
const PAGE_TIMEOUT = 8000

function parseDDGPage(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const links = doc.querySelectorAll('.result__a')
  const snippets = doc.querySelectorAll('.result__snippet')
  const results = []
  links.forEach((a, i) => {
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

export async function searchDuckDuckGo(query, numResults = 10) {
  const baseUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const pagesNeeded = Math.min(5, Math.ceil(numResults / 20))
  const offsets = Array.from({ length: pagesNeeded }, (_, i) => i * 20)

  const fetches = offsets.map(async (offset) => {
    const url = offset === 0 ? baseUrl : `${baseUrl}&s=${offset}&dc=${offset + 1}`
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(url))
      return parseDDGPage(await res.text())
    } catch {
      return []
    }
  })

  const pages = await Promise.all(fetches)
  const seen = new Set()
  const results = []
  for (const page of pages) {
    for (const r of page) {
      if (!seen.has(r.url)) {
        seen.add(r.url)
        results.push(r)
      }
      if (results.length >= numResults) return results
    }
  }
  return results
}

export async function scrapePage(url, maxLen = 500) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT)
    const res = await fetch(CORS_PROXY + encodeURIComponent(url), { signal: controller.signal })
    clearTimeout(timer)

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
      return { title: '', meta: '', headings: [], text: `[Non-HTML content: ${contentType}]`, links: [] }
    }

    const html = await res.text()
    if (!html || html.length < 100) {
      return { title: '', meta: '', headings: [], text: '[Empty or blocked response]', links: [] }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Remove non-content elements (expanded list for Wikipedia, news sites, etc.)
    const junk = 'script,style,nav,footer,header,aside,iframe,noscript,svg,figure,img,' +
      'table.infobox,table.sidebar,table.navbox,table.metadata,table.ambox,' +
      '.infobox,.sidebar,.navbox,.metadata,.mw-editsection,.reference,.reflist,' +
      '.toc,.catlinks,.mw-jump-link,.noprint,.mw-empty-elt,' +
      '[role="navigation"],[role="banner"],[aria-hidden="true"],' +
      '.ad,.ads,.advert,.advertisement,.social-share,.cookie-banner,.popup'
    doc.querySelectorAll(junk).forEach(el => el.remove())

    const title = doc.querySelector('title')?.textContent?.trim() || ''
    const meta = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    const headings = [...doc.querySelectorAll('h1,h2,h3')].slice(0, 10)
      .map(h => h.textContent.replace(/\s+/g, ' ').trim())
      .filter(h => h.length > 1 && h.length < 200)

    // Extract text from content containers first, fall back to body
    const contentEl = doc.querySelector('article, main, [role="main"], .mw-parser-output, .post-content, .entry-content, .content') || doc.body
    const rawText = (contentEl?.textContent || '').replace(/[\t\r]+/g, ' ').replace(/\n{3,}/g, '\n\n').replace(/ {2,}/g, ' ').trim()
    const text = rawText.slice(0, maxLen) || '[No readable content]'

    // Resolve relative URLs against the page's origin
    let baseUrl
    try { baseUrl = new URL(url) } catch { baseUrl = null }

    const links = [...doc.querySelectorAll('a[href]')].reduce((acc, a) => {
      if (acc.length >= 20) return acc
      const linkText = a.textContent.trim().slice(0, 80)
      if (!linkText || linkText.length < 3) return acc
      let href = a.getAttribute('href') || ''
      // Skip anchors, javascript:, mailto:, and edit links
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return acc
      if (href.includes('/edit') || href.includes('action=edit')) return acc
      // Resolve relative URLs
      if (baseUrl && !href.startsWith('http')) {
        try { href = new URL(href, baseUrl.origin).href } catch { return acc }
      }
      if (!href.startsWith('http')) return acc
      acc.push({ text: linkText, url: href })
      return acc
    }, [])

    return { title, meta, headings, text, links }
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Timed out' : e.message
    return { title: '', meta: '', headings: [], text: `[Error: ${msg}]`, links: [] }
  }
}

export async function scrapePagesBatch(urls, maxLen = 500) {
  return Promise.all(urls.map((url) => scrapePage(url, maxLen)))
}
