import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchBox from './components/SearchBox'
import Results from './components/Results'
import Features from './components/Features'
import WhyPlethora from './components/WhyPlethora'
import SupportSection from './components/SupportSection'
import Footer from './components/Footer'
import AiChat from './components/AiChat'
import { searchDuckDuckGo, scrapePage, scrapePagesBatch } from './scraper'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

export default function App() {
  const route = useHashRoute()
  const [level, setLevel] = useState('medium')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ pct: 0, label: '' })
  const [error, setError] = useState('')

  const handleSearch = useCallback(async (query, numResults, numSubpages) => {
    setLoading(true)
    setError('')
    setResults(null)
    setProgress({ pct: 5, label: 'Searching DuckDuckGo...' })

    try {
      const searchResults = await searchDuckDuckGo(query, numResults)
      if (searchResults.length === 0) {
        setError('No results found. Try a different query.')
        setLoading(false)
        return
      }

      setProgress({ pct: 15, label: `Found ${searchResults.length} results` })

      const data = {
        query,
        level,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        results: searchResults,
        pages: [],
        subpages: {},
      }

      if (level !== 'low') {
        const maxLen = level === 'high' ? 2000 : 500
        setProgress({
          pct: 20,
          label: `Scraping ${searchResults.length} pages concurrently...`,
        })

        const pages = await scrapePagesBatch(
          searchResults.map((r) => r.url),
          maxLen,
        )
        pages.forEach((page, i) => {
          page.url = searchResults[i].url
          page.searchTitle = searchResults[i].title
        })
        data.pages = pages

        if (level === 'high' && numSubpages > 0) {
          setProgress({ pct: 60, label: 'Collecting sub-page URLs...' })
          const subTasks = []
          for (let i = 0; i < pages.length; i++) {
            const subLinks = (pages[i].links || []).slice(0, numSubpages)
            for (const link of subLinks) {
              subTasks.push({ parentUrl: searchResults[i].url, link })
            }
          }

          if (subTasks.length > 0) {
            setProgress({
              pct: 65,
              label: `Scraping ${subTasks.length} sub-pages concurrently...`,
            })
            const subResults = await scrapePagesBatch(
              subTasks.map((t) => t.link.url),
              800,
            )
            subResults.forEach((sub, i) => {
              sub.url = subTasks[i].link.url
              sub.linkText = subTasks[i].link.text
              const key = subTasks[i].parentUrl
              if (!data.subpages[key]) data.subpages[key] = []
              data.subpages[key].push(sub)
            })
          }
        }
      }

      setProgress({ pct: 100, label: 'Done!' })
      setResults(data)
    } catch (e) {
      setError('Search failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [level])

  if (route === '#/chat') {
    return <AiChat fullPage />
  }

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <Header onAiToggle={() => { window.location.hash = '#/chat' }} aiActive={false} />
      <Hero />

      <SearchBox
        level={level}
        setLevel={setLevel}
        onSearch={handleSearch}
        loading={loading}
        progress={progress}
        error={error}
      />

      {results && <Results data={results} />}

      <Features />
      <WhyPlethora />
      <SupportSection />
      <Footer />

      <div style={{
        position: 'fixed', bottom: 12, right: 16, fontSize: '0.68rem',
        color: 'var(--text-muted)', opacity: 0.5, pointerEvents: 'none', zIndex: 200,
      }}>
        Plethora — made by Soumyadip Karforma
      </div>
    </>
  )
}
