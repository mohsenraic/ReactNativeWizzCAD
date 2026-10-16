/**
 * illustrations.tsx — hand-made, original paper illustrations used by single scenes:
 *   Horsemen      paper silhouettes of Mongol riders galloping in (Scene 5)
 *   Flames        flat, stylized paper flames (illustrated, never realistic) (Scene 5)
 *   KhivaPlan     top-down plan of Itchan Kala: walls draw themselves, monuments pop in (Scene 6)
 *   StarChart     constellation dots + lines drawing on, for Ulugh Beg (Scene 4)
 *   CalendarCard  tear-off calendar page (Scene 2)
 *   Passport      passport cutout (Scene 7)
 *   Stopwatch     ticking stopwatch with a count-up (Scene 6)
 *   AralShrink    stylized Aral Sea outlines shrinking over decades — NOT TO SCALE (Scene 8)
 *   Heatmap       crowd-density heatmap over a stylized old-town plan (Scene 9)
 */
import React from 'react';
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../../../shared/theme';
import { formatNumber } from '../../../shared/lib/format';
import { Sfx } from '../../../shared/lib/sfx';
import { PALETTE } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ── Horsemen ──────────────────────────────────────────────────────────────────────────────────────────────
const RIDER =
  'M-60 20 C -58 4, -44 -6, -26 -8 L -6 -10 C 0 -24, 8 -30, 18 -30 L 22 -46 L 30 -46 L 30 -30 C 40 -28, 48 -20, 52 -10 L 70 -14 L 76 -4 L 54 4 C 50 12, 44 18, 36 20 L 46 44 L 38 46 L 26 22 L 0 22 L -14 46 L -22 44 L -14 20 C -30 22, -46 26, -52 44 L -60 42 Z ' +
  'M10 -34 C 8 -48, 12 -62, 22 -66 C 30 -66, 34 -58, 32 -50 L 26 -36 Z M 22 -66 L 18 -84 L 24 -66 Z';

