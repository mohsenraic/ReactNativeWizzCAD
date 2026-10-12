import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {COLORS, CTA, MAP, PLACE, SAFE_ZONE, VIDEO} from '../config';
import {AnimatedWords} from '../components/AnimatedWords';
import {Background} from '../components/Background';
import {Pin} from '../components/Pin';
import {WorldMap} from '../components/WorldMap';
import {bodyFont, displayFont} from '../lib/fonts';
import {lerpCamera} from '../lib/geo';
import {POP_SPRING, progress, springAt, useSceneTime} from '../lib/time';

/** Scène 7 — Retour carte + question + bouton d'abonnement */
export const CtaScene: React.FC = () => {
  const {t} = useSceneTime();
  const camera = lerpCamera(MAP.camera.ctaFrom, MAP.camera.cta, progress(t, -0.2, 1.6));

  const btn = springAt(t, CTA.buttonAt, POP_SPRING);
  const press = interpolate(t - CTA.tapAt, [0, 0.08, 0.3], [1, 0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ripple = progress(t, CTA.tapAt, CTA.tapAt + 0.7, (x) => 1 - (1 - x) ** 3);
  const tapped = t >= CTA.tapAt;
  const shimmer = ((t - CTA.buttonAt - 0.4) % 1.8) / 1.8;
  const bell = tapped ? Math.sin((t - CTA.tapAt) * 28) * 18 * Math.max(0, 1 - (t - CTA.tapAt) * 1.6) : 0;
  const glow = 0.5 + 0.5 * Math.sin(t * 3);

  return (
    <AbsoluteFill>
      <Background glowY={MAP.centerY} />
      <WorldMap camera={camera} highlight={1} atmosphere={0}>
        {(projection) => {
          const pt = projection([PLACE.lon, PLACE.lat]);
          return pt ? <Pin x={pt[0]} y={pt[1]} time={t + 10} dropAt={10} labelAt={null} /> : null;
        }}
      </WorldMap>
      {/* Assombrit légèrement la carte sous les textes */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(11,20,38,0.85) 10%, rgba(11,20,38,0) 32%, rgba(11,20,38,0) 58%, rgba(11,20,38,0.9) 80%)`,
        }}
      />

      <AbsoluteFill style={{top: SAFE_ZONE.top + 60, alignItems: 'center'}}>
        <AnimatedWords text={CTA.question} accentWords={[]} time={t} startAt={CTA.questionAt} interval={0.14} fontSize={92} fontWeight={900} />
      </AbsoluteFill>

      {/* Bouton */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: VIDEO.height - SAFE_ZONE.bottom - 190,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, btn * 1.5),
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            transform: `scale(${interpolate(btn, [0, 1], [0.6, 1]) * press})`,
            background: `linear-gradient(135deg, ${COLORS.accentSoft}, ${COLORS.accent} 55%, #D9951F)`,
            borderRadius: 999,
            padding: '26px 64px 26px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            boxShadow: `0 0 ${40 + 30 * glow}px rgba(245,184,65,${0.35 + 0.2 * glow}), 0 18px 40px rgba(0,0,0,0.45)`,
          }}
        >
          <svg width={64} height={64} viewBox="-32 -32 64 64" style={{transform: `rotate(${bell}deg)`}}>
            <circle r={30} fill={COLORS.background} />
            <path
              d="M0,-17 C-9,-17 -12,-10 -12,-3 L-12,5 L-16,10 L16,10 L12,5 L12,-3 C12,-10 9,-17 0,-17 Z M-5,13 A5,5 0 0 0 5,13 Z"
              fill={COLORS.accent}
            />
          </svg>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontFamily: displayFont, fontWeight: 900, fontSize: 54, color: COLORS.background, letterSpacing: -0.5, lineHeight: 1}}>
              {CTA.buttonLabel}
            </span>
            <span style={{fontFamily: bodyFont, fontWeight: 700, fontSize: 30, color: '#3A2A08', marginTop: 8, lineHeight: 1}}>
              {CTA.buttonSub}
            </span>
          </div>
          {/* Reflet qui balaie le bouton */}
          {t > CTA.buttonAt + 0.4 ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 120,
                left: `${interpolate(shimmer, [0, 0.5, 1], [-30, 130, 130])}%`,
                background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)',
                transform: 'skewX(-20deg)',
              }}
            />
          ) : null}
          {/* Onde du « clic » */}
          {tapped ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 700 * ripple,
                height: 700 * ripple,
                marginLeft: -350 * ripple,
                marginTop: -350 * ripple,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.45)',
                opacity: 1 - ripple,
              }}
            />
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
