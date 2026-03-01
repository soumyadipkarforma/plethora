<div align="center">

# 🌐 Plethora — Web App

### Search the web. Scrape the sites. Generate reports. All from your browser.

This is the web interface for [Plethora](https://github.com/soumyadipkarforma/plethora) —
I built it so you don't even need a terminal. Just open the site, type your query,
pick a detail level, and download your report as TXT, Markdown, JSON, HTML, or PDF.

🔗 **Live at [soumyadipkarforma.github.io/plethora](https://soumyadipkarforma.github.io/plethora/)**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](#tech-stack)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](#tech-stack)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Sponsor](https://img.shields.io/badge/sponsor-💖_Sponsor_Me-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/soumyadipkarforma)

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/soumyadip_karforma) [![X](https://img.shields.io/badge/X-black.svg?logo=X&logoColor=white)](https://x.com/soumyadip_k) [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@soumyadip_karforma) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:soumyadipkarforma@gmail.com)

</div>

---

## 💡 Why This Exists

The [main CLI tool](https://github.com/soumyadipkarforma/plethora) is powerful, but not
everyone wants to open a terminal. So I built this — a full React web app that does the
same thing: searches the web, scrapes result pages, and lets you download clean reports.

No backend, no API keys, no sign-up. It runs entirely in your browser.

---

## ✨ What It Does

- **Search** — queries DuckDuckGo and pulls real results
- **Three detail levels** — Low (results only), Medium (page content), High (deep scrape + sub-pages)
- **Live progress** — watch it scrape in real-time with a progress bar
- **5 export formats** — download as TXT, Markdown, JSON, HTML, or PDF
- **PDF watermark** — every PDF includes "Plethora — made by Soumyadip Karforma"
- **Dark theme** — beautiful UI with animated backgrounds and smooth transitions
- **Fully client-side** — no server needed, everything runs in the browser

---

## 📋 What Each Level Gets You

```
┌──────────┬──────────────────────────────────────────────────────┐
│  Level   │  What You Get                                       │
├──────────┼──────────────────────────────────────────────────────┤
│  🟢 LOW  │  Search results list — titles, URLs, snippets       │
│          │  ⚡ Instant — doesn't visit any pages                │
├──────────┼──────────────────────────────────────────────────────┤
│  🟡 MED  │  Visits each result page — pulls headings, meta,    │
│          │  and a content preview                               │
├──────────┼──────────────────────────────────────────────────────┤
│  🔴 HIGH │  Deep scrape — full page content + follows links    │
│          │  to sub-pages with content previews                  │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 📝 Export Formats

| Format | Description |
|--------|-------------|
| **📄 TXT** | Clean plain text report |
| **📝 Markdown** | Ready to paste into docs or notes |
| **📊 JSON** | Raw structured data for your own scripts |
| **🌐 HTML** | Self-contained dark-themed HTML file |
| **📑 PDF** | Portable PDF with watermark — share or print |

---

## 🛠 Tech Stack

- **React 19** — UI components
- **Vite 7** — blazing fast builds
- **jsPDF** — client-side PDF generation
- **DuckDuckGo HTML** — search via CORS proxy (no API key needed)
- **CSS Modules** — scoped styling with custom dark theme
- **GitHub Pages** — deployed from `docs/`

---

## 🚀 Development

Want to run it locally or contribute?

```bash
# Clone just this branch
git clone -b website https://github.com/soumyadipkarforma/plethora.git plethora-web
cd plethora-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. The `docs/` directory contains the latest production build
for GitHub Pages.

---

## 📂 Project Structure

```
website/
├── src/
│   ├── App.jsx              # Main app — search logic, state management
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles, CSS variables, dark theme
│   ├── scraper.js           # Search & scrape engine (DuckDuckGo + CORS proxy)
│   └── components/
│       ├── Header.jsx       # Navigation bar with GitHub link
│       ├── Hero.jsx         # Landing section with gradient title
│       ├── SearchBox.jsx    # Search input, level selector, progress bar
│       ├── Results.jsx      # Result cards + TXT/MD/JSON/HTML/PDF export
│       ├── Features.jsx     # Feature showcase grid
│       ├── CliSection.jsx   # CLI command examples
│       ├── SupportSection.jsx # Donation links
│       └── Footer.jsx       # Social links, sponsor button, credits
├── docs/                    # Production build (served by GitHub Pages)
├── vite.config.js           # Vite config (base: '/plethora/')
├── package.json
└── index.html
```

---

## ⚠️ Disclaimer

This tool is for **personal research and educational purposes only**.
Searches go through DuckDuckGo and pages are fetched via a CORS proxy.
Please use responsibly.

---

## 💰 Support This Project

If you find this useful, consider supporting me — it keeps me building stuff like this.

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor_on_GitHub-💖-ea4aaa?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/soumyadipkarforma)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/soumyadipkarforma)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/SoumyadipKarforma)

---

<div align="center">

**Built by [@soumyadipkarforma](https://github.com/soumyadipkarforma)** · MIT License

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/soumyadip_karforma) [![X](https://img.shields.io/badge/X-black.svg?logo=X&logoColor=white)](https://x.com/soumyadip_k) [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@soumyadip_karforma) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:soumyadipkarforma@gmail.com)

---

## 🌿 Other Branches

| Branch | What's There |
|--------|-------------|
| [`main`](https://github.com/soumyadipkarforma/plethora) | 🐚 Terminal scripts & CLI tool — clone and start scraping |
| [`pypi-package`](https://github.com/soumyadipkarforma/plethora/tree/pypi-package) | 📦 Pip-installable Python library — `pip install plethora` |

> **This branch (`website`)** has the React web app. [Try it live →](https://soumyadipkarforma.github.io/plethora/)

</div>
