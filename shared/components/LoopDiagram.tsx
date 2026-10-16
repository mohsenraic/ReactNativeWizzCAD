/**
 * <LoopDiagram> — hand-drawn cycle: labels around a circle in red Caveat, joined by curved
 * hand-drawn arrows that draw on one after another; the last arrow returns to the start.
 * After completing, the whole loop can slowly rotate (`spinAfter`) to sell "it's a loop".
 *
 * @example
 * <LoopDiagram
 *   nodes={['depopulation', 'closures', 'migration to cities', 'lower fertility']}
 *   center={[960, 540]} radius={300} at={20} perNode={30}
 * />
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { useTheme } from '../theme';
import { catmullRom, Pt, smoothNoise } from '../lib/sketch';

export const LoopDiagram: React.FC<{
  nodes: string[];
  center?: Pt;
  radius?: number;
  /** Ellipse squash (ry = radius × aspect). */
  aspect?: number;
  at?: number;
  /** Frames per step (label, then its outgoing arrow). */
  perNode?: number;
  color?: string;
  labelColor?: string;
  fontSize?: number;
  /** Degrees per frame of slow rotation once complete (labels stay upright). */
  spin?: number;
}> = ({ nodes, center = [960, 540], radius = 300, aspect = 0.72, at = 0, perNode = 30, color: colorProp, labelColor: labelColorProp, fontSize = 52, spin = 0.06 }) => {
  const frame = useCurrentFrame();
  const { colors: C, fonts: F } = useTheme();
  const color = colorProp ?? C.accent;
  const labelColor = labelColorProp ?? C.ink;
  const n = nodes.length;
  const doneAt = at + n * perNode;
  const rot = Math.max(0, frame - doneAt) * spin * (Math.PI / 180);
  const pos = (a: number): Pt => [center[0] + Math.cos(a + rot) * radius, center[1] + Math.sin(a + rot) * radius * aspect];
  const angleOf = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const gap = 0.42;

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {nodes.map((label, i) => {
        const a0 = angleOf(i);
        const a1 = angleOf(i + 1);
        const labelP = interpolate(frame, [at + i * perNode, at + i * perNode + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const arrowP = interpolate(frame, [at + i * perNode + 10, at + (i + 1) * perNode], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.quad),
        });
        // Arc points, bowed slightly outward, with hand jitter.
        const noise = smoothNoise(`loop-${i}`);
        const pts: Pt[] = [];
        for (let k = 0; k <= 16; k++) {
          const t = k / 16;
          const a = a0 + gap + (a1 - a0 - gap * 2) * t;
          const bow = 1 + 0.08 * Math.sin(Math.PI * t) + noise(t * 3) * 0.012;
          pts.push([center[0] + Math.cos(a + rot) * radius * bow, center[1] + Math.sin(a + rot) * radius * aspect * bow]);
        }
        const end = pts[pts.length - 1];
        const prev = pts[pts.length - 3];
        const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
        const head = `M ${end[0] - Math.cos(ang - 0.5) * 24} ${end[1] - Math.sin(ang - 0.5) * 24} L ${end[0]} ${end[1]} L ${end[0] - Math.cos(ang + 0.5) * 24} ${end[1] - Math.sin(ang + 0.5) * 24}`;
        const [lx, ly] = pos(a0);
        return (
          <g key={i}>
            <path d={catmullRom(pts)} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrowP} opacity={arrowP > 0 ? 1 : 0} />
            <path d={head} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={arrowP > 0.96 ? 1 : 0} />
            <text
              x={lx}
              y={ly + fontSize * 0.3 + (1 - labelP) * 10}
              textAnchor="middle"
              fontFamily={F.hand}
              fontWeight={700}
              fontSize={fontSize}
              fill={labelColor}
              opacity={labelP}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
