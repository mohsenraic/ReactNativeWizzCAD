import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, SubtitleSegment, SUBTITLES, VIDEO} from '../config';
import {displayFont} from '../lib/fonts';
import {isAccent, splitWords} from '../lib/text';
import {POP_SPRING, springAt} from '../lib/time';

/** Instants de début de chaque mot : explicites, ou répartis selon la longueur des mots */
const wordTimings = (seg: SubtitleSegment, words: string[]) => {
  if (seg.wordStarts && seg.wordStarts.length === words.length) return seg.wordStarts;
  const weights = words.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = seg.end - seg.start;
  let acc = seg.start;
  return weights.map((wt) => {
    const t = acc;
    acc += (wt / total) * span;
    return t;
  });
};

/** Sous-titres « karaoké » : 2 à 4 mots, mot actif en or */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / VIDEO.fps;
  const hidden = SUBTITLES.hiddenRanges.some(([a, b]) => time >= a && time < b);
  const seg = SUBTITLES.segments.find((s) => time >= s.start && time < s.end);
  if (!seg || hidden) return null;

  const words = splitWords(seg.text);
  const starts = wordTimings(seg, words);
  let active = 0;
  starts.forEach((s, i) => {
    if (time >= s) active = i;
  });

  const enter = springAt(time, seg.start, {damping: 16, mass: 0.6, stiffness: 160});
  const exit = interpolate(time, [seg.end - 0.1, seg.end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fs = SUBTITLES.fontSize;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: SUBTITLES.centerY,
          transform: `translateY(-50%) translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
          opacity: Math.min(enter, exit),
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: fs * 0.4,
            rowGap: 4,
            padding: '14px 30px',
            borderRadius: 26,
            background: 'rgba(8,14,28,0.42)',
            backdropFilter: 'blur(6px)',
            fontFamily: displayFont,
            fontWeight: 800,
            fontSize: fs,
            lineHeight: 1.15,
            letterSpacing: -0.5,
          }}
        >
          {words.map((w, i) => {
            const isActive = i === active;
            const pop = springAt(time, starts[i], POP_SPRING);
            const bump = isActive ? interpolate(pop, [0, 0.5, 1], [1, 1.06, 1.03]) : 1;
            const future = i > active;
            const gold = isActive || isAccent(w, SUBTITLES.alwaysAccent);
            return (
              <span
                key={`${seg.start}-${i}`}
                style={{
                  display: 'inline-block',
                  color: gold ? COLORS.accent : COLORS.text,
                  opacity: future ? 0.55 : 1,
                  transform: `scale(${bump})`,
                  textShadow: isActive
                    ? '0 0 22px rgba(245,184,65,0.55), 0 3px 10px rgba(0,0,0,0.7)'
                    : '0 3px 12px rgba(0,0,0,0.75)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
