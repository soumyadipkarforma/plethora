<div align="center">

# 🔍 Plethora

### Search the web. Scrape the sites. Generate reports. All from your terminal.

I built this because I got tired of manually Googling stuff and copy-pasting content.
Now I just run a one-liner and get a clean report — low, medium, or high detail — in
plain text, Markdown, HTML, JSON, or PDF. No browser needed. No fluff.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-3776AB?logo=python&logoColor=white)](#requirements)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![Sponsor](https://img.shields.io/badge/sponsor-💖_Sponsor_Me-ea4aaa?logo=github-sponsors&logoColor=white)](https://github.com/sponsors/soumyadipkarforma)

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/soumyadip_karforma) [![X](https://img.shields.io/badge/X-black.svg?logo=X&logoColor=white)](https://x.com/soumyadip_k) [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@soumyadip_karforma) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:soumyadipkarforma@gmail.com)

</div>

---

## 💡 Why I Made This

I wanted a fast way to research topics from the terminal — search for something,
pull down the actual content from each result, and save it all in one place.
So I wrote this: a set of scripts that does exactly that.

**The idea is simple:** pick a detail level, run the script, get your report.

---

## 🐚 The Scripts — The Fastest Way to Use This

These are the main thing. No flags to remember, no setup — just run them:

```bash
# Quick list of search results — titles, URLs, snippets
./scrape-low "best static site generators"

# Scrape the actual pages — headings, meta, content previews
./scrape-med "python web frameworks 2026"

# Full deep scrape — page content + sub-pages + everything
./scrape-high "machine learning research papers" 8 3
```

**That's it.** Each script takes a search query and optionally how many results you want.
`scrape-high` also takes a sub-page count as the third argument.

```
./scrape-low  "query" [num_results]
./scrape-med  "query" [num_results]
./scrape-high "query" [num_results] [max_subpages]
```

After the scrape finishes, it shows you where the report was saved and asks
if you want to view it right there in the terminal with `less`. Say `y` and read it,
or `n` and go grab it from the `reports/` folder later.

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
│          │  lists, and a content preview (500 chars)            │
├──────────┼──────────────────────────────────────────────────────┤
│  🔴 HIGH │  Deep scrape — full page content + follows links    │
│          │  to sub-pages. Tables, images, 2000 char content    │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 🚀 Setup

### One-Command Setup

I've included setup scripts for every major platform. Just run the one for your system
and everything gets installed — Python, pip, dependencies, permissions. Zero hassle.

| Platform | Command |
|----------|---------|
| **Termux (Android)** | `bash termux-setup` |
| **Linux (Debian/Fedora/Arch/openSUSE)** | `bash linux-setup` |
| **macOS** | `bash mac-setup` |
| **Windows** | Double-click `windows-setup.bat` or run it from CMD |

Each script handles the full chain: system packages → Python → pip dependencies → script permissions.
After running it, you're ready to go.

### Manual Setup

If you'd rather do it yourself:

- **Python 3.10+**
- `requests` + `beautifulsoup4` (required)
- `rich` (optional — gives you nice progress bars)
- `fpdf2` (required for PDF output)

```bash
pip install requests beautifulsoup4 rich fpdf2
```

Make the scripts executable:

```bash
chmod +x scrape-low scrape-med scrape-high
```

You're good to go.

---

## ⚙️ Advanced: The Python CLI

If you need more control, use `scrape.py` directly with flags:

```bash
# Basic usage
python scrape.py "your search query" --level medium

# Generate all formats at once (txt + md + html + json + pdf)
python scrape.py "AI research" --level high --format all

# Parallel scrape with 8 threads, skip cache
python scrape.py "web dev trends" --level medium --workers 8 --no-cache

# Quiet mode for piping
python scrape.py "data science" --level low --quiet --format json
```

### All Options

```
python scrape.py <query> [options]

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

## 📝 Output Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| **txt** | `.txt` | Clean plain text — great for terminal reading |
| **md** | `.md` | Markdown — perfect for pasting into notes or docs |
| **html** | `.html` | Self-contained HTML with dark theme — open in any browser |
| **json** | `.json` | Raw structured data — feed it into your own scripts |
| **pdf** | `.pdf` | Portable PDF with watermark — share or print anywhere |

All formats include the **Plethora** watermark. Use `--format all` to get everything.

---

## ✨ What's Under the Hood

- **Concurrent scraping** — pages are fetched in parallel with configurable threads
- **Smart caching** — already-fetched URLs are cached locally (1hr default TTL)
- **robots.txt respect** — checks before scraping, skips disallowed URLs
- **Auto-retries** — failed requests retry 3x with exponential backoff
- **Per-domain rate limiting** — won't hammer the same site
- **Rich extraction** — headings (h1–h6), paragraphs, lists, tables, image metadata
- **Progress bars** — live Rich progress when scraping (disable with `--quiet`)

---

## 📂 Project Structure

```
plethora/
├── scrape-low          # ⭐ Shell shortcut → low detail report
├── scrape-med          # ⭐ Shell shortcut → medium detail report
├── scrape-high         # ⭐ Shell shortcut → high detail report
├── scrape.py           # Full CLI with all options
├── scraper.py          # Core engine — search, scrape, concurrency, caching
├── formatter.py        # Report generators — txt, md, html, json, pdf
├── common              # Shared shell helper (argument parsing)
├── termux-setup        # 📱 One-command Termux setup
├── linux-setup         # 🐧 One-command Linux setup
├── mac-setup           # 🍎 One-command macOS setup
├── windows-setup.bat   # 🪟 One-command Windows setup
├── .cache/             # URL cache (auto-created)
└── reports/            # All generated reports go here
```

---

## 📖 Example Output

<details>
<summary><b>🟢 Low Report</b> — search results at a glance</summary>

```
============================================================
 LOW-DETAIL REPORT
 Query: python web scraping
 Results: 5
============================================================

  1. Python Web Scraping Tutorial - GeeksforGeeks
     https://www.geeksforgeeks.org/python/python-web-scraping-tutorial/
     Web scraping is the process of extracting data from websites…

  2. Beautiful Soup: Build a Web Scraper With Python
     https://realpython.com/beautiful-soup-web-scraper-python/
     Learn how to use Beautiful Soup and Requests to scrape…
```

</details>

<details>
<summary><b>🟡 Medium Report</b> — page content & structure</summary>

```
────────────────────────────────────────────────────────────
  [1] Python Web Scraping Tutorial - GeeksforGeeks
  URL: https://www.geeksforgeeks.org/python/python-web-scraping-tutorial/
  Meta: Comprehensive guide to web scraping with Python…
    • Python Web Scraping Tutorial
      • Requests Module
      • Parsing HTML with BeautifulSoup
      • Selenium

  ── Content Preview ──
  Web scraping is the process of extracting data from websites
  automatically. Python is widely used for web scraping because…
```

</details>

<details>
<summary><b>🔴 High Report</b> — deep scrape with sub-pages</summary>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [1] Python Web Scraping Tutorial - GeeksforGeeks
  URL: https://www.geeksforgeeks.org/python/python-web-scraping-tutorial/

  ── Headings ──
    • Python Web Scraping Tutorial
      • Requests Module
      • Parsing HTML with BeautifulSoup
      • Selenium

  ── Content ──
  [Full extracted text up to 2000 characters…]

  🖼 Tutorial diagram — https://media.geeksforgeeks.org/…

  ── Sub-pages (2) ──
    ┌ Sub-page 1: Requests Tutorial
    │ URL: https://www.geeksforgeeks.org/python-requests-tutorial/
    │ [Sub-page content up to 800 characters…]
    └────────────────────────────────────────
```

</details>

---

## 🔧 Using as a Python Library

```python
from scraper import web_search, scrape_page, scrape_subpages, run

# Search only
results = web_search("your query", num_results=10)

# Scrape a single URL
page = scrape_page("https://example.com")
print(page["title"], page["headings"], page["lists"], page["tables"])

# Full pipeline — returns list of report file paths
paths = run("AI news 2026", level="high", num_results=5, out_format="all")
```

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

</div>