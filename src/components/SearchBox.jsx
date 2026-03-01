import { useState } from 'react'
import styles from './SearchBox.module.css'

const LEVELS = [
  { key: 'low', label: 'Low', desc: 'Links + snippets only', color: 'var(--green)' },
  { key: 'medium', label: 'Medium', desc: 'Scrapes page content', color: 'var(--yellow)' },
  { key: 'high', label: 'High', desc: 'Deep scrape + sub-pages', color: 'var(--red)' },
]

export default function SearchBox({ level, setLevel, onSearch, loading, progress, error }) {
  const [query, setQuery] = useState('')
  const [numResults, setNumResults] = useState(5)
  const [numSubpages, setNumSubpages] = useState(2)

  const submit = (e) => {
    e.preventDefault()
    if (!query.trim() || loading) return
    onSearch(query.trim(), numResults, numSubpages)
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Scraping...' : '🔍 Search'}
            </button>
          </div>

          <div className={styles.levels}>
            {LEVELS.map((l) => (
              <button
                key={l.key}
                type="button"
                className={`${styles.levelBtn} ${level === l.key ? styles.active : ''}`}
                style={level === l.key ? { borderColor: l.color } : {}}
                onClick={() => setLevel(l.key)}
              >
                <strong>{l.label}</strong>
                <span>{l.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.options}>
            <label>
              Results: <input type="number" min="1" max="20" value={numResults} onChange={(e) => setNumResults(+e.target.value)} />
            </label>
            {level === 'high' && (
              <label>
                Sub-pages: <input type="number" min="0" max="10" value={numSubpages} onChange={(e) => setNumSubpages(+e.target.value)} />
              </label>
            )}
          </div>
        </form>

        {loading && (
          <div className={styles.progress}>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${progress.pct}%` }} />
            </div>
            <span className={styles.label}>{progress.label}</span>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </section>
  )
}
