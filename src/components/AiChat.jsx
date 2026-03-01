import { useState, useRef, useEffect } from 'react'
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

const MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'claude-sonnet', label: 'Claude Sonnet' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini Flash' },
]

export default function AiChat({ visible, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('gpt-4o-mini')
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [visible])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const chatHistory = [
        {
          role: 'system',
          content: 'You are Plethora AI, a web research assistant built into the Plethora search tool by Soumyadip Karforma. Help users find information, analyze topics, and provide comprehensive answers. Be concise but thorough. Use bullet points and bold text for clarity. When users ask questions, provide well-structured responses with key points.',
        },
        ...newMessages,
      ]

      const response = await puter.ai.chat(chatHistory, { model, stream: true })

      let assistantText = ''
      const assistantIdx = newMessages.length

      setMessages([...newMessages, { role: 'assistant', content: '' }])

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
        { role: 'assistant', content: `**Error:** ${e.message || 'Failed to get AI response. Please try again.'}` },
      ])
    } finally {
      setLoading(false)
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
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${visible ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${visible ? styles.panelVisible : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>✨ Plethora AI</span>
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
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.messages} ref={messagesRef}>
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>🤖</div>
              <h3>Hey! I'm Plethora AI</h3>
              <p>Ask me anything — web research, topic analysis, comparisons, summaries. I'm here to help.</p>
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
          {loading && messages[messages.length - 1]?.role === 'user' && (
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
            placeholder="Ask Plethora AI anything..."
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
    </>
  )
}
