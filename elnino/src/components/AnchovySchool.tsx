/**
 * <AnchovySchool> — a school of simple paper-cut anchovies circling in cool water off Peru; as `warm`
 * goes 0 → 1 a warm patch spreads over them and the school streams away south and down, out of the patch.
 * Simple shapes only (no realistic fish).
 *
 * @example
 * <AnchovySchool center={[1500, 620]} warm={interpolate(frame, [40, 140], [0, 1])} />
 */
import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { PALETTE } from '../theme';

const N = 26;

export const AnchovySchool: React.FC<{
  center: [number, number];
  /** 0 = cool water, school circling; 1 = warm water, school gone. */
  warm: number;
  radius?: number;
}> = ({ center, warm, radius = 150 }) => {
  const frame = useCurrentFrame();
  const w = Math.max(0, Math.min(1, warm));
  const [cx, cy] = center;
  const fish = React.useMemo(
    () =>
      Array.from({ length: N }, (_, i) => ({
        r: 0.25 + random(`anc-r${i}`) * 0.75,
        ph: random(`anc-p${i}`) * Math.PI * 2,
        sp: 0.018 + random(`anc-s${i}`) * 0.012,
        size: 1.6 + random(`anc-z${i}`) * 0.9,
        lag: random(`anc-l${i}`) * 0.35,
      })),
    [],
  );
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="anchovy-warm">
          <stop offset="0%" stopColor={PALETTE.warm} stopOpacity={0.75} />
          <stop offset="70%" stopColor={PALETTE.warm} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PALETTE.warm} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="anchovy-cool">
          <stop offset="0%" stopColor={PALETTE.cool} stopOpacity={0.55} />
          <stop offset="100%" stopColor={PALETTE.cool} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius * 1.7} fill="url(#anchovy-cool)" opacity={1 - w * 0.8} />
      <circle cx={cx - 40} cy={cy - 30} r={radius * (0.3 + w * 1.6)} fill="url(#anchovy-warm)" opacity={w > 0 ? 1 : 0} />
      {fish.map((f, i) => {
        const a = f.ph + frame * f.sp * 2.2;
        const ex = Math.max(0, Math.min(1, (w - f.lag) / 0.55)); // each fish leaves at its own moment
        const ease = ex * ex * (3 - 2 * ex);
        // Flee south-west: away from the coast and out of the warm patch.
        const x = cx + Math.cos(a) * radius * f.r - ease * (140 + f.r * 200);
        const y = cy + Math.sin(a) * radius * 0.55 * f.r + ease * (260 + f.r * 200);
        // Nose points to −x: rotate by the travel direction + 180°.
        const heading = ease > 0.05 ? (Math.atan2(260, -170) * 180) / Math.PI + 180 : (a * 180) / Math.PI + 270;
        const s = f.size;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${heading}) scale(${s})`} opacity={1 - ease * 0.9}>
            <path d="M -18 0 Q -4 -7 12 0 Q -4 7 -18 0 Z" fill="#C9D9E0" stroke={PALETTE.ink} strokeWidth={1.6} />
            <path d="M 12 0 L 20 -6 L 18 0 L 20 6 Z" fill="#C9D9E0" stroke={PALETTE.ink} strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};
