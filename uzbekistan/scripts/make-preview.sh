#!/usr/bin/env bash
# make-preview.sh — small 540p preview of the final render for sharing/review.
#   bash scripts/make-preview.sh            (reads out/uzbekistan.mp4 → writes out/uzbekistan-preview.mp4)
set -euo pipefail
cd "$(dirname "$0")/.."
IN="${1:-out/uzbekistan.mp4}"
OUT="${2:-out/uzbekistan-preview.mp4}"
ffmpeg -hide_banner -loglevel error -y -i "$IN" \
  -vf "scale=960:-2:flags=lanczos" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart "$OUT"
ls -lh "$OUT"
