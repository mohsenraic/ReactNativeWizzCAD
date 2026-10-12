import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {COLORS, SAFE_ZONE, SCENES, TOWERS, VIDEO, WINTER} from '../config';
import {AnimatedWords} from '../components/AnimatedWords';
import {Landscape} from '../components/Landscape';
import {Snow} from '../components/Snow';
import {progress, useSceneTime} from '../lib/time';

/** Scènes 5 & 6 — Tours médiévales puis hiver (même décor, continuité visuelle) */
export const VillageScene: React.FC = () => {
  const {t, abs} = useSceneTime();
  const winterStart = SCENES.winter.start;
  const winter = progress(abs, winterStart - 0.2, winterStart - 0.2 + WINTER.coolDownDuration);
  const snowIntensity = progress(abs, winterStart - 0.4, winterStart + 1.2);
  const totalDuration = SCENES.winter.end - SCENES.towers.start;
  const push = interpolate(t, [0, totalDuration], [1, 1.07], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const towersTitleOut = 1 - progress(abs, winterStart - 0.45, winterStart - 0.05);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `50% ${(TOWERS.groundY / VIDEO.height) * 100}%`}}>
        <Landscape time={t} winter={winter} />
      </AbsoluteFill>

      {/* Refroidissement : teinte glacée + givre sur les bords */}
      <AbsoluteFill style={{background: WINTER.tint, mixBlendMode: 'color', opacity: winter * WINTER.tintOpacity}} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,255,255,0) 55%, ${COLORS.ice} 130%)`,
          opacity: winter * 0.55,
        }}
      />

      {snowIntensity > 0 ? <Snow count={WINTER.snowflakes} time={abs - winterStart + 2} intensity={snowIntensity} /> : null}

      {/* Titres */}
      <AbsoluteFill style={{top: SAFE_ZONE.top + 70, alignItems: 'center'}}>
        {towersTitleOut > 0 ? (
          <div style={{opacity: towersTitleOut, position: 'absolute'}}>
            <AnimatedWords text={TOWERS.title} accentWords={TOWERS.accentWords} time={t} startAt={0.2} interval={0.14} fontSize={76} fontWeight={900} maxWidth={900} />
          </div>
        ) : null}
        {abs > winterStart - 0.1 ? (
          <div style={{position: 'absolute'}}>
            <AnimatedWords
              text={WINTER.title}
              accentWords={WINTER.accentWords}
              time={abs}
              startAt={winterStart + 0.05}
              interval={0.13}
              fontSize={76}
              fontWeight={900}
              maxWidth={900}
            />
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
