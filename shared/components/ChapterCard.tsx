/**
 * <ChapterCard> — "1 — THE PEAK": big red number + title in Oswald on a taped paper strip.
 * Slides in, holds, slides out within `durationInFrames`, and darkens the scene underneath
 * slightly so it reads as an overlay on the scene's first frames.
 *
 * @example
 * <Sequence durationInFrames={CHAPTER_CARD_FRAMES}>
 *   <ChapterCard number={1} title="THE PEAK" />
 * </Sequence>
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRINGS, useTheme } from '../theme';
import { tornClipPath } from '../lib/sketch';
import { Sfx } from '../lib/sfx';

export const ChapterCard: React.FC<{
  number: number;
  title: string;
  /** Defaults to the enclosing sequence's duration. */
  durationInFrames?: number;
  /** Title font size in px (default 150). Lower it for long titles so they stay on one line. */
  titleSize?: number;
}> = ({ number, title, durationInFrames, titleSize = 150 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: seq } = useVideoConfig();
  const d = durationInFrames ?? seq;
  const { colors: C, fonts: F } = useTheme();

  const enter = spring({ frame, fps, config: SPRINGS.cutout });
  const exit = spring({ frame: frame - (d - 12), fps, config: SPRINGS.snappy });
  const x = (1 - enter) * -2100 + exit * 2100;
  const dim = interpolate(frame, [0, 6, d - 10, d], [0, 0.35, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Sfx name="paperSlide" at={0} />
      <AbsoluteFill style={{ backgroundColor: `rgba(20,18,15,${dim})` }} />
      <div style={{ transform: `translateX(${x}px) rotate(-2deg)`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))' }}>
        <div
          style={{
            width: 2300,
            height: 320,
            background: '#F5F0E6',
            clipPath: tornClipPath(`chapter-${number}`, { edges: ['top', 'bottom'], depth: 3, teeth: 60 }),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
          }}
        >
          <span style={{ fontFamily: F.headline, fontWeight: 700, fontSize: 230, color: C.accent, lineHeight: 1 }}>
            {number}
          </span>
          <span style={{ width: 90, height: 10, background: C.ink }} />
          <span
            style={{ fontFamily: F.headline, fontWeight: 700, fontSize: titleSize, color: C.ink, letterSpacing: 4, lineHeight: 1, whiteSpace: 'nowrap' }}
          >
            {title}
          </span>
        </div>
        {/* tape */}
        {[-760, 760].map((tx, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: -26,
              width: 170,
              height: 56,
              marginLeft: tx - 85,
              background: 'rgba(240,232,200,0.75)',
              transform: `rotate(${i ? 6 : -5}deg)`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
