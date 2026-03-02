"""
Plethora — web scraper engine by Soumyadip Karforma.
Scrapes search results and site content at configurable depth.
Generates LOW / MEDIUM / HIGH detail reports.
Supports up to 100 results with DuckDuckGo pagination.
"""

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, quote_plus, parse_qs, unquote
from urllib.robotparser import RobotFileParser
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import hashlib
import time
import json
import re
import os
from datetime import datetime, timedelta

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

TIMEOUT = 15


# ── HTTP Session with Retries ────────────────────────────────────────────────

def _make_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(HEADERS)
    retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

SESSION = _make_session()


# ── robots.txt Cache ─────────────────────────────────────────────────────────

_robots_cache: dict[str, RobotFileParser] = {}
_robots_lock = threading.Lock()


def _is_allowed(url: str) -> bool:
    """Check robots.txt for the given URL. Returns True if allowed or on error."""
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    with _robots_lock:
        if robots_url not in _robots_cache:
            rp = RobotFileParser()
            rp.set_url(robots_url)
            try:
                rp.read()
            except Exception:
                return True  # allow on error
            _robots_cache[robots_url] = rp
        rp = _robots_cache[robots_url]
    return rp.can_fetch(HEADERS["User-Agent"], url)


# ── URL Cache ────────────────────────────────────────────────────────────────

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")


def _cache_key(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()


def _cache_get(url: str, ttl_seconds: int = 3600) -> dict | None:
    path = os.path.join(CACHE_DIR, f"{_cache_key(url)}.json")
    if not os.path.exists(path):
        return None
    try:
        mtime = datetime.fromtimestamp(os.path.getmtime(path))
        if datetime.now() - mtime > timedelta(seconds=ttl_seconds):
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _cache_put(url: str, data: dict) -> None:
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{_cache_key(url)}.json")
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, default=str)
    except Exception:
        pass


# ── Per-domain Rate Limiting ─────────────────────────────────────────────────

_domain_last_hit: dict[str, float] = {}
_domain_lock = threading.Lock()
DOMAIN_DELAY = 1.0  # seconds between requests to same domain


def _rate_limit(url: str) -> None:
    domain = urlparse(url).netloc
    with _domain_lock:
        last = _domain_last_hit.get(domain, 0)
        elapsed = time.time() - last
        if elapsed < DOMAIN_DELAY:
            time.sleep(DOMAIN_DELAY - elapsed)
        _domain_last_hit[domain] = time.time()


# ── Text Cleaning ────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """Clean extracted text — remove junk chars, control codes, Wikipedia markup, repeated symbols."""
    if not text:
        return ""
    text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)        # control chars
    text = text.replace("\u00A0", " ")                                      # non-breaking space
    text = re.sub(r"[\u200B-\u200F\u2028-\u202F\uFEFF]", "", text)        # zero-width & invisible
    text = re.sub(r"\[edit\]|\[citation needed\]|\[[\d,\s]+\]", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\{\{[^}]*\}\}", "", text)                              # template markup
    text = text.replace("|", " ")                                           # table separators
    text = re.sub(r"[►▼▲◄●○■□▪▫•‣⁃–—]{2,}", "", text)                    # repeated symbols
    text = re.sub(r"\.{4,}", "...", text)                                   # excessive dots
    text = re.sub(r"[ \t]+", " ", text)                                     # collapse spaces
    text = re.sub(r"\n{3,}", "\n\n", text)                                  # collapse newlines
    return text.strip()


# ── DuckDuckGo Search with Pagination ────────────────────────────────────────