export const Horsemen: React.FC<{ at: number; count?: number; y?: number; color?: string; outAt?: number }> = ({ at, count = 5, y = 760, color = '#2A2420', outAt }) => {
  const frame = useCurrentFrame();
  const out = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 12], [1, 0], clamp);
  if (frame < at || out <= 0) return null;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: out }}>
      {Array.from({ length: count }, (_, i) => {
        const delay = i * 5 + random(`h${i}`) * 4;
        const t = interpolate(frame, [at + delay, at + delay + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const x = -300 + t * (380 + i * 150);
        const bob = Math.sin((frame + i * 7) / 3) * 4;
        const s = 1.5 + random(`hs${i}`) * 0.5;
        return (
          <g key={i} transform={`translate(${x} ${y + (i % 2) * 70 + bob}) scale(${s})`}>
            <path d={RIDER} fill={color} />
            <path d="M-60 20 L -76 30" stroke={color} strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
};

// ── Flames ────────────────────────────────────────────────────────────────────────────────────────────────
export const Flames: React.FC<{ at: number; x: number; y: number; width: number; outAt?: number; seed?: string }> = ({ at, x, y, width, outAt, seed = 'fl' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 14], [1, 0], clamp);
  if (frame < at || out <= 0) return null;
  const n = Math.round(width / 70);
  return (
    <svg width={width} height={420} style={{ position: 'absolute', left: x, top: y - 420, opacity: out, overflow: 'visible' }}>
      <Sfx name="whooshSoft" at={at} volume={0.3} />
      {Array.from({ length: n }, (_, i) => {
        const s = spring({ frame: frame - (at + i * 2), fps, config: SPRINGS.cutout });
        const flick = 1 + Math.sin((frame + i * 13) / 2.6) * 0.08 + Math.sin((frame + i * 5) / 4.1) * 0.05;
        const h = (140 + random(`${seed}${i}`) * 200) * s * flick;
        const cx = (i + 0.5) * (width / n);
        const w = width / n;
        const flame = (hh: number, ww: number) => `M${cx - ww / 2},420 C ${cx - ww / 2},${420 - hh * 0.5} ${cx - ww * 0.1},${420 - hh * 0.7} ${cx},${420 - hh} C ${cx + ww * 0.1},${420 - hh * 0.7} ${cx + ww / 2},${420 - hh * 0.5} ${cx + ww / 2},420 Z`;
        return (
          <g key={i}>
            <path d={flame(h, w * 1.3)} fill={PALETTE.terracotta} />
            <path d={flame(h * 0.7, w * 0.9)} fill={PALETTE.saffron} />
            <path d={flame(h * 0.35, w * 0.45)} fill="#FFE9A8" />
          </g>
        );
      })}
    </svg>
  );
};

// ── Khiva plan ────────────────────────────────────────────────────────────────────────────────────────────
/** Monuments on the plan as fractions of the walled rectangle (x across 0–1 = west→east, y 0–1 = north→south). Schematic. */
export const KHIVA_PLAN_POINTS = {
  westGate: [0, 0.52] as [number, number],
  eastGate: [1, 0.55] as [number, number],
  kaltaMinor: [0.28, 0.47] as [number, number],
  kunyaArk: [0.14, 0.5] as [number, number],
  islamKhoja: [0.58, 0.68] as [number, number],
  juma: [0.55, 0.47] as [number, number],
  tashHauli: [0.82, 0.3] as [number, number],
};

export const KhivaPlan: React.FC<{
  at: number;
  /** Plan rectangle on screen (650 × 400 m, elongated north–south: drawn portrait). */
  x: number;
  y: number;
  w: number;
  h: number;
  dotsAt?: number;
  dots?: number;
}> = ({ at, x, y, w, h, dotsAt, dots = 51 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [at, at + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // crenellated wall path (one continuous stroke)
  const teeth = 28;
  const crenel = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) => {
    let d = '';
    for (let i = 0; i < teeth; i++) {
      const t0 = i / teeth;
      const t1 = (i + 0.5) / teeth;
      const t2 = (i + 1) / teeth;
      const P = (t: number, off: number) => `${ax + (bx - ax) * t + nx * off},${ay + (by - ay) * t + ny * off}`;
      d += `L${P(t0, 0)} L${P(t0, 9)} L${P(t1, 9)} L${P(t1, 0)} L${P(t2, 0)} `;
    }
    return d;
  };
  const wall = `M${x},${y} ` + crenel(x, y, x + w, y, 0, -1) + crenel(x + w, y, x + w, y + h, 1, 0) + crenel(x + w, y + h, x, y + h, 0, 1) + crenel(x, y + h, x, y, -1, 0) + 'Z';
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <rect x={x} y={y} width={w} height={h} fill="#E8D7B5" opacity={p} />
      {/* street grid inside */}
      <g stroke="#CDB98F" strokeWidth={3} opacity={interpolate(frame, [at + 30, at + 50], [0, 1], clamp)}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={`v${f}`} x1={x + w * f} y1={y + 8} x2={x + w * f + (f - 0.5) * 30} y2={y + h - 8} />
        ))}
        {[0.2, 0.52, 0.8].map((f) => (
          <line key={`h${f}`} x1={x + 8} y1={y + h * f} x2={x + w - 8} y2={y + h * f + 10} />
        ))}
      </g>
      <path d={wall} fill="none" stroke="#8C6A3C" strokeWidth={6} strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {dotsAt !== undefined &&
        Array.from({ length: dots }, (_, i) => {
          const s = spring({ frame: frame - (dotsAt + i * 0.8), fps, config: SPRINGS.cutout });
          if (s <= 0.01) return null;
          const dx = x + 20 + random(`kd${i}`) * (w - 40);
          const dy = y + 20 + random(`kdy${i}`) * (h - 40);
          const c = [PALETTE.turquoise, PALETTE.lapis, PALETTE.terracotta][i % 3];
          return <circle key={i} cx={dx} cy={dy} r={8 * s} fill={c} stroke="#FBFAF6" strokeWidth={2} />;
        })}
      {/* gates */}
      {(['westGate', 'eastGate'] as const).map((g) => {
        const [fx, fy] = KHIVA_PLAN_POINTS[g];
        return <rect key={g} x={x + fx * w - 12} y={y + fy * h - 18} width={24} height={36} fill={PALETTE.terracotta} opacity={p} />;
      })}
    </svg>
  );
};

// ── Star chart ────────────────────────────────────────────────────────────────────────────────────────────
export const StarChart: React.FC<{ at: number; x: number; y: number; w: number; h: number }> = ({ at, x, y, w, h }) => {
  const frame = useCurrentFrame();
  const stars = React.useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({ x: random(`sx${i}`) * w, y: random(`sy${i}`) * h, r: 1.5 + random(`sr${i}`) * 3.5 })),
    [w, h],
  );
  const lines: Array<[number, number]> = [
    [0, 3], [3, 7], [7, 12], [12, 5], [5, 0], [9, 14], [14, 20], [20, 25], [25, 9], [30, 33], [33, 38],
  ];
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
      <rect width={w} height={h} rx={8} fill={PALETTE.lapisPaper} />
      <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.44} fill="none" stroke="rgba(242,238,230,0.25)" strokeWidth={2} strokeDasharray="4 8" />
      {stars.map((s, i) => {
        const o = interpolate(frame, [at + i * 0.7, at + i * 0.7 + 8], [0, 1], clamp);
        const tw = 0.7 + 0.3 * Math.sin((frame + i * 11) / 9);
        return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF4D0" opacity={o * tw} />;
      })}
      {lines.map(([a, b], i) => {
        const p = interpolate(frame, [at + 30 + i * 5, at + 42 + i * 5], [0, 1], clamp);
        if (p <= 0) return null;
        const A = stars[a];
        const B = stars[b];
        return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * p} y2={A.y + (B.y - A.y) * p} stroke={PALETTE.saffron} strokeWidth={2.5} />;
      })}
    </svg>
  );
};

