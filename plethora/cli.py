#!/usr/bin/env python3
"""
Plethora CLI — search, scrape, report.

Usage:
  python scrape.py "your search query" --level low|medium|high
  python scrape.py "python web frameworks" --level high --results 8 --subpages 3
"""

import argparse
import sys
from plethora.scraper import run


def main():
    parser = argparse.ArgumentParser(
        description="Plethora — scrape the web and generate reports",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Report levels:
  low    — Quick list of search results (titles, URLs, snippets)
  medium — Scrapes each result page (headings, meta, content preview)
  high   — Deep scrape: pages + sub-pages with full content

Output formats:
  txt    — Plain text report (default)
  md     — Markdown report
  html   — Self-contained HTML with dark theme
  json   — Raw structured JSON data
  pdf    — PDF document with watermark
  all    — All of the above

Examples:
  python scrape.py "best python libraries 2026" --level low
  python scrape.py "machine learning tutorials" --level medium --results 5
  python scrape.py "climate change data" --level high --results 8 --subpages 3
  python scrape.py "AI research" --level high --format all --workers 6
        """,
    )
    parser.add_argument("query", help="Search query string")
    parser.add_argument(
        "-l", "--level",
        choices=["low", "medium", "high"],
        default="medium",
        help="Report detail level (default: medium)",
    )
    parser.add_argument(
        "-n", "--results",
        type=int, default=5,
        help="Number of search results to process (default: 5)",
    )
    parser.add_argument(
        "-s", "--subpages",
        type=int, default=2,
        help="Max sub-pages per site for high-level reports (default: 2)",
    )
    parser.add_argument(
        "-o", "--output",
        default="reports",
        help="Output directory for reports (default: reports/)",
    )
    parser.add_argument(
        "-f", "--format",
        choices=["txt", "md", "html", "json", "pdf", "all"],
        default="txt",
        help="Output format (default: txt)",
    )
    parser.add_argument(
        "-w", "--workers",
        type=int, default=4,
        help="Concurrent scraping workers (default: 4)",
    )
    parser.add_argument(
        "-q", "--quiet",
        action="store_true",
        help="Suppress progress output",
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Bypass URL cache",
    )
    parser.add_argument(
        "--cache-ttl",
        type=int, default=3600,
        help="Cache TTL in seconds (default: 3600)",
    )

    args = parser.parse_args()

    try:
        paths = run(
            query=args.query,
            level=args.level,
            num_results=args.results,
            max_subpages=args.subpages,
            output_dir=args.output,
            workers=args.workers,
            use_cache=not args.no_cache,
            cache_ttl=args.cache_ttl,
            quiet=args.quiet,
            out_format=args.format,
        )
        print(f"\n✅ Done! {len(paths)} report(s) saved:")
        for p in paths:
            print(f"   → {p}")

        # Pick the primary report to offer for viewing (prefer txt > md > html > json)
        viewable = next((p for p in paths if p.endswith(".txt")),
                        next((p for p in paths if p.endswith(".md")),
                             paths[0] if paths else None))
        if viewable:
            answer = input(f"\n📄 View {viewable} now? [y/N] ").strip().lower()
            if answer in ("y", "yes"):
                import subprocess
                subprocess.run(["less", "-R", viewable])
    except KeyboardInterrupt:
        print("\n⚠ Interrupted.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