def _parse_ddg_page(html: str, seen_urls: set) -> list[dict]:
    """Parse a single DuckDuckGo HTML results page."""
    soup = BeautifulSoup(html, "html.parser")
    results = []
    for r in soup.select(".result"):
        title_tag = r.select_one(".result__title a, .result__a")
        snippet_tag = r.select_one(".result__snippet")
        if not title_tag:
            continue
        raw_href = title_tag.get("href", "")
        if "uddg=" in raw_href:
            actual_url = parse_qs(urlparse(raw_href).query).get("uddg", [""])[0]
        elif raw_href.startswith("http"):
            actual_url = raw_href
        else:
            continue
        actual_url = unquote(actual_url)
        if actual_url and actual_url not in seen_urls:
            seen_urls.add(actual_url)
            results.append({
                "title": clean_text(title_tag.get_text(strip=True)),
                "url": actual_url,
                "snippet": clean_text(snippet_tag.get_text(strip=True)) if snippet_tag else "",
            })
    return results


def web_search(query: str, num_results: int = 10) -> list[dict]:
    """Return list of {title, url, snippet} using DuckDuckGo HTML search with pagination."""
    results = []
    seen_urls: set[str] = set()
    max_pages = min((num_results + 19) // 20, 5)  # ~20 results per page, max 5 pages

    def _fetch_page(page_num: int) -> list[dict]:
        if page_num == 0:
            url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        else:
            offset = page_num * 20
            url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}&s={offset}&dc={offset + 1}"
        try:
            resp = SESSION.get(url, timeout=TIMEOUT)
            resp.raise_for_status()
            return _parse_ddg_page(resp.text, seen_urls)
        except Exception:
            return []

    # Fetch first page synchronously to get initial results
    first_page = _fetch_page(0)
    results.extend(first_page)

    # Fetch remaining pages concurrently if needed
    if len(results) < num_results and max_pages > 1:
        with ThreadPoolExecutor(max_workers=4) as pool:
            futures = [pool.submit(_fetch_page, i) for i in range(1, max_pages)]
            for future in as_completed(futures):
                page_results = future.result()
                results.extend(page_results)
                if len(results) >= num_results:
                    break

    return results[:num_results]


# ── Page Scraper ─────────────────────────────────────────────────────────────

