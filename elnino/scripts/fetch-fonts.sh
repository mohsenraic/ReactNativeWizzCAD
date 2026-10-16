#!/usr/bin/env bash
# Downloads the four Google Fonts (latin subset) into public/fonts for offline / local renders.
# Use with: npx remotion render JapanPopulation out/japan.mp4 --props='{"fonts":"local"}'
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/fonts
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
fetch() { # family-css-name file-prefix weights...
  local css="$1" prefix="$2"; shift 2
  for w in "$@"; do
    url=$(curl -fsS -A "$UA" "https://fonts.googleapis.com/css2?family=${css}:wght@${w}&display=swap" \
      | awk '/\/\* latin \*\//{f=1} f && /src: url/{match($0,/https:[^)]*/); print substr($0,RSTART,RLENGTH); exit}')
    curl -fsS "$url" -o "public/fonts/${prefix}-${w}.woff2"
    echo "public/fonts/${prefix}-${w}.woff2"
  done
}
fetch Oswald oswald 500 700
fetch IBM+Plex+Sans plexsans 400 500 600
fetch IBM+Plex+Mono plexmono 400 500
fetch Caveat caveat 500 700
