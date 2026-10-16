/**
 * Subtitles.tsx — burned-in subtitles for the vertical Short ONLY (the long video has none, by design).
 * Chunks of ≤ 4 words come from src/short/subtitles.json (written by `npm run voiceover:fit:short` from the
 * recorded take); the word being spoken turns saffron and pops slightly.
 *
 * Placement: centred at y ≈ 1450 — inside the YouTube Shorts safe zone (clear of the title/buttons overlay at
 * the bottom and the action buttons on the right).
 */
import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { PALETTE } from '../theme';
import chunks from './subtitles.json';

type Chunk = { start: number; end: number; words: Array<{ w: string; t: number }> };

export const Subtitles: React.FC<{ top?: number }> = ({ top = 1400 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { fonts: F } = useTheme();
  const t = frame / fps;
  const list = chunks as Chunk[];
  const i = list.findIndex((c, k) => t >= c.start - 0.05 && t < (list[k + 1]?.start ?? c.end + 0.4) - 0.02 && t < c.end + 0.4);
  if (i < 0) return null;
  const chunk = list[i];
  const startF = Math.round(chunk.start * fps);
  const s = spring({ frame: frame - startF + 2, fps, config: SPRINGS.snappy });
  const fadeOut = interpolate(t, [chunk.end + 0.25, chunk.end + 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left: 70, right: 130, top, display: 'flex', justifyContent: 'center', opacity: fadeOut, transform: `translateY(${(1 - s) * 24}px) scale(${0.94 + 0.06 * s})` }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', textAlign: 'center' }}>
        {chunk.words.map((w, k) => {
          const active = t >= w.t && t < (chunk.words[k + 1]?.t ?? chunk.end + 0.3);
          const said = t >= w.t;
          const pop = active ? spring({ frame: frame - Math.round(w.t * fps), fps, config: SPRINGS.cutout }) : 1;
          return (
            <span
              key={k}
              style={{
                fontFamily: F.headline,
                fontWeight: 700,
                fontSize: 84,
                lineHeight: 1.12,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: active ? PALETTE.saffron : said ? '#FFFFFF' : 'rgba(255,255,255,0.88)',
                WebkitTextStroke: '10px #14100C',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 14px rgba(0,0,0,0.45)',
                display: 'inline-block',
                transform: `scale(${active ? 1 + 0.08 * Math.min(1, pop) : 1})`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
