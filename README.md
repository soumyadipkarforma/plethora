<div align="center">

# 📦 Plethora

### Search the web, scrape sites, and generate reports — from Python.

Install with pip and use anywhere: scripts, notebooks, Google Colab, or the command line.

[![PyPI](https://img.shields.io/pypi/v/plethora?logo=pypi&logoColor=white)](https://pypi.org/project/plethora/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-3776AB?logo=python&logoColor=white)](#requirements)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Sponsor](https://img.shields.io/badge/sponsor-💖_Sponsor_Me-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/soumyadipkarforma)

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/soumyadip_karforma) [![X](https://img.shields.io/badge/X-black.svg?logo=X&logoColor=white)](https://x.com/soumyadip_k) [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@soumyadip_karforma) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:soumyadipkarforma@gmail.com)

</div>

---

## 🚀 Installation

```bash
pip install plethora
```

Works on Linux, macOS, Windows, Termux, and **Google Colab**.

---

## 📖 Quick Start

### Python Library

```python
from plethora import web_search, scrape_page, scrape_subpages, run

# Search the web
results = web_search("python tutorials", num_results=10)

# Scrape a single page
page = scrape_page("https://example.com")
print(page["title"], page["headings"], page["lists"], page["tables"])

# Full pipeline — search, scrape, and generate reports
paths = run("AI news 2026", level="high", num_results=5, out_format="all")
```

### Google Colab

```python
!pip install plethora

from plethora import run

# Generate a markdown report right in your notebook
paths = run("machine learning trends", level="medium", out_format="md")
```

### Command Line

```bash
# Basic usage
plethora "your search query" --level medium

# All formats at once
plethora "AI research" --level high --format all

# Parallel scrape with 8 threads
plethora "web dev trends" --level medium --workers 8 --no-cache

# Quiet mode for piping
plethora "data science" --level low --quiet --format json
```

### CLI Options

```
plethora <query> [options]

  -l, --level LEVEL      low | medium | high                   (default: medium)
  -n, --results N        Number of search results               (default: 5)
  -s, --subpages N       Max sub-pages per site (high only)     (default: 2)
  -o, --output DIR       Output directory                       (default: reports/)
  -f, --format FMT       txt | md | html | json | pdf | all   (default: txt)
  -w, --workers N        Concurrent scraping threads            (default: 4)
  -q, --quiet            Suppress progress output
  --no-cache             Bypass URL cache
  --cache-ttl SECS       Cache TTL in seconds                   (default: 3600)
```

---

## 📋 Scrape Levels

```
┌──────────┬──────────────────────────────────────────────────────┐
│  Level   │  What You Get                                       │
├──────────┼──────────────────────────────────────────────────────┤
│  🟢 LOW  │  Search results list — titles, URLs, snippets       │
│          │  ⚡ Instant — doesn't visit any pages                │
├──────────┼──────────────────────────────────────────────────────┤
│  🟡 MED  │  Visits each result page — pulls headings, meta,    │
│          │  lists, and a content preview (500 chars)            │
├──────────┼──────────────────────────────────────────────────────┤
│  🔴 HIGH │  Deep scrape — full page content + follows links    │
│          │  to sub-pages. Tables, images, 2000 char content    │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 📝 Output Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| **txt** | `.txt` | Clean plain text — great for terminal reading |
| **md** | `.md` | Markdown — perfect for pasting into notes or docs |
| **html** | `.html` | Self-contained HTML with dark theme |
| **json** | `.json` | Raw structured data — feed it into your own scripts |
| **pdf** | `.pdf` | Portable PDF with watermark |

Use `--format all` or `out_format="all"` to generate everything at once.

---

## ✨ Features

- **Concurrent scraping** — pages are fetched in parallel with configurable threads
- **Smart caching** — already-fetched URLs are cached locally (1hr default TTL)
- **robots.txt respect** — checks before scraping, skips disallowed URLs
- **Auto-retries** — failed requests retry 3x with exponential backoff
- **Per-domain rate limiting** — won't hammer the same site
- **Rich extraction** — headings (h1–h6), paragraphs, lists, tables, image metadata
- **Progress bars** — live Rich progress when scraping (install with `pip install plethora[rich]`)

---

## 📦 Dependencies

**Required:**
- `requests` — HTTP client
- `beautifulsoup4` — HTML parsing
- `fpdf2` — PDF generation

**Optional:**
- `rich` — progress bars (`pip install plethora[rich]`)

---

## ⚠️ Disclaimer

This tool is for **personal research and educational purposes only**.
It respects `robots.txt`, includes per-domain rate limiting, and plays nice
with servers. Please don't abuse it. Use responsibly.

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
| [`website`](https://github.com/soumyadipkarforma/plethora/tree/website) | 🌐 React web app — [try it live](https://soumyadipkarforma.github.io/plethora/) |

> **This branch (`pypi-package`)** has the pip-installable Python package.

</div>
