#!/bin/bash
# Compress the 625MB video to ~30-50MB for web
# Requires: ffmpeg (apt install ffmpeg)
#
# Run: bash scripts/compress-video.sh

set -e

INPUT="public/to-hehehehe.mp4"
OUTPUT="public/to-hehehehe-web.mp4"

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Install with: sudo apt install ffmpeg"
    exit 1
fi

echo "🎬 Compressing video..."
echo "   Input:  $(du -h "$INPUT" | cut -f1)"

ffmpeg -i "$INPUT" \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -y \
  "$OUTPUT"

echo "   Output: $(du -h "$OUTPUT" | cut -f1)"
echo ""
echo "✅ Done! Now update SectionFive.tsx:"
echo '   Change: src="/to-hehehehe.mp4"'
echo '   To:     src="/to-hehehehe-web.mp4"'
