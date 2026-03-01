import styles from './Footer.module.css'

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/soumyadipkarforma', icon: '🐙' },
  { label: 'Instagram', href: 'https://instagram.com/soumyadip_karforma', icon: '📸' },
  { label: 'X', href: 'https://x.com/soumyadip_k', icon: '𝕏' },
  { label: 'YouTube', href: 'https://youtube.com/@soumyadip_karforma', icon: '▶️' },
  { label: 'Email', href: 'mailto:soumyadipkarforma@gmail.com', icon: '✉️' },
  { label: 'BuyMeACoffee', href: 'https://buymeacoffee.com/soumyadipkarforma', icon: '☕' },
  { label: 'Patreon', href: 'https://patreon.com/SoumyadipKarforma', icon: '🎨' },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <span className={styles.brand}>Plethora</span>
          <a
            href="https://github.com/sponsors/soumyadipkarforma"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sponsorBtn}
          >
            ❤️ Sponsor
          </a>
        </div>

        <div className={styles.socials}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title={s.label}
            >
              <span className={styles.socialIcon}>{s.icon}</span>
              <span>{s.label}</span>
            </a>
          ))}
        </div>

        <p className={styles.copy}>
          Built by Soumyadip Karforma · MIT License · 2026
        </p>
      </div>
    </footer>
  )
}
