import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {DATA} from '../data';
import {HEIGHT, MAP_CENTER_Y, WIDTH} from '../lib/constants';
import {FONT, W_EXTRABOLD, W_SEMIBOLD} from '../lib/fonts';
import {POP, progress, springAt} from '../lib/anim';
import type {Timeline} from '../lib/timeline';
import {FactIconSvg} from './Icons';

const theme = DATA.theme;

// ---------------------------------------------------------------------------
// HookTitle — word by word with a slight zoom and drop shadow
// ---------------------------------------------------------------------------
export const HookTitle: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  const words = DATA.hook.text.split(/\s+/);
  const out = 1 - progress(time, tl.hookEnd - 0.25, tl.hookEnd + 0.1);
  if (out <= 0) return null;
  const push = interpolate(time, [0, tl.hookEnd], [1, 1.06], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, paddingBottom: 220}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 30,
          maxWidth: 960,
          transform: `scale(${push})`,
          fontFamily: FONT,
          fontWeight: W_EXTRABOLD,
          fontSize: 124,
          lineHeight: 1.05,
          letterSpacing: -2,
          textAlign: 'center',
        }}
      >
        {words.map((w, i) => {
          const s = springAt(time, 0.08 + i * 0.13, POP);
          const accent = DATA.hook.accentWords.includes(w);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: accent ? theme.sand : theme.white,
                opacity: Math.min(1, s * 1.5),
                transform: `scale(${interpolate(s, [0, 1], [1.6, 1])})`,
                textShadow: '0 8px 30px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.5)',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// LocationPin — drops with a bounce on the place, pulse, then label
// ---------------------------------------------------------------------------
export const LocationPin: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  if (time < tl.pinDrop - 0.05 || time > tl.pinOut + 0.4) return null;
  const p = springAt(time, tl.pinDrop, {damping: 9, stiffness: 120, mass: 0.7});
  const lift = -380 * Math.abs(1 - p);
  const fadeOut = 1 - progress(time, tl.pinOut - 0.1, tl.pinOut + 0.3);
  const label = springAt(time, tl.pinLand + 0.05, POP);
  const landed = time > tl.pinLand;
  const rings = [0, 1, 2].map((k) => {
    const ph = ((((time - tl.pinLand) / 1.3 + k / 3) % 1) + 1) % 1;
    return {r: 10 + ph * 140, o: landed ? (1 - ph) * 0.8 : 0};
  });
  const x = WIDTH / 2;
  const y = MAP_CENTER_Y;
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute'}}>
        {rings.map((r, i) => (
          <ellipse key={i} cx={x} cy={y} rx={r.r} ry={r.r * 0.55} fill="none" stroke={theme.turquoise} strokeWidth={4} opacity={r.o} />
        ))}
        <ellipse cx={x} cy={y} rx={20 * Math.min(1, p)} ry={7 * Math.min(1, p)} fill="#000" opacity={0.35} />
        <g transform={`translate(${x}, ${y + lift})`}>
          <path
            d="M0,0 C-8,-18 -32,-38 -32,-64 A32,32 0 1 1 32,-64 C32,-38 8,-18 0,0 Z"
            fill={theme.sand}
            stroke={theme.navy}
            strokeWidth={5}
          />
          <circle cy={-64} r={12} fill={theme.navy} />
        </g>
      </svg>
      {label > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y + 40,
            display: 'flex',
            justifyContent: 'center',
            opacity: Math.min(1, label * 1.4),
            transform: `translateY(${interpolate(label, [0, 1], [30, 0])}px) scale(${interpolate(label, [0, 1], [0.7, 1])})`,
          }}
        >
          <div
            style={{
              padding: '18px 36px',
              borderRadius: 999,
              background: 'rgba(10,26,47,0.55)',
              backdropFilter: 'blur(14px)',
              border: '2px solid rgba(255,255,255,0.35)',
              fontFamily: FONT,
              fontWeight: W_EXTRABOLD,
              fontSize: 52,
              letterSpacing: 2,
              color: theme.white,
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
            }}
          >
            {DATA.pinLabel} {DATA.place.flag}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// FactCard — glassmorphism card at the bottom of the screen
// ---------------------------------------------------------------------------
export const FactCards: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => (
  <>
    {tl.facts.map((f) => {
      if (time < f.start - 0.1 || time > f.end + 0.3) return null;
      const inP = springAt(time, f.start, {damping: 16, stiffness: 120, mass: 0.8});
      const outP = progress(time, f.end - 0.2, f.end + 0.15);
      const icon = springAt(time, f.start + 0.15, POP);
      return (
        <div
          key={f.index}
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            bottom: DATA.layout.safeBottom + 50,
            opacity: Math.min(inP * 1.3, 1) * (1 - outP),
            transform: `translateY(${interpolate(inP, [0, 1], [120, 0]) + outP * 40}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              padding: '30px 36px',
              borderRadius: 40,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
              backdropFilter: 'blur(22px) saturate(1.3)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              boxShadow: '0 30px 60px rgba(10,26,47,0.4)',
            }}
          >
            <div
              style={{
                width: 116,
                height: 116,
                flexShrink: 0,
                borderRadius: 32,
                background: theme.turquoise,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 10px 30px ${theme.turquoise}77`,
                transform: `scale(${interpolate(icon, [0, 1], [0.4, 1])}) rotate(${interpolate(icon, [0, 1], [-25, 0])}deg)`,
              }}
            >
              <FactIconSvg icon={f.icon} size={72} color={theme.white} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0}}>
              <span
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 18px',
                  borderRadius: 999,
                  background: theme.sand,
                  color: theme.navy,
                  fontFamily: FONT,
                  fontWeight: W_EXTRABOLD,
                  fontSize: 26,
                  letterSpacing: 3,
                }}
              >
                FACT #{f.index}
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: W_EXTRABOLD,
                  fontSize: 50,
                  lineHeight: 1.08,
                  color: theme.white,
                  textShadow: '0 3px 14px rgba(0,0,0,0.35)',
                }}
              >
                {f.title}
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </>
);

