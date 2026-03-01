import { useState, useCallback } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchBox from './components/SearchBox'
import Results from './components/Results'
import Features from './components/Features'
import CliSection from './components/CliSection'
import Footer from './components/Footer'
import { searchDuckDuckGo, scrapePage } from './scraper'

export default function App() {
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
        for (let i = 0; i < searchResults.length; i++) {
          const pct = 15 + (70 * (i / searchResults.length))
          setProgress({
            pct,
            label: `Scraping ${i + 1}/${searchResults.length}: ${searchResults[i].title.slice(0, 40)}...`,
          })

          const page = await scrapePage(searchResults[i].url, level === 'high' ? 2000 : 500)
          page.url = searchResults[i].url
          page.searchTitle = searchResults[i].title
          data.pages.push(page)

          if (level === 'high' && numSubpages > 0 && page.links?.length > 0) {
            const subLinks = page.links.slice(0, numSubpages)
            const subs = []
            for (const link of subLinks) {
              setProgress({ pct: pct + 2, label: `Sub-page: ${link.text.slice(0, 30)}...` })
              const sub = await scrapePage(link.url, 800)
              sub.url = link.url
              sub.linkText = link.text
              subs.push(sub)
            }
            data.subpages[searchResults[i].url] = subs
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

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <Header />
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
      <CliSection />
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
