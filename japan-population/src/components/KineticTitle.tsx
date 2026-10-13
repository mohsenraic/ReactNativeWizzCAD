/**
 * <KineticTitle> — uppercase Oswald headline whose words pop up one by one with a spring,
 * optional yellow marker on chosen words, optional paper-strip backing.
 *
 * @example
 * <KineticTitle text="Can Japan shrink well?" highlight={['shrink', 'well?']} at={10} strip />
 * <KineticTitle text="2.1" fontSize={360} strip at={0} />
 */
import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, SPRINGS, Tone, toneColors } from '../theme';
import { Highlighter } from './Highlighter';
import { jitter, tornClipPath } from '../lib/sketch';

export const KineticTitle: React.FC<{
  text: string;
  at?: number;
  /** Frames between words. */
  stagger?: number;
  /** Words (case-insensitive, punctuation included) to sweep with the highlighter. */
  highlight?: string[];
  fontSize?: number;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
  /** Put the title on a torn paper strip. */
  strip?: boolean;
  uppercase?: boolean;
  seed?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  at = 0,
  stagger = 4,
  highlight = [],
  fontSize = 120,
  tone = 'light',
  color,
  align = 'center',
  maxWidth = 1500,
  strip = false,
  uppercase = true,
  seed = 'title',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const hl = highlight.map((w) => w.toLowerCase());
  const fg = color ?? (strip ? COLORS.ink : toneColors(tone).fg);
  const lastWordAt = at + (words.length - 1) * stagger;

  const stripSpring = spring({ frame: frame - (at - 6), fps, config: SPRINGS.snappy });

  const content = (
    <div
      style={{
        fontFamily: FONTS.headline,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.04,
        color: fg,
        textAlign: align,
        textTransform: uppercase ? 'uppercase' : 'none',
        maxWidth,
        letterSpacing: fontSize * 0.005,
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - (at + i * stagger), fps, config: SPRINGS.cutout });
        const isHl = hl.includes(w.toLowerCase());
        const word = (
          <span
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - s) * fontSize * 0.5}px) rotate(${(1 - s) * jitter(`${seed}-${i}`, 8)}deg)`,
              opacity: Math.min(1, s * 1.8),
            }}
          >
            {isHl ? (
              <Highlighter at={lastWordAt + 8 + i * 2} seed={`${seed}-hl-${i}`}>
                {w}
              </Highlighter>
            ) : (
              w
            )}
          </span>
        );
        return (
          <React.Fragment key={i}>
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );

  if (!strip) return <div style={style}>{content}</div>;

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `translateX(${(1 - stripSpring) * -120}px) rotate(${jitter(`${seed}-strip`, 1.6)}deg)`,
        opacity: Math.min(1, stripSpring * 2),
        filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.25))',
        ...style,
      }}
    >
      <div
        style={{
          background: '#F7F3EA',
          padding: `${fontSize * 0.16}px ${fontSize * 0.4}px`,
          clipPath: tornClipPath(`${seed}-torn`, { edges: ['left', 'right'], depth: 1.4 }),
        }}
      >
        {content}
      </div>
    </div>
  );
};
