import React from 'react';
import {interpolate} from 'remotion';
import {COLORS} from '../config';
import {displayFont} from '../lib/fonts';
import {isAccent, splitWords} from '../lib/text';
import {springAt} from '../lib/time';

type Props = {
  text: string;
  accentWords?: readonly string[];
  /** Temps courant (s) */
  time: number;
  /** Instant d'apparition du premier mot (même référentiel que time) */
  startAt: number;
  /** Intervalle entre mots (s) */
  interval?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  maxWidth?: number;
  lineHeight?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
};

/** Texte qui apparaît mot par mot (fondu + montée + flou), mots-clés en or */
export const AnimatedWords: React.FC<Props> = ({
  text,
  accentWords = [],
  time,
  startAt,
  interval = 0.12,
  fontSize = 64,
  fontWeight = 800,
  color = COLORS.text,
  maxWidth = 900,
  lineHeight = 1.15,
  letterSpacing = -0.5,
  style,
}) => {
  const words = splitWords(text);
  return (
    <div
      style={{
        fontFamily: displayFont,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        color,
        maxWidth,
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: fontSize * 0.26,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = springAt(time, startAt + i * interval);
        const accent = isAccent(w, accentWords);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [fontSize * 0.45, 0])}px)`,
              filter: `blur(${interpolate(p, [0, 1], [10, 0])}px)`,
              color: accent ? COLORS.accent : undefined,
              textShadow: accent
                ? `0 0 ${fontSize * 0.45}px rgba(245,184,65,0.45)`
                : '0 4px 24px rgba(0,0,0,0.45)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
