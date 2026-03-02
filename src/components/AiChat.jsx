import { useState, useRef, useEffect } from 'react'
import { searchDuckDuckGo, scrapePagesBatch, cleanText } from '../scraper'
import styles from './AiChat.module.css'

function markdownToHtml(text) {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br>')
}

async function generateQueries(userMessage) {
  try {
    const resp = await puter.ai.chat(
      `You are a search query generator. Given a user question, generate 3-5 diverse search queries that would help answer it comprehensively. Return ONLY a JSON array of strings, nothing else.

User question: "${userMessage}"

Example output: ["query 1", "query 2", "query 3"]`,
      { model: 'gpt-4o-mini' }
    )
    const text = typeof resp === 'string' ? resp : resp?.message?.content || ''
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      const queries = JSON.parse(match[0])
      if (Array.isArray(queries) && queries.length > 0) {
        return queries.slice(0, 5)
      }
    }
  } catch (e) {
    console.warn('Query generation failed, using original:', e)
  }
  return [userMessage]
}

async function parallelWebSearch(userMessage, onStatus) {
  try {
    onStatus('🧠 Generating search queries...')
    const queries = await generateQueries(userMessage)

    onStatus(`🌐 Searching ${queries.length} queries in parallel...`)
    const searchPromises = queries.map(async (query) => {
      try {
        const results = await searchDuckDuckGo(query, 8)
        const urls = results.map(r => r.url)
        const pages = await scrapePagesBatch(urls, 1200)
        return { query, results, pages }
      } catch (e) {
        console.warn(`Search failed for "${query}":`, e)
        return { query, results: [], pages: [] }
      }
    })

    const allSearches = await Promise.all(searchPromises)

    // Merge and deduplicate results
    const seenUrls = new Set()
    let mergedContext = `LIVE WEB SEARCH RESULTS — scraped on ${new Date().toISOString().slice(0, 16)}:\n\n`
    let totalResults = 0
    let totalScraped = 0

    for (const search of allSearches) {
      for (let i = 0; i < search.results.length; i++) {
        const r = search.results[i]
        if (seenUrls.has(r.url)) continue
        seenUrls.add(r.url)
        totalResults++

        let entry = `[${totalResults}] ${cleanText(r.title)}\nURL: ${r.url}\n`
        if (r.snippet) entry += `Snippet: ${cleanText(r.snippet)}\n`
        const page = search.pages[i]
        if (page && !page.error) {
          const txt = page.text ? cleanText(page.text) : ''
          if (txt.length > 50 && !txt.startsWith('[Error') && !txt.startsWith('[Non-HTML')) {
            entry += `Content: ${txt.slice(0, 1000)}\n`
            totalScraped++
          }
          if (page.headings?.length) {
            entry += `Headings: ${page.headings.slice(0, 6).map(h => typeof h === 'string' ? cleanText(h) : cleanText(h.text || '')).join(' | ')}\n`
          }
          if (page.meta) {
            entry += `Meta: ${cleanText(page.meta)}\n`
          }
        }
        mergedContext += entry + '\n---\n\n'
      }
    }

    return {
      context: mergedContext || '[No results found]',
      resultCount: totalResults,
      scrapedPages: totalScraped,
      queriesUsed: queries,
    }
  } catch (e) {
    return { context: `[Web search error: ${e.message}]`, resultCount: 0, scrapedPages: 0, queriesUsed: [userMessage] }
  }
}

const MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-sonnet', label: 'Claude Sonnet' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini Flash' },
]

