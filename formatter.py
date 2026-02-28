"""
Report formatter — generates txt, markdown, HTML, and JSON reports.
"""

import json
from datetime import datetime
from html import escape as html_escape


def _truncate(text: str, max_len: int) -> str:
    return text[:max_len] + "…" if len(text) > max_len else text


# ── Text caps per level ──────────────────────────────────────────────────────

_TEXT_CAP = {"low": 0, "medium": 500, "high": 2000}
_SUB_TEXT_CAP = 800
_HEADING_CAP = {"low": 0, "medium": 8, "high": 999}


# ── Dispatch ─────────────────────────────────────────────────────────────────

def format_report(data: dict, fmt: str) -> str:
    """Format report data into the specified format."""
    formatters = {"txt": _fmt_txt, "md": _fmt_md, "html": _fmt_html, "json": _fmt_json}
    fn = formatters.get(fmt)
    if not fn:
        raise ValueError(f"Unknown format: {fmt}. Use: {', '.join(formatters)}")
    return fn(data)


# ═══════════════════════════════════════════════════════════════════════════════
#  TXT FORMAT
# ═══════════════════════════════════════════════════════════════════════════════

def _fmt_txt(data: dict) -> str:
    query = data["query"]
    level = data["level"]
    results = data["search_results"]
    pages = data.get("pages", [])
    subpages = data.get("subpages", {})
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    lines = [
        f"{'='*60}",
        f" {level.upper()}-DETAIL REPORT",
        f" Query: {query}",
        f" Date:  {now}",
        f" Results: {len(results)}",
    ]
    if pages:
        lines.append(f" Pages scraped: {len(pages)}")
    if subpages:
        lines.append(f" Sub-pages scraped: {sum(len(v) for v in subpages.values())}")
    lines.append(f"{'='*60}\n")

    if level == "low":
        for i, r in enumerate(results, 1):
            lines.append(f"  {i}. {r['title']}")
            lines.append(f"     {r['url']}")
            if r.get("snippet"):
                lines.append(f"     {_truncate(r['snippet'], 150)}")
            lines.append("")
        return "\n".join(lines)

    for i, page in enumerate(pages, 1):
        sep = "━" if level == "high" else "─"
        lines.append(f"{sep*60}")
        lines.append(f"  [{i}] {page.get('title', 'N/A')}")
        lines.append(f"  URL: {page['url']}")
        if page.get("error"):
            lines.append(f"  ⚠ Error: {page['error']}\n")
            continue
        if page.get("meta_description"):
            lines.append(f"  Meta: {_truncate(page['meta_description'], 200)}")

        # Headings
        cap = _HEADING_CAP[level]
        for h in page.get("headings", [])[:cap]:
            indent = "    " + "  " * (h["level"] - 1)
            lines.append(f"{indent}• {h['text']}")

        # Lists (medium+)
        for lst in page.get("lists", [])[:3]:
            marker = "•" if lst["type"] == "ul" else "1."
            for item in lst["items"][:5]:
                lines.append(f"    {marker} {_truncate(item, 120)}")

        # Text
        text = page.get("text", "")
        text_cap = _TEXT_CAP[level]
        if text and text_cap:
            label = "Content Preview" if level == "medium" else "Content"
            lines.append(f"\n  ── {label} ──")
            lines.append(f"  {_truncate(text, text_cap)}")

        # Images (high only)
        if level == "high":
            for img in page.get("images", [])[:5]:
                lines.append(f"  🖼 {img['alt'][:80]} — {img['src'][:60]}")

        # Sub-pages (high only)
        subs = subpages.get(page["url"], [])
        if subs:
            lines.append(f"\n  ── Sub-pages ({len(subs)}) ──")
            for j, sp in enumerate(subs, 1):
                lines.append(f"    ┌ Sub-page {j}: {sp.get('title', 'N/A')}")
                lines.append(f"    │ URL: {sp['url']}")
                sp_text = sp.get("text", "")
                if sp_text:
                    lines.append(f"    │ {_truncate(sp_text, _SUB_TEXT_CAP)}")
                lines.append(f"    └{'─'*40}")
        lines.append("")
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
#  MARKDOWN FORMAT
# ═══════════════════════════════════════════════════════════════════════════════