def scrape_page(url: str, use_cache: bool = True, cache_ttl: int = 3600) -> dict:
    """Scrape a single page and return structured content."""
    # Cache check
    if use_cache:
        cached = _cache_get(url, cache_ttl)
        if cached:
            cached["_cached"] = True
            return cached

    # robots.txt check
    if not _is_allowed(url):
        return {"url": url, "error": "Blocked by robots.txt", "_robots_blocked": True}

    _rate_limit(url)

    try:
        resp = SESSION.get(url, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        return {"url": url, "error": str(e)}

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove noise elements
    noise_selectors = [
        "script", "style", "nav", "footer", "header", "aside", "noscript",
        ".sidebar", ".ad", ".advertisement", ".promo", ".cookie-banner",
        ".social-share", ".share-buttons", ".comments", ".related-posts",
        "[role='navigation']", "[role='banner']", "[role='complementary']",
    ]
    for sel in noise_selectors:
        for tag in soup.select(sel):
            tag.decompose()

    # Also remove Wikipedia infobox tables
    for tag in soup.select(".infobox, .navbox, .metadata, .ambox, .mbox-small"):
        tag.decompose()

    title = soup.title.get_text(strip=True) if soup.title else ""
    meta_desc = ""
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag:
        meta_desc = meta_tag.get("content", "")

    # Target content containers for better extraction
    content_root = (
        soup.find("article")
        or soup.find("main")
        or soup.select_one(".mw-parser-output")
        or soup.find("body")
        or soup
    )

    # Extract headings h1-h6
    headings = []
    for level in range(1, 7):
        for h in content_root.find_all(f"h{level}"):
            text = clean_text(h.get_text(strip=True))
            if text and len(text) > 1:
                headings.append({"level": level, "text": text})

    # Main text
    paragraphs = [
        clean_text(p.get_text(strip=True))
        for p in content_root.find_all("p")
        if p.get_text(strip=True) and len(p.get_text(strip=True)) > 20
    ]
    full_text = clean_text(re.sub(r"\s{3,}", "\n\n", "\n".join(paragraphs)))

    # Lists
    lists = []
    for ul in content_root.find_all(["ul", "ol"]):
        items = [
            clean_text(li.get_text(strip=True))
            for li in ul.find_all("li", recursive=False)
            if li.get_text(strip=True) and len(li.get_text(strip=True)) > 5
        ]
        if items:
            lists.append({"type": ul.name, "items": items[:20]})

    # Tables
    tables = []
    for table in content_root.find_all("table"):
        rows = []
        for tr in table.find_all("tr")[:30]:
            cells = [clean_text(td.get_text(strip=True)) for td in tr.find_all(["td", "th"])]
            if cells:
                rows.append(cells)
        if rows:
            tables.append(rows)

    # Images (metadata only)
    images = []
    for img in content_root.find_all("img", src=True):
        src = urljoin(url, img["src"])
        alt = img.get("alt", "").strip()
        if src.startswith("http") and alt and len(alt) > 3:
            images.append({"src": src, "alt": clean_text(alt[:200])})

    # Links on the page
    links = []
    link_urls_seen = set()
    for a in content_root.find_all("a", href=True):
        href = urljoin(url, a["href"])
        link_text = a.get_text(strip=True)[:100]
        if (href.startswith("http") and href not in link_urls_seen
                and link_text and not href.startswith("javascript:")):
            link_urls_seen.add(href)
            links.append({"text": clean_text(link_text), "url": href})

    result = {
        "url": url,
        "title": clean_text(title),
        "meta_description": clean_text(meta_desc),
        "headings": headings,
        "text": full_text,
        "lists": lists,
        "tables": tables,
        "images": images[:20],
        "links": links[:50],
    }

    # Store in cache
    if use_cache:
        _cache_put(url, result)

    return result


def scrape_subpages(page_data: dict, max_subpages: int = 3,
                    use_cache: bool = True, cache_ttl: int = 3600) -> list[dict]:
    """Follow links from a page and scrape sub-pages (same domain only)."""
    if "error" in page_data:
        return []
    base_domain = urlparse(page_data["url"]).netloc
    seen = {page_data["url"]}
    subpages = []

    # Filter out junk links (anchors, login, mailto, media files)
    skip_patterns = re.compile(
        r"(#|mailto:|javascript:|\.pdf$|\.png$|\.jpg$|\.gif$|\.svg$|"
        r"/login|/signup|/register|/auth|/search\?|/tag/|/category/)",
        re.IGNORECASE,
    )

    candidates = []
    for link in page_data.get("links", []):
        link_url = link["url"]
        if (urlparse(link_url).netloc == base_domain
                and link_url not in seen
                and not skip_patterns.search(link_url)):
            seen.add(link_url)
            candidates.append(link_url)
        if len(candidates) >= max_subpages:
            break

    for link_url in candidates:
        sub = scrape_page(link_url, use_cache=use_cache, cache_ttl=cache_ttl)
        if "error" not in sub:
            subpages.append(sub)
    return subpages


# ── Main Pipeline ────────────────────────────────────────────────────────────

def run(query: str, level: str = "medium", num_results: int = 5,
        max_subpages: int = 2, output_dir: str = "reports",
        workers: int = 4, use_cache: bool = True, cache_ttl: int = 3600,
        quiet: bool = False, out_format: str = "txt") -> list[str]:
    """
    Run the full scrape pipeline.
      level: low | medium | high
      out_format: txt | md | html | json | pdf | all
      Returns: list of paths to saved report files
    """
    from formatter import format_report

    level = level.lower().strip()
    assert level in ("low", "medium", "high"), "Level must be low, medium, or high"

    log = (lambda *a, **kw: None) if quiet else print
    errors: list[dict] = []

    try:
        from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
        use_rich = not quiet
    except ImportError:
        use_rich = False

    # ── Search ───────────────────────────────────────────────────────────
    log(f"[*] Searching for: {query}")
    search_results = web_search(query, num_results)
    log(f"[+] Found {len(search_results)} results")

    pages: list[dict] = []
    all_subpages: dict[str, list[dict]] = {}

    if level != "low":
        # ── Scrape pages (concurrent) ────────────────────────────────────
        def _scrape_one(sr):
            return scrape_page(sr["url"], use_cache=use_cache, cache_ttl=cache_ttl)

        if use_rich:
            with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"),
                          BarColumn(), TextColumn("{task.completed}/{task.total}")) as progress:
                task = progress.add_task("Scraping pages", total=len(search_results))
                with ThreadPoolExecutor(max_workers=workers) as pool:
                    futures = {pool.submit(_scrape_one, sr): sr for sr in search_results}
                    for future in as_completed(futures):
                        page = future.result()
                        pages.append(page)
                        if page.get("error"):
                            errors.append({"url": page["url"], "error": page["error"]})
                        progress.advance(task)
        else:
            with ThreadPoolExecutor(max_workers=workers) as pool:
                futures = {pool.submit(_scrape_one, sr): i for i, sr in enumerate(search_results)}
                for future in as_completed(futures):
                    page = future.result()
                    pages.append(page)
                    if page.get("error"):
                        errors.append({"url": page["url"], "error": page["error"]})
                    log(f"[*] Scraped: {page['url'][:70]}")

        # Reorder pages to match search result order
        url_order = {sr["url"]: i for i, sr in enumerate(search_results)}
        pages.sort(key=lambda p: url_order.get(p["url"], 999))

        if level == "high":
            # ── Scrape sub-pages (concurrent per parent) ─────────────────
            def _scrape_subs(page):
                if "error" in page:
                    return page["url"], []
                return page["url"], scrape_subpages(
                    page, max_subpages, use_cache=use_cache, cache_ttl=cache_ttl)

            if use_rich:
                with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"),
                              BarColumn(), TextColumn("{task.completed}/{task.total}")) as progress:
                    task = progress.add_task("Scraping sub-pages", total=len(pages))
                    with ThreadPoolExecutor(max_workers=workers) as pool:
                        futures = [pool.submit(_scrape_subs, p) for p in pages]
                        for future in as_completed(futures):
                            parent_url, subs = future.result()
                            all_subpages[parent_url] = subs
                            progress.advance(task)
            else:
                with ThreadPoolExecutor(max_workers=workers) as pool:
                    futures = [pool.submit(_scrape_subs, p) for p in pages]
                    for future in as_completed(futures):
                        parent_url, subs = future.result()
                        all_subpages[parent_url] = subs
                        log(f"[*] Sub-pages done: {parent_url[:60]} ({len(subs)} found)")

    # ── Error summary ────────────────────────────────────────────────────
    if errors:
        log(f"\n[!] {len(errors)} error(s):")
        for e in errors:
            log(f"    ✗ {e['url'][:60]} — {e['error'][:80]}")

    # ── Generate & save reports ──────────────────────────────────────────
    report_data = {
        "query": query, "level": level,
        "search_results": search_results,
        "pages": pages,
        "subpages": all_subpages,
    }

    formats = ["txt", "md", "html", "json", "pdf"] if out_format == "all" else [out_format]
    os.makedirs(output_dir, exist_ok=True)
    safe_query = re.sub(r"[^\w\s-]", "", query)[:40].strip().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_paths = []

    for fmt in formats:
        ext = fmt
        filename = f"{safe_query}_{level}_{timestamp}.{ext}"
        filepath = os.path.join(output_dir, filename)
        content = format_report(report_data, fmt)
        if isinstance(content, (bytes, bytearray)):
            with open(filepath, "wb") as f:
                f.write(content)
        else:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
        log(f"[+] Report saved: {filepath}")
        saved_paths.append(filepath)

    return saved_paths