// ── Calendar card ─────────────────────────────────────────────────────────────────────────────────────────
export const CalendarCard: React.FC<{ month: string; year: number; at: number }> = ({ month, year, at }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const y = Math.round(interpolate(frame, [at + 4, at + 30], [year - 15, year], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return (
    <div style={{ width: 360, background: '#FBFAF6', fontFamily: F.headline, textAlign: 'center' }}>
      <div style={{ background: PALETTE.terracotta, color: '#FBFAF6', fontSize: 64, fontWeight: 700, padding: '10px 0', letterSpacing: 4 }}>{month}</div>
      <div style={{ fontSize: 120, fontWeight: 700, color: PALETTE.ink, padding: '6px 0 2px' }}>{y}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, padding: '6px 22px 22px' }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} style={{ height: 18, background: frame > at + 20 + i ? PALETTE.turquoise : '#E4DED2', borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
};

// ── Passport ──────────────────────────────────────────────────────────────────────────────────────────────
export const Passport: React.FC = () => {
  const { fonts: F } = useTheme();
  return (
    <div style={{ width: 300, height: 420, background: PALETTE.lapis, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.08)' }}>
      <svg width={120} height={120} viewBox="-60 -60 120 120">
        <circle r={50} fill="none" stroke={PALETTE.saffron} strokeWidth={5} />
        <path d="M-30 0 H30 M0 -50 C 22 -20, 22 20, 0 50 M0 -50 C -22 -20, -22 20, 0 50" fill="none" stroke={PALETTE.saffron} strokeWidth={4} />
      </svg>
      <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 52, color: PALETTE.saffron, letterSpacing: 8 }}>PASSPORT</div>
    </div>
  );
};

// ── Stopwatch ─────────────────────────────────────────────────────────────────────────────────────────────
export const Stopwatch: React.FC<{ at: number; to: number; duration?: number; label?: string; prefix?: string }> = ({ at, to, duration = 60, label = 'MIN', prefix = '' }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const v = interpolate(frame, [at, at + duration], [0, to], clamp);
  const a = (v / 60) * 360 * 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <svg width={150} height={170} viewBox="-75 -90 150 170">
        <rect x={-12} y={-90} width={24} height={16} rx={3} fill={PALETTE.ink} />
        <circle r={68} fill="#FBFAF6" stroke={PALETTE.ink} strokeWidth={7} />
        <path d={`M0 0 L0 -60 A60 60 0 ${a % 360 > 180 ? 1 : 0} 1 ${60 * Math.sin((a % 360) * (Math.PI / 180))} ${-60 * Math.cos((a % 360) * (Math.PI / 180))} Z`} fill={PALETTE.turquoise} opacity={0.35} />
        <line x1={0} y1={0} x2={52 * Math.sin((a * Math.PI) / 180)} y2={-52 * Math.cos((a * Math.PI) / 180)} stroke={PALETTE.terracotta} strokeWidth={6} strokeLinecap="round" />
        <circle r={7} fill={PALETTE.ink} />
      </svg>
      <div style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 110, color: '#FBFAF6' }}>
        {prefix}
        {formatNumber(v)} <span style={{ fontSize: 56 }}>{label}</span>
      </div>
    </div>
  );
};

