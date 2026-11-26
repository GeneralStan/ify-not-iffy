#!/bin/sh
# Encode frames from scripts/record.mjs into a looping MP4 (H.264) and WebM (VP9).
#   sh scripts/encode.sh <frames-dir> <out-basename> [width]
# width scales the output (default: keep the captured size). Height follows, kept even.
set -e
FRAMES="$1"
OUT="$2"
WIDTH="${3:-}"
FPS=60

SCALE=""
if [ -n "$WIDTH" ]; then SCALE="scale=${WIDTH}:-2:flags=lanczos,"; fi

ffmpeg -loglevel error -y -framerate $FPS -i "$FRAMES/f%04d.png" \
  -vf "${SCALE}format=yuv420p" -c:v libx264 -preset slow -crf 20 -tune animation \
  -movflags +faststart -an "$OUT.mp4"

ffmpeg -loglevel error -y -framerate $FPS -i "$FRAMES/f%04d.png" \
  -vf "${SCALE}format=yuv420p" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -an "$OUT.webm"

# Poster: the settled frame with the banner (2.5s in), for <video poster> and reduced motion.
ffmpeg -loglevel error -y -i "$FRAMES/f0150.png" -vf "${SCALE%,}" -frames:v 1 "$OUT-poster.png" 2>/dev/null \
  || cp "$FRAMES/f0150.png" "$OUT-poster.png"

ls -la "$OUT.mp4" "$OUT.webm" "$OUT-poster.png"
