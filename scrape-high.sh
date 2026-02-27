#!/usr/bin/env bash
# High-detail deep scrape with sub-pages + JSON export
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/common.sh"
SUBPAGES="${3:-2}"
python3 "$DIR/scrape.py" "$QUERY" --level high --results "$RESULTS" --subpages "$SUBPAGES"
