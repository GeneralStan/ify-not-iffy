#!/bin/sh
# enc.sh <raw dir> <name>: 1.2x speed, 30fps, H.264 MP4 + VP9 WebM at 2048 wide, poster JPG.
set -e
RAW=$1; NAME=$2; D=/Users/ifeanyi/ify-not-iffy/public/work/leta-design-system
ffmpeg -v error -y -f concat -safe 0 -i $RAW/list.txt -vf "setpts=PTS/1.2,fps=30,scale=2048:-2:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 24 -movflags +faststart -an $D/demo-$NAME.mp4
ffmpeg -v error -y -i $D/demo-$NAME.mp4 -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good -cpu-used 2 -an $D/demo-$NAME.webm
ffmpeg -v error -y -ss 0.8 -i $D/demo-$NAME.mp4 -frames:v 1 -q:v 3 $D/demo-$NAME.jpg
ls -la $D/demo-$NAME.*
