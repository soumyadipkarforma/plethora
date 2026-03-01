import styles from './Features.module.css'

const FEATURES = [
  { icon: '🎯', title: 'Three Detail Levels', desc: 'Low for quick overviews, Medium for page content, High for deep scraping with sub-pages. You choose the depth.' },
  { icon: '📄', title: '5 Output Formats', desc: 'Export as TXT, Markdown, HTML (dark theme), JSON, or PDF — with the Plethora watermark on every report.' },
  { icon: '⚡', title: 'Concurrent Scraping', desc: 'Multi-threaded page fetching with configurable workers. Fast results even with large result sets.' },
  { icon: '🤖', title: 'robots.txt Respect', desc: 'Checks robots.txt before scraping any site. Per-domain rate limiting keeps things ethical.' },
  { icon: '💾', title: 'Smart Caching', desc: 'Already-fetched URLs are cached locally with configurable TTL. No repeated downloads.' },
  { icon: '🐚', title: 'Shell Scripts', desc: 'One-liner shell wrappers: ./scrape-low, ./scrape-med, ./scrape-high. No flags needed.' },
]

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className="container">
        <h2 className={styles.heading}>Powerful Features</h2>
        <p className={styles.subtitle}>Everything you need for serious web research</p>
        <div className={styles.grid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
