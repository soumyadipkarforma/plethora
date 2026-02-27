#!/usr/bin/env bash
# ── Quick-run wrapper scripts ──────────────────────────────────────────────

# scrape-low.sh  — fast overview
# scrape-med.sh  — moderate detail
# scrape-high.sh — deep scrape with sub-pages

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: $0 \"search query\" [num_results]"
    echo ""
    echo "Examples:"
    echo "  $0 \"best python frameworks\""
    echo "  $0 \"machine learning news\" 8"
    exit 1
}

[ -z "$1" ] && usage

QUERY="$1"
RESULTS="${2:-5}"
