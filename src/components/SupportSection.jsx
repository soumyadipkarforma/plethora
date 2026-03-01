import styles from './SupportSection.module.css'

export default function SupportSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <h2 className={styles.heading}>Built with ❤️ by Soumyadip Karforma</h2>
            <p className={styles.message}>
              I built Plethora as a free, open-source tool for everyone. If it saves you time
              or you find it useful, consider supporting my work — it keeps me building.
            </p>
            <div className={styles.buttons}>
              <a
                href="https://github.com/sponsors/soumyadipkarforma"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnGithub}`}
              >
                💖 Sponsor on GitHub
              </a>
              <a
                href="https://buymeacoffee.com/soumyadipkarforma"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnCoffee}`}
              >
                ☕ Buy Me a Coffee
              </a>
              <a
                href="https://patreon.com/SoumyadipKarforma"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnPatreon}`}
              >
                🎨 Support on Patreon
              </a>
            </div>
            <p className={styles.thanks}>Every bit of support means the world. Thank you! 🙏</p>
          </div>
        </div>
      </div>
    </section>
  )
}