def _fmt_md(data: dict) -> str:
    query = data["query"]
    level = data["level"]
    results = data["search_results"]
    pages = data.get("pages", [])
    subpages = data.get("subpages", {})
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    lines = [
        f"# {level.upper()}-Detail Report",
        f"",
        f"- **Query:** {query}",
        f"- **Date:** {now}",
        f"- **Results:** {len(results)}",
    ]
    if pages:
        lines.append(f"- **Pages scraped:** {len(pages)}")
    if subpages:
        lines.append(f"- **Sub-pages:** {sum(len(v) for v in subpages.values())}")
    lines.append("\n---\n")

    if level == "low":
        for i, r in enumerate(results, 1):
            lines.append(f"### {i}. {r['title']}")
            lines.append(f"🔗 {r['url']}")
            if r.get("snippet"):
                lines.append(f"\n> {r['snippet']}\n")
        return "\n".join(lines)

    for i, page in enumerate(pages, 1):
        lines.append(f"## {i}. {page.get('title', 'N/A')}")
        lines.append(f"🔗 {page['url']}\n")
        if page.get("error"):
            lines.append(f"> ⚠️ **Error:** {page['error']}\n")
            continue
        if page.get("meta_description"):
            lines.append(f"*{_truncate(page['meta_description'], 200)}*\n")

        cap = _HEADING_CAP[level]
        if page.get("headings"):
            lines.append("### Structure")
            for h in page.get("headings", [])[:cap]:
                indent = "  " * (h["level"] - 1)
                lines.append(f"{indent}- {h['text']}")
            lines.append("")

        # Lists
        for lst in page.get("lists", [])[:3]:
            for item in lst["items"][:5]:
                lines.append(f"- {_truncate(item, 120)}")
            lines.append("")

        # Tables
        for table in page.get("tables", [])[:2]:
            if table:
                lines.append("| " + " | ".join(table[0]) + " |")
                lines.append("| " + " | ".join(["---"] * len(table[0])) + " |")
                for row in table[1:6]:
                    lines.append("| " + " | ".join(row) + " |")
                lines.append("")

        text = page.get("text", "")
        text_cap = _TEXT_CAP[level]
        if text and text_cap:
            lines.append("### Content\n")
            lines.append(_truncate(text, text_cap))
            lines.append("")

        if level == "high":
            for img in page.get("images", [])[:5]:
                lines.append(f"- 🖼 **{img['alt'][:80]}** — `{img['src'][:60]}`")
            if page.get("images"):
                lines.append("")

        subs = subpages.get(page["url"], [])
        if subs:
            lines.append(f"### Sub-pages ({len(subs)})\n")
            for j, sp in enumerate(subs, 1):
                lines.append(f"#### ↳ {sp.get('title', 'N/A')}")
                lines.append(f"🔗 {sp['url']}\n")
                sp_text = sp.get("text", "")
                if sp_text:
                    lines.append(_truncate(sp_text, _SUB_TEXT_CAP))
                    lines.append("")
        lines.append("---\n")
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
#  HTML FORMAT
# ═══════════════════════════════════════════════════════════════════════════════

_HTML_CSS = """
<style>
  :root { --bg: #0d1117; --fg: #c9d1d9; --accent: #58a6ff; --border: #30363d;
          --card: #161b22; --green: #3fb950; --yellow: #d29922; --red: #f85149; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
         background: var(--bg); color: var(--fg); max-width: 900px; margin: 0 auto;
         padding: 2rem 1rem; line-height: 1.6; }
  h1 { color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: .5rem; margin-bottom: 1rem; }
  .meta { color: #8b949e; font-size: .9rem; margin-bottom: 1.5rem; }
  .meta span { margin-right: 1.5rem; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px;
          padding: 1.2rem; margin-bottom: 1rem; }
  .card h2 { color: var(--accent); font-size: 1.1rem; margin-bottom: .3rem; }
  .card .url { color: #8b949e; font-size: .85rem; word-break: break-all; }
  .card .url a { color: #8b949e; text-decoration: none; }
  .card .url a:hover { color: var(--accent); text-decoration: underline; }
  .meta-desc { color: var(--yellow); font-style: italic; margin: .5rem 0; font-size: .9rem; }
  .headings { margin: .5rem 0 .5rem 1rem; }
  .headings li { color: var(--fg); font-size: .9rem; }
  .content { margin-top: .5rem; font-size: .9rem; white-space: pre-wrap; color: #b0b8c1; }
  .error { color: var(--red); }
  .subpage { margin-left: 1.2rem; border-left: 2px solid var(--border); padding-left: 1rem; margin-top: .5rem; }
  .subpage h3 { color: var(--green); font-size: .95rem; }
  .img-list { font-size: .85rem; color: #8b949e; margin-top: .3rem; }
  .badge { display: inline-block; background: var(--border); color: var(--fg); padding: 2px 8px;
           border-radius: 12px; font-size: .75rem; margin-right: .5rem; }
</style>
"""


