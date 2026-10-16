/**
 * <Highlighter> — yellow marker sweep behind inline text (left → right, ragged edges, multiply).
 *
 * @example
 * <p>Japan recorded a natural decline of <Highlighter at={30}>−918,253</Highlighter> people.</p>
 */
import React from 'react';
import { Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { useTheme } from '../theme';

export const Highlighter: React.FC<{
  children: React.ReactNode;
  /** Frame (relative to the enclosing sequence) the sweep starts. */
  at?: number;
  /** Sweep length in frames. */
  duration?: number;
  color?: string;
  seed?: string;
  /** Vertical coverage: 'full' marker or a lower 'half' stroke. */
  coverage?: 'full' | 'half';
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({ children, at = 0, duration = 14, color, seed = 'hl', coverage = 'full', blend = 'multiply' }) => {
  const frame = useCurrentFrame();
  const { colors: C } = useTheme();
  const p = interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Ragged marker shape in a 0–100 × 0–20 box, stretched to the text.
  const shape = React.useMemo(() => {
    const r = (k: string, s = 1) => (random(`${seed}-${k}`) - 0.5) * s;
    const top = coverage === 'full' ? 3 : 9;
    const pts: string[] = [`${0 + r('a', 2)},${top + 1 + r('b', 2)}`];
    for (let i = 1; i <= 10; i++) pts.push(`${i * 10},${top + r(`t${i}`, 2.2)}`);
    pts.push(`${100 + r('c', 2)},${(top + 18) / 2 + r('d', 3)}`);
    for (let i = 10; i >= 1; i--) pts.push(`${i * 10},${18 + r(`b${i}`, 2.2)}`);
    pts.push(`${0 + r('e', 2)},${17 + r('f', 2)}`);
    return pts.join(' ');
  }, [seed, coverage]);

  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: '-0.12em',
          top: '0.02em',
          width: 'calc(100% + 0.24em)',
          height: '100%',
          mixBlendMode: blend,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          overflow: 'visible',
        }}
      >
        <polygon points={shape} fill={color ?? C.highlighter} opacity={0.92} />
      </svg>
      <span style={{ position: 'relative' }}>{children}</span>
    </span>
  );
};