// Scrape the web for a query and return a context string
async function webSearch(query, onStatus) {
  try {
    onStatus('🔍 Searching the web...')
    const results = await searchDuckDuckGo(query, 10)
    if (!results.length) return { context: '[No web results found for this query]', resultCount: 0 }

    onStatus(`📄 Scraping ${results.length} pages...`)
    const pages = await scrapePagesBatch(results.map(r => r.url), 1500)

    let context = `LIVE WEB SEARCH RESULTS for "${query}" — scraped on ${new Date().toISOString().slice(0, 16)}:\n\n`
    let goodPages = 0
    results.forEach((r, i) => {
      const page = pages[i]
      context += `[${i + 1}] ${cleanText(r.title)}\n`
      context += `URL: ${r.url}\n`
      if (r.snippet) context += `Snippet: ${cleanText(r.snippet)}\n`
      if (page?.text) {
        const txt = cleanText(page.text)
        if (txt.length > 50 && !txt.startsWith('[Error') && !txt.startsWith('[Non-HTML')) {
          context += `Page Content: ${txt.slice(0, 1000)}\n`
          goodPages++
        }
        if (page.headings?.length) {
          context += `Page Headings: ${page.headings.slice(0, 6).map(cleanText).join(' | ')}\n`
        }
        if (page.meta) {
          context += `Meta: ${cleanText(page.meta)}\n`
        }
      }
      context += '\n---\n\n'
    })
    return { context, resultCount: results.length, scrapedPages: goodPages }
  } catch (e) {
    return { context: `[Web search error: ${e.message}]`, resultCount: 0, scrapedPages: 0 }
  }
}

export default function AiChat({ fullPage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('gpt-4o-mini')
  const [status, setStatus] = useState('')
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, status])

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStatus('')

    try {
      // Generate parallel queries and search the web
      const webData = await parallelWebSearch(text, setStatus)
      const { context: webContext, resultCount, scrapedPages, queriesUsed } = webData

      if (resultCount > 0) {
        setStatus(`🤖 AI analyzing ${resultCount} results from ${queriesUsed.length} queries (${scrapedPages} pages scraped)...`)
      } else {
        setStatus('🤖 AI is thinking (no web results found)...')
      }

      const chatHistory = [
        {
          role: 'system',
          content: `You are Plethora AI, a web research assistant by Soumyadip Karforma. You have access to LIVE web data scraped just now. Your job is to synthesize this data into a clear, helpful answer.

IMPORTANT RULES:
- Use the live web data below as your PRIMARY source. It was scraped seconds ago.
- Always cite sources with [Source Title](URL) format.
- If the data contains relevant information, present it clearly with bullet points and bold headers.
- If the scraped data doesn't cover the topic well, say so honestly and share what you DID find.
- Never say "I cannot find information" if the web data below contains relevant content — read it carefully.
- Today's date is ${new Date().toISOString().slice(0, 10)}.

Search queries used: ${queriesUsed?.join(' | ') || 'direct search'}

${webContext}`,
        },
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ]

      const response = await puter.ai.chat(chatHistory, { model, stream: true })

      let assistantText = ''
      const assistantIdx = newMessages.length
      setMessages([...newMessages, { role: 'assistant', content: '' }])
      setStatus('')

      for await (const part of response) {
        const chunk = part?.text || ''
        assistantText += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[assistantIdx] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `**Error:** ${e.message || 'Failed to get response. Try again.'}` },
      ])
      setStatus('')
    } finally {
      setLoading(false)
      setStatus('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setStatus('')
  }

  const panel = (
    <div className={`${styles.panel} ${fullPage ? styles.panelFull : styles.panelVisible}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>✨ Plethora AI</span>
          <span className={styles.liveBadge}>LIVE WEB</span>
          <button className={styles.clearBtn} onClick={clearChat}>Clear</button>
        </div>
        <div className={styles.headerRight}>
          <select
            className={styles.modelSelect}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {!fullPage && (
            <a href="#/" className={styles.closeBtn}>✕</a>
          )}
          {fullPage && (
            <a href="#/" className={styles.backBtn}>← Back</a>
          )}
        </div>
      </div>

      <div className={styles.messages} ref={messagesRef}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>🤖</div>
            <h3>Hey! I'm Plethora AI</h3>
            <p>I search the web <strong>live</strong> for every question you ask — no stale training data. Ask me anything and I'll scrape fresh results to give you up-to-date answers.</p>
            <div className={styles.welcomeTags}>
              <span>🔍 Live Search</span>
              <span>📄 Page Scraping</span>
              <span>🧠 AI Analysis</span>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >
            {msg.role === 'assistant' ? (
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content || '') }} />
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && status && (
          <div className={`${styles.message} ${styles.statusMsg}`}>
            {status}
          </div>
        )}
        {loading && !status && messages[messages.length - 1]?.role === 'user' && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.dots}>
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder="Ask anything — I'll search the web live..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        {panel}
      </div>
    )
  }

  return panel
}
