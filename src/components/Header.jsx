import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#" className={styles.logo}>
          <div className={styles.logoIcon}>🔍</div>
          Plethora
        </a>
        <nav className={styles.links}>
          <a href="#features">Features</a>
          <a
            href="https://github.com/soumyadipkarforma/plethora"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ghBtn}
          >
            ⭐ <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
