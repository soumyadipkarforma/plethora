import { useState } from 'react'
import styles from './CliSection.module.css'

const COMMANDS = [
  {
    label: 'Quick Scripts',
    lines: [
      { type: 'comment', text: '# One-liner shell wrappers' },
      { parts: [
        { type: 'cmd', text: './scrape-low' },
        { type: 'str', text: ' "best python frameworks"' },
      ]},
      { parts: [
        { type: 'cmd', text: './scrape-med' },
        { type: 'str', text: ' "machine learning papers"' },
        { type: 'flag', text: ' 8' },
      ]},
      { parts: [
        { type: 'cmd', text: './scrape-high' },
        { type: 'str', text: ' "web security research"' },
        { type: 'flag', text: ' 5 3' },
      ]},
    ],
  },
  {
    label: 'Python CLI',
    lines: [
      { type: 'comment', text: '# Full CLI with all options' },
      { parts: [
        { type: 'cmd', text: 'python scrape.py' },
        { type: 'str', text: ' "AI news"' },
        { type: 'flag', text: ' --level high' },
        { type: 'flag', text: ' --format all' },
        { type: 'flag', text: ' --workers 8' },
      ]},
      { parts: [
        { type: 'cmd', text: 'python scrape.py' },
        { type: 'str', text: ' "data science"' },
        { type: 'flag', text: ' --format pdf' },
        { type: 'flag', text: ' --level medium' },
      ]},
    ],
  },
  {
    label: 'Setup',
    lines: [
      { type: 'comment', text: '# Platform-specific setup' },
      { parts: [
        { type: 'cmd', text: 'bash' },
        { type: 'flag', text: ' termux-setup' },
      ]},
      { parts: [
        { type: 'cmd', text: 'bash' },
        { type: 'flag', text: ' linux-setup' },
      ]},
      { parts: [
        { type: 'cmd', text: 'bash' },
        { type: 'flag', text: ' mac-setup' },
      ]},
    ],
  },
]

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false)

  const plain = block.lines.map(l => {
    if (l.type === 'comment') return l.text
    return l.parts.map(p => p.text).join('')
  }).join('\n')

  const copy = () => {
    navigator.clipboard.writeText(plain).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={styles.block}>
      <div className={styles.blockHeader}>
        <span className={styles.blockLabel}>{block.label}</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.pre}>
        {block.lines.map((line, i) => (
          <div key={i}>
            {line.type === 'comment'
              ? <span className={styles.comment}>{line.text}</span>
              : line.parts.map((p, j) => (
                  <span key={j} className={styles[p.type]}>{p.text}</span>
                ))
            }
          </div>
        ))}
      </pre>
    </div>
  )
}

export default function CliSection() {
  return (
    <section className={styles.section} id="cli">
      <div className="container">
        <h2 className={styles.heading}>CLI Usage</h2>
        <p className={styles.subtitle}>Multiple ways to run Plethora from your terminal</p>
        <div className={styles.grid}>
          {COMMANDS.map((block, i) => (
            <CodeBlock key={i} block={block} />
          ))}
        </div>
        <div className={styles.cta}>
          <a
            href="https://github.com/soumyadipkarforma/plethora"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.starBtn}
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