// ── Aral Sea shrinking (stylized) ─────────────────────────────────────────────────────────────────────────
/**
 * Three stylized shorelines — "1960s", "2000s", "TODAY". Shapes are hand-drawn approximations, NOT to scale:
 * the scene's SourceTag says "STYLIZED · NOT TO SCALE".
 */
const ARAL_SHAPES = [
  'M220 60 C 330 30, 470 70, 520 150 C 560 230, 540 330, 520 420 C 500 520, 420 600, 320 610 C 220 620, 150 560, 130 470 C 110 380, 70 300, 90 210 C 110 120, 150 80, 220 60 Z',
  'M240 90 C 300 80, 360 110, 370 160 C 380 210, 330 230, 300 260 C 330 320, 380 380, 370 450 C 360 520, 300 560, 250 540 C 200 520, 190 450, 180 380 C 170 300, 150 220, 170 150 C 190 110, 210 95, 240 90 Z',
  'M250 110 C 290 100, 330 120, 330 150 C 330 180, 290 190, 270 190 C 240 190, 220 170, 225 140 C 228 120, 238 113, 250 110 Z M215 330 C 235 320, 250 360, 245 420 C 240 480, 215 500, 200 470 C 190 440, 195 360, 215 330 Z',
];
export const AralShrink: React.FC<{ at: number; step?: number; x: number; y: number; scale?: number; moynaq: [number, number] }> = ({ at, step = 30, x, y, scale = 1, moynaq }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const labels = ['1960s', '2000s', 'TODAY'];
  let cur = 0;
  labels.forEach((_, i) => {
    if (frame >= at + i * step) cur = i;
  });
  return (
    <svg width={700 * scale} height={700 * scale} viewBox="0 0 700 700" style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
      <rect x={20} y={20} width={660} height={660} fill="#E8DCC4" rx={10} />
      {ARAL_SHAPES.map((d, i) => {
        const o = interpolate(frame, [at + i * step, at + i * step + 14], [0, 1], clamp);
        const gone = i < cur ? interpolate(frame, [at + (i + 1) * step, at + (i + 1) * step + 14], [1, 0.0], clamp) : 1;
        return (
          <g key={i}>
            <path d={d} fill={i === 2 ? PALETTE.turquoise : PALETTE.turquoiseLight} opacity={o * (i === 2 ? 1 : 0.85 * gone)} />
            {i < 2 && <path d={d} fill="none" stroke={PALETTE.greyDark} strokeWidth={2} strokeDasharray="8 7" opacity={o} />}
          </g>
        );
      })}
      <circle cx={moynaq[0]} cy={moynaq[1]} r={11} fill={PALETTE.terracotta} stroke="#FBFAF6" strokeWidth={3} />
      <text x={moynaq[0] - 18} y={moynaq[1] + 8} textAnchor="end" fontFamily={F.mono} fontSize={24} fill={PALETTE.ink}>
        MOYNAQ
      </text>
      <text x={660} y={66} textAnchor="end" fontFamily={F.headline} fontWeight={700} fontSize={56} fill={PALETTE.ink}>
        {labels[cur]}
      </text>
    </svg>
  );
};

// ── Heatmap over a stylized old town ──────────────────────────────────────────────────────────────────────
export const Heatmap: React.FC<{ at: number; x: number; y: number; w: number; h: number; hotspots: Array<[number, number]> }> = ({ at, x, y, w, h, hotspots }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [at, at + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const id = 'heat';
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: x, top: y }}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#C0392B" stopOpacity={0.85} />
          <stop offset="0.45" stopColor="#E67E22" stopOpacity={0.55} />
          <stop offset="1" stopColor="#F4D03F" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill="#EDE3CF" />
      {Array.from({ length: 70 }, (_, i) => {
        const bx = (i % 10) * (w / 10) + 6;
        const by = Math.floor(i / 10) * (h / 7) + 6;
        return <rect key={i} x={bx} y={by} width={w / 10 - 12 - random(`b${i}`) * 14} height={h / 7 - 12 - random(`bh${i}`) * 10} fill="#D8C7A6" />;
      })}
      {hotspots.map(([hx, hy], i) => {
        const pulse = 1 + Math.sin((frame + i * 9) / 8) * 0.06;
        return <circle key={i} cx={hx * w} cy={hy * h} r={(120 + i * 25) * grow * pulse} fill={`url(#${id})`} />;
      })}
    </svg>
  );
};
