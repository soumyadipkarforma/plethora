"""
Google Search Scraper — scrapes Google results and site content at configurable depth.
Generates LOW / MEDIUM / HIGH detail reports.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, quote_plus, parse_qs, unquote
import time
import json
import re
import os
from datetime import datetime

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

TIMEOUT = 15


# ── Google Search ────────────────────────────────────────────────────────────

def web_search(query: str, num_results: int = 10) -> list[dict]:
    """Return list of {title, url, snippet} using DuckDuckGo HTML search."""
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    results = []
    for r in soup.select(".result"):
        title_tag = r.select_one(".result__title a, .result__a")
        snippet_tag = r.select_one(".result__snippet")
        if not title_tag:
            continue
        # Extract real URL from DDG redirect
        raw_href = title_tag.get("href", "")
        if "uddg=" in raw_href:
            actual_url = parse_qs(urlparse(raw_href).query).get("uddg", [""])[0]
        elif raw_href.startswith("http"):
            actual_url = raw_href
        else:
            continue
        actual_url = unquote(actual_url)
        if actual_url:
            results.append({
                "title": title_tag.get_text(strip=True),
                "url": actual_url,
                "snippet": snippet_tag.get_text(strip=True) if snippet_tag else "",
            })
        if len(results) >= num_results:
            break
    return results


# ── Page Scraper ─────────────────────────────────────────────────────────────

def scrape_page(url: str) -> dict:
    """Scrape a single page and return structured content."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        return {"url": url, "error": str(e)}

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove noise
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
        tag.decompose()

    title = soup.title.get_text(strip=True) if soup.title else ""
    meta_desc = ""
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag:
        meta_desc = meta_tag.get("content", "")

    # Extract headings
    headings = []
    for level in range(1, 4):
        for h in soup.find_all(f"h{level}"):
            text = h.get_text(strip=True)
            if text:
                headings.append({"level": level, "text": text})

    # Main text
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
    full_text = "\n".join(paragraphs)

    # Links on the page
    links = []
    for a in soup.find_all("a", href=True):
        href = urljoin(url, a["href"])
        if href.startswith("http"):
            links.append({"text": a.get_text(strip=True)[:100], "url": href})

    return {
        "url": url,
        "title": title,
        "meta_description": meta_desc,
        "headings": headings,
        "text": full_text,
        "links": links,
    }


def scrape_subpages(page_data: dict, max_subpages: int = 3) -> list[dict]:
    """Follow links from a page and scrape sub-pages (same domain only)."""
    if "error" in page_data:
        return []
    base_domain = urlparse(page_data["url"]).netloc
    seen = {page_data["url"]}
    subpages = []

    for link in page_data.get("links", []):
        if len(subpages) >= max_subpages:
            break
        link_url = link["url"]
        if urlparse(link_url).netloc == base_domain and link_url not in seen:
            seen.add(link_url)
            time.sleep(1)
            sub = scrape_page(link_url)
            if "error" not in sub:
                subpages.append(sub)
    return subpages


# ── Report Generators ────────────────────────────────────────────────────────

def _truncate(text: str, max_len: int) -> str:
    return text[:max_len] + "…" if len(text) > max_len else text


def report_low(query: str, search_results: list[dict]) -> str:
    """Quick overview — search results only."""
    lines = [
        f"{'='*60}",
        f" LOW-DETAIL REPORT",
        f" Query: {query}",
        f" Date:  {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f" Results found: {len(search_results)}",
        f"{'='*60}\n",
    ]
    for i, r in enumerate(search_results, 1):
        lines.append(f"  {i}. {r['title']}")
        lines.append(f"     {r['url']}")
        if r.get("snippet"):
            lines.append(f"     {_truncate(r['snippet'], 150)}")
        lines.append("")
    return "\n".join(lines)


def report_medium(query: str, search_results: list[dict], pages: list[dict]) -> str:
    """Moderate detail — includes page summaries."""
    lines = [
        f"{'='*60}",
        f" MEDIUM-DETAIL REPORT",
        f" Query: {query}",
        f" Date:  {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f" Results: {len(search_results)} | Pages scraped: {len(pages)}",
        f"{'='*60}\n",
    ]
    for i, page in enumerate(pages, 1):
        lines.append(f"{'─'*60}")
        lines.append(f"  [{i}] {page.get('title', 'N/A')}")
        lines.append(f"  URL: {page['url']}")
        if page.get("error"):
            lines.append(f"  ⚠ Error: {page['error']}\n")
            continue
        if page.get("meta_description"):
            lines.append(f"  Meta: {_truncate(page['meta_description'], 200)}")
        # Top headings
        for h in page.get("headings", [])[:8]:
            indent = "    " + "  " * (h["level"] - 1)
            lines.append(f"{indent}• {h['text']}")
        # Text excerpt
        text = page.get("text", "")
        if text:
            lines.append(f"\n  Content Preview:")
            lines.append(f"  {_truncate(text, 500)}")
        lines.append("")
    return "\n".join(lines)


