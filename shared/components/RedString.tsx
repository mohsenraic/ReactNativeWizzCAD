/**
 * <RedString> — investigator's red string between pins. Draws on segment by segment, sags under
 * "gravity", and when `tightenAt` is reached every segment is pulled into a knot at `knot`.
 * Pins are passed per frame, so cards can move and the string follows.
 *
 * @example
 * <RedString points={[[300, 220], [960, 180], [1620, 240], [960, 760]]} at={20} closed
 *   tightenAt={300} knot={[960, 470]} />
 */
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { useTheme } from '../theme';
import { Pt, sketchEllipse } from '../lib/sketch';

export const RedString: React.FC<{
  points: Pt[];
  at?: number;
  /** Frames per segment draw. */
  segmentFrames?: number;
  closed?: boolean;
  sag?: number;
  tightenAt?: number;
  tightenDuration?: number;
  /** Knot position drawn when tightened. */
  knot?: Pt;
  color?: string;
  width?: number;
}> = ({ points, at = 0, segmentFrames = 14, closed = false, sag = 0.18, tightenAt, tightenDuration = 24, knot, color: colorProp, width = 4 }) => {
  const frame = useCurrentFrame();
  const { colors: C } = useTheme();
  const color = colorProp ?? C.accent;
  const tight =
    tightenAt === undefined
      ? 0
      : interpolate(frame, [tightenAt, tightenAt + tightenDuration], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.cubic),
        });
  const segs: Array<[Pt, Pt]> = [];
  for (let i = 0; i < points.length - 1; i++) segs.push([points[i], points[i + 1]]);
  if (closed && points.length > 2) segs.push([points[points.length - 1], points[0]]);

  const knotP =
    knot && tightenAt !== undefined
      ? interpolate(frame, [tightenAt + tightenDuration - 4, tightenAt + tightenDuration + 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" style={{ filter: 'drop-shadow(1px 3px 2px rgba(0,0,0,0.3))' }}>
        {segs.map(([a, b], i) => {
          const p = interpolate(frame, [at + i * segmentFrames, at + (i + 1) * segmentFrames], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const s = len * sag * (1 - tight);
          const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + s];
          // Tightening pulls every segment's belly into the knot.
          const c: Pt = knot ? [mid[0] + (knot[0] - mid[0]) * tight * 2, mid[1] + (knot[1] - mid[1]) * tight * 2] : mid;
          return (
            <path
              key={i}
              d={`M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - p}
              opacity={p > 0 ? 1 : 0}
            />
          );
        })}
        {knot && knotP > 0 && (
          <>
            <path d={sketchEllipse(knot[0], knot[1], 26, 18, 'knot-a')} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - knotP} strokeWidth={width + 2} />
            <path d={sketchEllipse(knot[0] + 6, knot[1] - 4, 16, 24, 'knot-b', { tilt: 0.6 })} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - knotP} strokeWidth={width + 2} />
          </>
        )}
      </g>
    </svg>
  );
};
