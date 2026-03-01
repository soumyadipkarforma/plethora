import { jsPDF } from 'jspdf'
import { cleanText } from '../scraper'
import styles from './Results.module.css'

export default function Results({ data }) {
  const downloadTxt = () => {
    let out = `Plethora Report\nQuery: ${data.query}\nLevel: ${data.level}\nDate: ${data.date}\n${'='.repeat(60)}\n\n`
    data.results.forEach((r, i) => {
      out += `${i + 1}. ${cleanText(r.title)}\n   ${r.url}\n   ${cleanText(r.snippet)}\n\n`
    })
    if (data.pages.length) {
      out += '\n--- PAGE CONTENT ---\n\n'
      data.pages.forEach((p) => {
        out += `## ${cleanText(p.searchTitle)}\n   URL: ${p.url}\n   ${cleanText(p.text)}\n\n`
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
      md += `### ${i + 1}. ${cleanText(r.title)}\n- **URL:** ${r.url}\n- ${cleanText(r.snippet)}\n\n`
    })
    download(md, `plethora_${data.query.replace(/\s+/g, '_')}.md`, 'text/markdown')
  }

  const downloadPdf = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxW = pageWidth - margin * 2
    let y = 30

    const addWatermark = () => {
      const wm = 'Plethora \u2014 made by Soumyadip Karforma'
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7)
      doc.setTextColor(160, 160, 160)
      doc.text(wm, pageWidth - margin, 10, { align: 'right' })
      doc.text(`${wm}  |  Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }

    const checkPage = (needed = 20) => {
      if (y + needed > pageHeight - 25) {
        doc.addPage()
        addWatermark()
        y = 25
      }
    }

    addWatermark()

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(`${data.level.toUpperCase()}-Detail Report`, margin, y)
    y += 10

    // Meta
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Query: ${data.query}`, margin, y); y += 6
    doc.text(`Date: ${data.date}`, margin, y); y += 6
    doc.text(`Results: ${data.results.length}`, margin, y); y += 10

    // Results
    data.results.forEach((r, i) => {
      checkPage(30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      const titleLines = doc.splitTextToSize(`${i + 1}. ${r.title}`, maxW)
      doc.text(titleLines, margin, y)
      y += titleLines.length * 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(30, 130, 76)
      const urlLines = doc.splitTextToSize(r.url, maxW)
      doc.text(urlLines, margin, y)
      y += urlLines.length * 5
      doc.setTextColor(0, 0, 0)

      doc.setFontSize(10)
      const snippetLines = doc.splitTextToSize(r.snippet || '', maxW)
      checkPage(snippetLines.length * 5)
      doc.text(snippetLines, margin, y)
      y += snippetLines.length * 5 + 4

      // Page content (medium/high)
      if (data.pages[i]) {
        const pg = data.pages[i]
        if (pg.meta) {
          checkPage(15)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('Meta Description:', margin + 4, y); y += 5
          doc.setFont('helvetica', 'normal')
          const metaLines = doc.splitTextToSize(pg.meta, maxW - 8)
          checkPage(metaLines.length * 4)
          doc.text(metaLines, margin + 4, y)
          y += metaLines.length * 4 + 3
        }
        if (pg.headings?.length) {
          checkPage(15)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('Headings:', margin + 4, y); y += 5
          doc.setFont('helvetica', 'normal')
          const hText = pg.headings.join(', ')
          const hLines = doc.splitTextToSize(hText, maxW - 8)
          checkPage(hLines.length * 4)
          doc.text(hLines, margin + 4, y)
          y += hLines.length * 4 + 3
        }
        if (pg.text) {
          checkPage(15)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('Content Preview:', margin + 4, y); y += 5
          doc.setFont('helvetica', 'normal')
          const cLines = doc.splitTextToSize(pg.text.slice(0, 600), maxW - 8)
          checkPage(cLines.length * 4)
          doc.text(cLines, margin + 4, y)
          y += cLines.length * 4 + 3
        }
      }

      // Subpages (high level)
      if (data.subpages[r.url]?.length) {
        checkPage(15)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('Sub-pages:', margin + 4, y); y += 5
        data.subpages[r.url].forEach((sub) => {
          checkPage(20)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          const stLines = doc.splitTextToSize(sub.linkText || sub.title || '', maxW - 12)
          doc.text(stLines, margin + 8, y)
          y += stLines.length * 4 + 2
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 130, 76)
          doc.setFontSize(8)
          doc.text(sub.url || '', margin + 8, y); y += 5
          doc.setTextColor(0, 0, 0)
          if (sub.text) {
            doc.setFontSize(8)
            const subLines = doc.splitTextToSize(sub.text.slice(0, 300), maxW - 12)
            checkPage(subLines.length * 4)
            doc.text(subLines, margin + 8, y)
            y += subLines.length * 4 + 2
          }
        })
      }

      y += 6
    })

    doc.save(`plethora_${data.query.replace(/\s+/g, '_')}.pdf`)
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
            <button className={styles.exportBtn} onClick={downloadPdf}>📑 PDF</button>
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
            <p className={styles.snippet}>{cleanText(r.snippet)}</p>

            {data.pages[i] && (
              <div className={styles.details}>
                {data.pages[i].meta && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Meta Description</div>
                    <div className={styles.detailContent}>{cleanText(data.pages[i].meta)}</div>
                  </div>
                )}
                {data.pages[i].headings?.length > 0 && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Headings</div>
                    <div className={styles.detailContent}>
                      {data.pages[i].headings.map((h, j) => (
                        <span key={j} className={styles.tag}>{cleanText(h)}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.pages[i].text && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>Content Preview</div>
                    <div className={styles.detailContent}>{cleanText(data.pages[i].text)}</div>
                  </div>
                )}

                {data.subpages[r.url]?.length > 0 && (
                  <div className={styles.subpages}>
                    <div className={styles.detailLabel}>Sub-pages</div>
                    {data.subpages[r.url].map((sub, k) => (
                      <div key={k} className={styles.subpageItem}>
                        <div className={styles.subpageTitle}>{cleanText(sub.linkText || sub.title)}</div>
                        <div className={styles.subpageUrl}>{sub.url}</div>
                        {sub.text && <div className={styles.subpageContent}>{cleanText(sub.text)}</div>}
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
