#!/usr/bin/env python3
"""
Google Scraper CLI — search, scrape, report.

Usage:
  python scrape.py "your search query" --level low|medium|high
  python scrape.py "python web frameworks" --level high --results 8 --subpages 3
"""

import argparse
import sys
from scraper import run


def main():
    parser = argparse.ArgumentParser(
        description="Google Search Scraper — scrape results and generate reports",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Report levels:
  low    — Quick list of search results (titles, URLs, snippets)
  medium — Scrapes each result page (headings, meta, content preview)
  high   — Deep scrape: pages + sub-pages with full content + JSON export

Examples:
  python scrape.py "best python libraries 2026" --level low
  python scrape.py "machine learning tutorials" --level medium --results 5
  python scrape.py "climate change data" --level high --results 8 --subpages 3
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

    args = parser.parse_args()

    try:
        path = run(
            query=args.query,
            level=args.level,
            num_results=args.results,
            max_subpages=args.subpages,
            output_dir=args.output,
        )
        print(f"\n✅ Done! Report at: {path}")
    except KeyboardInterrupt:
        print("\n⚠ Interrupted.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
