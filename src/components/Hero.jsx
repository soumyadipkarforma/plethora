import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.badge}>🚀 Open Source Web Research Tool</div>
        <h1 className={styles.title}>
          Search. Scrape.<br />
          <span className={styles.gradient}>Report Everything.</span>
        </h1>
        <p className={styles.subtitle}>
          Plethora searches the web, scrapes pages at three detail levels,
          and generates beautiful reports in TXT, Markdown, HTML, JSON, and PDF — all from your browser.
        </p>
      </div>
    </section>
  )
}
