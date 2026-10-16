/**
 * <EndCard> — end-screen furniture for the last 10 s: a SUBSCRIBE cutout and a "sources in the
 * description" line, both in the bottom-left so the right side stays clean for YouTube end-screen
 * elements.
 *
 * @example
 * <EndCard at={endAt} tone="dark" />
 */
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Tone, useTheme, useTone } from '../theme';
import { Cutout } from './Cutout';

export const EndCard: React.FC<{
  at: number;
  tone?: Tone;
  label?: string;
  note?: string;
  left?: number;
  top?: number;
}> = ({ at, tone = 'light', label = 'SUBSCRIBE', note = 'ALL SOURCES IN THE DESCRIPTION', left = 120, top = 880 }) => {
  const frame = useCurrentFrame();
  const { colors: C, fonts: F } = useTheme();
  const c = useTone(tone);
  const o = interpolate(frame, [at + 24, at + 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <Cutout enterAt={at + 10} from="bottom" seed="endcard-sub" rotation={-2} style={{ left, top }} background={C.accent}>
        <div style={{ padding: '14px 40px', fontFamily: F.headline, fontWeight: 700, fontSize: 54, color: '#FFFFFF', letterSpacing: 3 }}>{label}</div>
      </Cutout>
      <div style={{ position: 'absolute', left: left + 400, top: top + 40, fontFamily: F.mono, fontSize: 22, letterSpacing: 2, color: c.muted, opacity: o }}>
        {note}
      </div>
    </>
  );
};