def _fmt_html(data: dict) -> str:
    query = data["query"]
    level = data["level"]
    results = data["search_results"]
    pages = data.get("pages", [])
    subpages = data.get("subpages", {})
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    e = html_escape

    parts = [
        "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>",
        f"<title>{e(query)} — {level.upper()} Report</title>",
        _HTML_CSS,
        "</head><body>",
        f"<h1>🔍 {e(query)}</h1>",
        f"<div class='meta'>",
        f"  <span class='badge'>{level.upper()}</span>",
        f"  <span>📅 {now}</span>",
        f"  <span>🔗 {len(results)} results</span>",
    ]
    if pages:
        parts.append(f"  <span>📄 {len(pages)} pages</span>")
    if subpages:
        parts.append(f"  <span>📎 {sum(len(v) for v in subpages.values())} sub-pages</span>")
    parts.append("</div>")

    if level == "low":
        for i, r in enumerate(results, 1):
            parts.append(f"<div class='card'>")
            parts.append(f"  <h2>{i}. {e(r['title'])}</h2>")
            parts.append(f"  <div class='url'><a href='{e(r['url'])}'>{e(r['url'])}</a></div>")
            if r.get("snippet"):
                parts.append(f"  <p>{e(r['snippet'])}</p>")
            parts.append("</div>")
    else:
        for i, page in enumerate(pages, 1):
            parts.append(f"<div class='card'>")
            parts.append(f"  <h2>{i}. {e(page.get('title', 'N/A'))}</h2>")
            parts.append(f"  <div class='url'><a href='{e(page['url'])}'>{e(page['url'])}</a></div>")
            if page.get("error"):
                parts.append(f"  <p class='error'>⚠ {e(page['error'])}</p>")
                parts.append("</div>")
                continue
            if page.get("meta_description"):
                parts.append(f"  <div class='meta-desc'>{e(_truncate(page['meta_description'], 200))}</div>")

            cap = _HEADING_CAP[level]
            headings = page.get("headings", [])[:cap]
            if headings:
                parts.append("  <ul class='headings'>")
                for h in headings:
                    parts.append(f"    <li style='margin-left:{(h['level']-1)*1.2}rem'>{e(h['text'])}</li>")
                parts.append("  </ul>")

            text = page.get("text", "")
            text_cap = _TEXT_CAP[level]
            if text and text_cap:
                parts.append(f"  <div class='content'>{e(_truncate(text, text_cap))}</div>")

            if level == "high":
                imgs = page.get("images", [])[:5]
                if imgs:
                    parts.append("  <div class='img-list'>")
                    for img in imgs:
                        parts.append(f"    🖼 {e(img['alt'][:80])}<br>")
                    parts.append("  </div>")

            subs = subpages.get(page["url"], [])
            for j, sp in enumerate(subs, 1):
                parts.append(f"  <div class='subpage'>")
                parts.append(f"    <h3>↳ {e(sp.get('title', 'N/A'))}</h3>")
                parts.append(f"    <div class='url'><a href='{e(sp['url'])}'>{e(sp['url'])}</a></div>")
                sp_text = sp.get("text", "")
                if sp_text:
                    parts.append(f"    <div class='content'>{e(_truncate(sp_text, _SUB_TEXT_CAP))}</div>")
                parts.append("  </div>")

            parts.append("</div>")

    parts.append("</body></html>")
    return "\n".join(parts)


# ═══════════════════════════════════════════════════════════════════════════════
#  JSON FORMAT
# ═══════════════════════════════════════════════════════════════════════════════

def _fmt_json(data: dict) -> str:
    out = {
        "query": data["query"],
        "level": data["level"],
        "date": datetime.now().isoformat(),
        "search_results": data["search_results"],
    }
    if data.get("pages"):
        out["pages"] = data["pages"]
    if data.get("subpages"):
        out["subpages"] = data["subpages"]
    return json.dumps(out, indent=2, ensure_ascii=False, default=str)