// ---------------------------------------------------------------------------
// Captions — 2 to 4 words, active word highlighted in sand
// ---------------------------------------------------------------------------
export const Captions: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  if (time < tl.hookEnd) return null; // the hook title already shows the line
  const chunk = tl.captions.find((c) => time >= c.start && time < c.end);
  if (!chunk) return null;
  const enter = springAt(time, chunk.start, {damping: 15, stiffness: 180, mass: 0.6});
  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top: DATA.layout.captionsY,
        transform: `translateY(-50%) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        opacity: Math.min(1, enter * 1.5),
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 6,
        rowGap: 6,
        fontFamily: FONT,
        fontWeight: W_SEMIBOLD,
        fontSize: 62,
        lineHeight: 1.1,
      }}
    >
      {chunk.words.map((w, i) => {
        const active = time >= w.start && (i === chunk.words.length - 1 || time < chunk.words[i + 1].start);
        const pop = springAt(time, w.start, POP);
        return (
          <span
            key={`${chunk.start}-${i}`}
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 16,
              background: active ? theme.sand : 'transparent',
              color: active ? theme.navy : theme.white,
              transform: active ? `scale(${interpolate(pop, [0, 1], [0.9, 1.04])})` : undefined,
              textShadow: active ? 'none' : '0 3px 12px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.6)',
              boxShadow: active ? '0 8px 24px rgba(0,0,0,0.3)' : undefined,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// EndCard — back on a beautiful photo, bouncing question
// ---------------------------------------------------------------------------
export const EndCardText: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  if (time < tl.endCardStart) return null;
  const s = springAt(time, tl.endCardStart + 0.1, {damping: 8, stiffness: 140, mass: 0.8});
  const sub = springAt(time, tl.endCardStart + 0.35);
  const [main, ...rest] = DATA.endCard.text.split(/\s(?=\S+$)/u); // last token (emoji) bounces on its own
  const bob = Math.sin((time - tl.endCardStart) * 7) * 14;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 300}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: W_EXTRABOLD,
          fontSize: 40,
          letterSpacing: 6,
          color: theme.sand,
          opacity: sub,
          marginBottom: 24,
          textShadow: '0 3px 14px rgba(0,0,0,0.5)',
        }}
      >
        {DATA.pinLabel} {DATA.place.flag}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: W_EXTRABOLD,
          fontSize: 124,
          lineHeight: 1.05,
          color: theme.white,
          textAlign: 'center',
          letterSpacing: -2,
          transform: `scale(${s})`,
          textShadow: '0 10px 40px rgba(0,0,0,0.55)',
        }}
      >
        {main}{' '}
        {rest.length ? <span style={{display: 'inline-block', transform: `translateY(${bob}px)`}}>{rest.join(' ')}</span> : null}
      </div>
    </AbsoluteFill>
  );
};
