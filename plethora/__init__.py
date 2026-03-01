"""
Plethora — search the web, scrape sites, generate reports.
"""

from plethora.scraper import web_search, scrape_page, scrape_subpages, run
from plethora.formatter import format_report

__version__ = "2.0.0"
__all__ = ["web_search", "scrape_page", "scrape_subpages", "run", "format_report"]
