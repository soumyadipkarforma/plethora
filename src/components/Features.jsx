import styles from './Features.module.css'

const FEATURES = [
  { icon: '🎯', title: 'Three Detail Levels', desc: 'Low for quick overviews, Medium for page content, High for deep scraping with sub-pages.' },
  { icon: '📄', title: '5 Export Formats', desc: 'Download as TXT, Markdown, HTML, JSON, or PDF — every report watermarked with the Plethora brand.' },
  { icon: '⚡', title: 'Blazing Fast', desc: 'Concurrent batch scraping fetches all pages simultaneously. 100 results scraped in seconds.' },
  { icon: '🔒', title: 'Private by Design', desc: 'No tracking, no cookies, no accounts. Your searches never leave your browser.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Runs in any modern browser. No installation, no setup, no dependencies.' },
  { icon: '🆓', title: 'Free & Open Source', desc: 'MIT licensed. Use it, fork it, improve it. Community-driven and transparent.' },
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
