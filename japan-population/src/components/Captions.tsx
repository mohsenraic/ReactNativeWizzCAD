/**
 * <Captions> — optional subtitle overlay driven by data/captions.ts.
 * Place it at the root (outside the <Series>) so frames are absolute; toggle with `enabled`.
 *
 * @example
 * <Captions enabled={props.captions} />
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { captionAt } from '../data/captions';
import { FONTS } from '../../../shared/theme';

export const Captions: React.FC<{ enabled?: boolean; bottom?: number; fontSize?: number }> = ({ enabled = true, bottom = 120, fontSize = 40 }) => {
  const frame = useCurrentFrame();
  if (!enabled) return null;
  const c = captionAt(frame);
  if (!c) return null;
  const opacity = interpolate(frame, [c.from, c.from + 4, c.to - 4, c.to], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          marginBottom: bottom,
          maxWidth: 1240,
          padding: '10px 26px 12px',
          background: 'rgba(20,20,22,0.78)',
          color: '#FFFFFF',
          fontFamily: FONTS.body,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.3,
          textAlign: 'center',
          borderRadius: 6,
          opacity,
        }}
      >
        {c.lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
