#!/usr/bin/env bash
# Medium-detail scrape with page content
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/common.sh"
python3 "$DIR/scrape.py" "$QUERY" --level medium --results "$RESULTS"