def report_high(query: str, search_results: list[dict], pages: list[dict],
                subpages: dict[str, list[dict]]) -> str:
    """Full detail — pages + sub-pages with extended content."""
    lines = [
        f"{'='*60}",
        f" HIGH-DETAIL REPORT",
        f" Query: {query}",
        f" Date:  {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f" Results: {len(search_results)} | Pages: {len(pages)}",
        f" Sub-pages scraped: {sum(len(v) for v in subpages.values())}",
        f"{'='*60}\n",
    ]
    for i, page in enumerate(pages, 1):
        lines.append(f"{'━'*60}")
        lines.append(f"  [{i}] {page.get('title', 'N/A')}")
        lines.append(f"  URL: {page['url']}")
        if page.get("error"):
            lines.append(f"  ⚠ Error: {page['error']}\n")
            continue
        if page.get("meta_description"):
            lines.append(f"  Meta: {page['meta_description']}")
        # All headings
        if page.get("headings"):
            lines.append(f"\n  ── Headings ──")
            for h in page["headings"]:
                indent = "    " + "  " * (h["level"] - 1)
                lines.append(f"{indent}• {h['text']}")
        # Full text (capped)
        text = page.get("text", "")
        if text:
            lines.append(f"\n  ── Content ──")
            lines.append(f"  {_truncate(text, 2000)}")
        # Sub-pages
        subs = subpages.get(page["url"], [])
        if subs:
            lines.append(f"\n  ── Sub-pages ({len(subs)}) ──")
            for j, sp in enumerate(subs, 1):
                lines.append(f"    ┌ Sub-page {j}: {sp.get('title', 'N/A')}")
                lines.append(f"    │ URL: {sp['url']}")
                sp_text = sp.get("text", "")
                if sp_text:
                    lines.append(f"    │ {_truncate(sp_text, 800)}")
                lines.append(f"    └{'─'*40}")
        lines.append("")
    return "\n".join(lines)


# ── Main Pipeline ────────────────────────────────────────────────────────────

def run(query: str, level: str = "medium", num_results: int = 5,
        max_subpages: int = 2, output_dir: str = "reports") -> str:
    """
    Run the full scrape pipeline.
      level: low | medium | high
      Returns: path to saved report file
    """
    level = level.lower().strip()
    assert level in ("low", "medium", "high"), "Level must be low, medium, or high"

    print(f"[*] Searching for: {query}")
    search_results = web_search(query, num_results)
    print(f"[+] Found {len(search_results)} results")

    if level == "low":
        report_text = report_low(query, search_results)
    else:
        # Scrape each result page
        pages = []
        for i, sr in enumerate(search_results):
            print(f"[*] Scraping ({i+1}/{len(search_results)}): {sr['url'][:70]}")
            page = scrape_page(sr["url"])
            pages.append(page)
            time.sleep(1)

        if level == "medium":
            report_text = report_medium(query, search_results, pages)
        else:
            # High: also scrape sub-pages
            all_subpages = {}
            for page in pages:
                if "error" not in page:
                    print(f"[*] Scraping sub-pages of: {page['url'][:60]}")
                    subs = scrape_subpages(page, max_subpages)
                    all_subpages[page["url"]] = subs
            report_text = report_high(query, search_results, pages, all_subpages)

    # Save report
    os.makedirs(output_dir, exist_ok=True)
    safe_query = re.sub(r"[^\w\s-]", "", query)[:40].strip().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_query}_{level}_{timestamp}.txt"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report_text)

    # Also save raw JSON for high level
    if level == "high":
        json_path = filepath.replace(".txt", ".json")
        raw = {
            "query": query, "level": level,
            "search_results": search_results,
            "pages": pages,
            "subpages": {k: v for k, v in all_subpages.items()},
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(raw, f, indent=2, ensure_ascii=False, default=str)
        print(f"[+] Raw data saved: {json_path}")

    print(f"[+] Report saved: {filepath}")
    return filepath
