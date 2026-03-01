import styles from './Results.module.css'

export default function Results({ data }) {
  const downloadTxt = () => {
    let out = `Plethora Report\nQuery: ${data.query}\nLevel: ${data.level}\nDate: ${data.date}\n${'='.repeat(60)}\n\n`
    data.results.forEach((r, i) => {
      out += `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}\n\n`
    })
    if (data.pages.length) {
      out += '\n--- PAGE CONTENT ---\n\n'
      data.pages.forEach((p) => {
        out += `## ${p.searchTitle}\n   URL: ${p.url}\n   ${p.text}\n\n`
      })
    }
    download(out, `plethora_${data.query.replace(/\s+/g, '_')}.txt`, 'text/plain')
  }

  const downloadJson = () => {
    download(JSON.stringify(data, null, 2), `plethora_${data.query.replace(/\s+/g, '_')}.json`, 'application/json')
  }

  const downloadMd = () => {
    let md = `# Plethora Report\n\n**Query:** ${data.query}  \n**Level:** ${data.level}  \n**Date:** ${data.date}\n\n---\n\n`
    data.results.forEach((r, i) => {
      md += `### ${i + 1}. ${r.title}\n- **URL:** ${r.url}\n- ${r.snippet}\n\n`
    })
    download(md, `plethora_${data.query.replace(/\s+/g, '_')}.md`, 'text/markdown')
  }

  const download = (content, name, type) => {
    const blob = new Blob([content], { type })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Results for <span>"{data.query}"</span>
          </h2>
          <div className={styles.exportBtns}>
            <button className={styles.exportBtn} onClick={downloadTxt}>📄 TXT</button>
            <button className={styles.exportBtn} onClick={downloadMd}>📝 MD</button>
            <button className={styles.exportBtn} onClick={downloadJson}>📊 JSON</button>
          </div>
        </div>

        {data.results.map((r, i) => (
          <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={styles.titleRow}>
              <span className={styles.num}>{i + 1}</span>
              <div>
                <div className={styles.title}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                </div>
                <div className={styles.url}>{r.url}</div>
              </div>
            </div>
            <p className={styles.snippet}>{r.snippet}</p>

            {data.pages[i] && (
              <div className={styles.details}>
                {data.pages[i].meta && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Meta Description</div>
                    <div className={styles.detailContent}>{data.pages[i].meta}</div>
                  </div>
                )}
                {data.pages[i].headings?.length > 0 && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Headings</div>
                    <div className={styles.detailContent}>
                      {data.pages[i].headings.map((h, j) => (
                        <span key={j} className={styles.tag}>{h}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.pages[i].text && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Content Preview</div>
                    <div className={styles.detailContent}>{data.pages[i].text}</div>
                  </div>
                )}

                {data.subpages[r.url]?.length > 0 && (
                  <div className={styles.subpages}>
                    <div className={styles.detailLabel}>Sub-pages</div>
                    {data.subpages[r.url].map((sub, k) => (
                      <div key={k} className={styles.subpageItem}>
                        <div className={styles.subpageTitle}>{sub.linkText || sub.title}</div>
                        <div className={styles.subpageUrl}>{sub.url}</div>
                        {sub.text && <div className={styles.subpageContent}>{sub.text}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
