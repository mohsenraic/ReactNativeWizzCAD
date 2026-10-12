import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {COLORS, PHOTOS, SAFE_ZONE, SCENES, TOWERS, VIDEO, WINTER} from '../config';
import {AnimatedWords} from '../components/AnimatedWords';
import {Landscape} from '../components/Landscape';
import {PhotoPanel} from '../components/PhotoPanel';
import {Snow} from '../components/Snow';
import {progress, useSceneTime} from '../lib/time';

const PHOTO_FADE = 0.6;

/**
 * Scènes 5 & 6 — Tours puis hiver.
 * Les tours illustrées s'élèvent, puis laissent place à la vraie photo du
 * village ; l'hiver refroidit la photo de la vallée sous la neige.
 * Sans photos (PHOTOS.towers / PHOTOS.winter = null), le décor illustré
 * est conservé et passe lui-même à l'hiver.
 */
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

  const towersPhoto = PHOTOS.towers;
  const winterPhoto = PHOTOS.winter;
  const towersPhotoIn = towersPhoto ? progress(abs, towersPhoto.at, towersPhoto.at + PHOTO_FADE) : 0;
  const winterPhotoIn = winterPhoto ? progress(abs, winterStart - 0.35, winterStart - 0.35 + PHOTO_FADE) : 0;
  // Le décor illustré n'est plus visible une fois recouvert par une photo
  const landscapeVisible = Math.max(towersPhotoIn, winterPhotoIn) < 1;

  return (
    <AbsoluteFill>
      {landscapeVisible ? (
        <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `50% ${(TOWERS.groundY / VIDEO.height) * 100}%`}}>
          <Landscape time={t} winter={winterPhoto ? 0 : winter} />
        </AbsoluteFill>
      ) : null}

      {towersPhoto && towersPhotoIn > 0 && winterPhotoIn < 1 ? (
        <AbsoluteFill style={{opacity: towersPhotoIn}}>
          <PhotoPanel
            src={towersPhoto.src}
            kenBurns={towersPhoto.kenBurns}
            progress={progress(abs, towersPhoto.at, winterPhoto ? winterStart : SCENES.winter.end, (x) => x)}
            winter={winterPhoto ? 0 : winter}
          />
        </AbsoluteFill>
      ) : null}

      {winterPhoto && winterPhotoIn > 0 ? (
        <AbsoluteFill style={{opacity: winterPhotoIn}}>
          <PhotoPanel
            src={winterPhoto.src}
            kenBurns={winterPhoto.kenBurns}
            progress={progress(abs, winterStart - 0.35, SCENES.winter.end + 0.3, (x) => x)}
            winter={winter}
          />
        </AbsoluteFill>
      ) : null}

      {/* Refroidissement global du décor illustré (les photos ont leur propre étalonnage) */}
      {!towersPhoto && !winterPhoto ? (
        <AbsoluteFill style={{background: WINTER.tint, mixBlendMode: 'color', opacity: winter * WINTER.tintOpacity}} />
      ) : null}
      {/* Givre sur les bords */}
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
