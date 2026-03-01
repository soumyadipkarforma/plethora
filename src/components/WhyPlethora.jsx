import styles from './WhyPlethora.module.css'

const REASONS = [
  { icon: '🔒', title: 'Total Privacy', desc: 'No tracking, no cookies, no search history. Your queries stay yours.' },
  { icon: '🚫', title: 'Zero Ads', desc: 'Pure results. No sponsored links, no SEO spam cluttering your view.' },
  { icon: '📊', title: 'Exportable Reports', desc: 'Download results as TXT, Markdown, JSON, HTML, or PDF. Google can\'t do that.' },
  { icon: '🔬', title: 'Deep Scraping', desc: 'Goes beyond search results — actually visits pages and extracts content, headings, and sub-pages.' },
  { icon: '⚡', title: '100 Results at Once', desc: 'Google shows 10. Plethora gives you up to 100 results with full content.' },
  { icon: '🌐', title: 'Open Source', desc: 'Free forever. See the code, fork it, improve it.' },
]

export default function WhyPlethora() {
  return (
    <section className={styles.section} id="why-plethora">
      <div className="container">
        <h2 className={styles.heading}>Why Plethora Over Google?</h2>
        <p className={styles.subtitle}>Google gives you links. Plethora gives you knowledge.</p>
        <div className={styles.grid}>
          {REASONS.map((r, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
