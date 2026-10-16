/**
 * <DocumentCard> — generic "report page", "news clipping", "policy brief" or "article" card with
 * our own text, key segments highlighted in yellow, delivered as a collage cutout.
 * Grey bars stand in for body copy so no real document is reproduced.
 *
 * Segments can carry an `id`; pass it in `hiddenIds` to fade that segment out (Scene 1 lifts
 * "−918,253" off the page and hands over to a <BigCounter> at the same spot).
 *
 * @example
 * <DocumentCard
 *   variant="report"
 *   kicker="VITAL STATISTICS · ANNUAL SUMMARY"
 *   title="Population dynamics, 2025"
 *   paragraphs={[
 *     'Final figures for Japanese nationals resident in Japan.',
 *     [{ text: 'Natural change: ' }, { text: '−918,253', highlight: true, id: 'num' }],
 *   ]}
 *   highlightAt={40}
 *   enterAt={0}
 *   style={{ left: 560, top: 80 }}
 * />
 */
import React from 'react';
import { Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Theme, useTheme } from '../theme';
import { Cutout, EnterFrom } from './Cutout';
import { Highlighter } from './Highlighter';
import { tornClipPath } from '../lib/sketch';
import { formatNumber } from '../lib/format';

export interface Segment {
  text: string;
  highlight?: boolean;
  id?: string;
  /** Override font size / weight for this segment (e.g. a big number). */
  style?: React.CSSProperties;
  /**
   * Count a number inside this segment: `{n}` in `text` animates from `from` to `to`, starting when the
   * segment's highlight sweeps (or at `at`). E.g. { text: '~{n}%', count: { to: 100 } }.
   */
  count?: { to: number; from?: number; decimals?: number; at?: number; duration?: number; sign?: 'auto' | 'always'; grouping?: boolean };
}
export type Paragraph = string | Segment[];

export type DocumentVariant = 'report' | 'clipping' | 'brief' | 'article' | 'paper';

const variants = (C: Theme['colors'], F: Theme['fonts']) => ({
  report: { bg: C.card, kickerColor: C.secondary, titleFont: F.body, titleWeight: 600, titleSize: 44 },
  clipping: { bg: '#F1EBDC', kickerColor: C.greyDark, titleFont: F.headline, titleWeight: 700, titleSize: 58 },
  brief: { bg: C.card, kickerColor: C.accent, titleFont: F.body, titleWeight: 600, titleSize: 40 },
  article: { bg: '#FFFFFF', kickerColor: C.secondary, titleFont: F.headline, titleWeight: 700, titleSize: 50 },
  /** Journal article: running header, serif-free academic title, author line in `meta`. */
  paper: { bg: '#FFFFFF', kickerColor: C.accent, titleFont: F.body, titleWeight: 600, titleSize: 38 },
});

const FillerLines: React.FC<{ count: number; seed: string; color?: string }> = ({ count, seed, color = '#D9D3C7' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0' }}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        style={{
          height: 11,
          borderRadius: 2,
          background: color,
          width: i === count - 1 ? `${40 + random(`${seed}-${i}`) * 30}%` : `${88 + random(`${seed}-${i}`) * 12}%`,
        }}
      />
    ))}
  </div>
);

