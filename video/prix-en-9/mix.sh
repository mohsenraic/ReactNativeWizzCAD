#!/usr/bin/env bash
# Mixes voiceover.wav over out/music.wav (music + SFX), ducking the bed under the voice.
# Output: out/mix.wav, ~-14 LUFS for Instagram.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -hide_banner -loglevel error -i voiceover.wav -i out/music.wav -filter_complex "
 [0:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=5dB,asplit=2[vo][key];
 [1:a]volume=-3dB[bed];
 [bed][key]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[duck];
 [duck][vo]amix=inputs=2:duration=longest:normalize=0,apad=whole_dur=51,atrim=0:51,loudnorm=I=-14:TP=-1.5:LRA=9[out]" \
 -map "[out]" -ar 48000 out/mix.wav
ffmpeg -hide_banner -i out/mix.wav -af ebur128=framelog=quiet -f null - 2>&1 | grep -E " I:| Peak:" || true
