/**
 * <PaperBackground> — warm paper (light), charcoal paper (dark) or cork-style board.
 * Grain is an SVG feTurbulence layer; fibers are seeded short curves. Static by design
 * (no per-frame flicker) so it compresses well.
 *
 * @example
 * <AbsoluteFill>
 *   <PaperBackground tone="dark" />
 *   …scene content…
 * </AbsoluteFill>
 */
import React, { useId } from 'react';
import { AbsoluteFill, random } from 'remotion';
import { useTheme } from '../theme';
import { catmullRom, Pt } from '../lib/sketch';

export type PaperVariant = 'light' | 'dark' | 'cork';

const BASE: Record<PaperVariant, { bg: string; fiber: string; grainOpacity: number; vignette: string }> = {
  light: { bg: '', fiber: 'rgba(120,100,70,0.16)', grainOpacity: 0.22, vignette: 'rgba(90,70,40,0.16)' },
  dark: { bg: '', fiber: 'rgba(255,255,255,0.05)', grainOpacity: 0.35, vignette: 'rgba(0,0,0,0.45)' },
  cork: { bg: '#C9A57A', fiber: 'rgba(90,55,25,0.30)', grainOpacity: 0.55, vignette: 'rgba(60,35,10,0.30)' },
};

export const PaperBackground: React.FC<{
  tone?: PaperVariant;
  seed?: string;
  fiberCount?: number;
  width?: number;
  height?: number;
}> = ({ tone = 'light', seed = 'paper', fiberCount = 70, width = 1920, height = 1080 }) => {
  const id = useId().replace(/:/g, '');
  const th = useTheme();
  const b = { ...BASE[tone], bg: tone === 'light' ? th.colors.paper : tone === 'dark' ? th.colors.paperDark : BASE[tone].bg };

  const fibers = React.useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < fiberCount; i++) {
      const x = random(`${seed}-fx${i}`) * width;
      const y = random(`${seed}-fy${i}`) * height;
      const len = 20 + random(`${seed}-fl${i}`) * 70;
      const a = random(`${seed}-fa${i}`) * Math.PI * 2;
      const pts: Pt[] = [0, 0.5, 1].map((t) => [
        x + Math.cos(a) * len * t + Math.sin(t * 6 + i) * 4,
        y + Math.sin(a) * len * t + Math.cos(t * 5 + i) * 4,
      ]);
      out.push(catmullRom(pts));
    }
    return out;
  }, [seed, fiberCount, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: b.bg }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} stitchTiles="stitch" />
            <feColorMatrix
              type="matrix"
              values={
                tone === 'dark'
                  ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.35'
                  : '0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.9 -0.35'
              }
            />
          </filter>
          <filter id={`mottle-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={2} seed={3} />
            <feColorMatrix
              type="matrix"
              values={
                tone === 'dark'
                  ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 -0.05'
                  : '0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.26 -0.06'
              }
            />
          </filter>
          <radialGradient id={`vig-${id}`} cx="50%" cy="48%" r="75%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor={b.vignette} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} filter={`url(#mottle-${id})`} />
        <rect width={width} height={height} filter={`url(#grain-${id})`} opacity={b.grainOpacity} />
        {tone === 'cork' && <CorkSpecks seed={seed} width={width} height={height} />}
        <g stroke={b.fiber} strokeWidth={1} fill="none" strokeLinecap="round">
          {fibers.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <rect width={width} height={height} fill={`url(#vig-${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

const CorkSpecks: React.FC<{ seed: string; width: number; height: number }> = ({ seed, width, height }) => {
  const specks = React.useMemo(
    () =>
      Array.from({ length: 900 }, (_, i) => ({
        x: random(`${seed}-cx${i}`) * width,
        y: random(`${seed}-cy${i}`) * height,
        r: 0.8 + random(`${seed}-cr${i}`) * 2.4,
        dark: random(`${seed}-cd${i}`) > 0.45,
      })),
    [seed, width, height],
  );
  return (
    <g>
      {specks.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.dark ? 'rgba(80,45,15,0.35)' : 'rgba(255,235,200,0.25)'} />
      ))}
    </g>
  );
};