export const DocumentCard: React.FC<{
  variant?: DocumentVariant;
  kicker?: string;
  title: string;
  meta?: string;
  paragraphs: Paragraph[];
  /** Frame highlights start sweeping (staggered per highlighted segment). */
  highlightAt?: number;
  hiddenIds?: string[];
  /** Frame the hidden segments fade out. */
  hideAt?: number;
  /** Grey filler lines inserted after each paragraph. */
  fillerPerParagraph?: number;
  width?: number;
  enterAt?: number;
  from?: EnterFrom;
  exitAt?: number;
  rotation?: number;
  seed?: string;
  style?: React.CSSProperties;
  /** Extra content after the paragraphs (e.g. a counting key number). */
  children?: React.ReactNode;
  /** Replaces the variant's running-header label ("STATISTICAL REPORT", "REGIONAL NEWS", "RESEARCH ARTICLE"). */
  header?: string;
}> = ({
  variant = 'report',
  kicker,
  title,
  meta,
  paragraphs,
  highlightAt = 30,
  hiddenIds = [],
  hideAt = 0,
  fillerPerParagraph = 2,
  width = 760,
  enterAt = 0,
  from = 'bottom',
  exitAt,
  rotation,
  seed = 'doc',
  style,
  children,
  header,
}) => {
  const frame = useCurrentFrame();
  const { colors: C, fonts: F } = useTheme();
  const v = variants(C, F)[variant];
  const hideOpacity = interpolate(frame, [hideAt, hideAt + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let hlIndex = 0;

  const renderParagraph = (p: Paragraph, pi: number) => {
    const segs: Segment[] = typeof p === 'string' ? [{ text: p }] : p;
    return (
      <p key={pi} style={{ margin: '0 0 6px', fontFamily: F.body, fontSize: 25, lineHeight: 1.5, color: C.inkSoft }}>
        {segs.map((s, si) => {
          const hidden = s.id && hiddenIds.includes(s.id);
          const at = s.highlight ? highlightAt + hlIndex++ * 16 : highlightAt;
          let text = s.text;
          if (s.count) {
            const c = s.count;
            const c0 = c.at ?? at;
            const val = interpolate(frame, [c0, c0 + (c.duration ?? 30)], [c.from ?? 0, c.to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            text = text.replace('{n}', formatNumber(val, { decimals: c.decimals ?? 0, sign: c.sign ?? 'auto', grouping: c.grouping ?? true }));
          }
          const content = (
            <span style={{ opacity: hidden ? hideOpacity : 1, color: s.highlight ? C.ink : undefined, fontWeight: s.highlight ? 600 : undefined, ...s.style }}>
              {text}
            </span>
          );
          if (!s.highlight) return <React.Fragment key={si}>{content}</React.Fragment>;
          return (
            <Highlighter key={si} at={at} seed={`${seed}-${pi}-${si}`}>
              {content}
            </Highlighter>
          );
        })}
      </p>
    );
  };

  return (
    <Cutout
      enterAt={enterAt}
      from={from}
      exitAt={exitAt}
      rotation={rotation}
      seed={seed}
      border={variant === 'clipping' ? 0 : 6}
      background={v.bg}
      style={style}
      innerStyle={{
        width,
        padding: variant === 'clipping' ? '44px 48px 52px' : '52px 56px 44px',
        clipPath: variant === 'clipping' ? tornClipPath(`${seed}-torn`, { edges: ['top', 'bottom', 'left', 'right'], depth: 1.2, teeth: 40 }) : undefined,
      }}
    >
      {variant === 'clipping' && (
        <div style={{ borderBottom: `3px double ${C.ink}`, paddingBottom: 10, marginBottom: 18, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 16, color: C.greyDark, letterSpacing: 2 }}>
          <span>{header ?? 'REGIONAL NEWS'}</span>
          <span>{meta ?? ''}</span>
        </div>
      )}
      {variant === 'brief' && <div style={{ height: 8, background: C.accent, margin: '-52px -56px 36px' }} />}
      {variant === 'report' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 15, color: C.grey, letterSpacing: 2, borderBottom: `1px solid ${C.greyLight}`, paddingBottom: 12, marginBottom: 26 }}>
          <span>{header ?? 'STATISTICAL REPORT'}</span>
          <span>{meta ?? ''}</span>
        </div>
      )}
      {variant === 'paper' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 15, color: C.greyDark, letterSpacing: 2, borderTop: `3px solid ${C.ink}`, borderBottom: `1px solid ${C.ink}`, padding: '10px 0', margin: '-20px 0 26px' }}>
          <span>{header ?? 'RESEARCH ARTICLE'}</span>
          <span>{meta ?? ''}</span>
        </div>
      )}
      {variant === 'article' && (
        <div style={{ height: 180, margin: '-52px -56px 30px', background: `repeating-linear-gradient(45deg, #E4DED2 0 10px, #EEE9DF 10px 20px)` }} />
      )}
      {kicker && (
        <div style={{ fontFamily: F.mono, fontSize: 17, letterSpacing: 2.5, color: v.kickerColor, marginBottom: 10, textTransform: 'uppercase' }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: v.titleFont, fontWeight: v.titleWeight, fontSize: v.titleSize, lineHeight: 1.12, color: C.ink, marginBottom: 18, textTransform: variant === 'clipping' || variant === 'article' ? 'uppercase' : 'none' }}>
        {title}
      </div>
      {paragraphs.map((p, i) => (
        <React.Fragment key={i}>
          {renderParagraph(p, i)}
          {fillerPerParagraph > 0 && <FillerLines count={fillerPerParagraph} seed={`${seed}-f${i}`} />}
        </React.Fragment>
      ))}
      {children}
      {variant === 'report' && (
        <div style={{ marginTop: 16, fontFamily: F.mono, fontSize: 14, color: C.grey, textAlign: 'right' }}>— 1 —</div>
      )}
    </Cutout>
  );
};
