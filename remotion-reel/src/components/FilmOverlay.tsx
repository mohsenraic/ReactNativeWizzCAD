import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {FILM} from '../config';

const TILE = 256;

/** Tuile de bruit générée une seule fois (déterministe) */
const useNoiseTile = () =>
  useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = TILE;
    canvas.height = TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const img = ctx.createImageData(TILE, TILE);
    for (let i = 0; i < TILE * TILE; i++) {
      const v = Math.floor(random(`grain-${i}`) * 255);
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

/** Grain animé + vignette, posés sur toute la vidéo */
export const FilmOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const tile = useNoiseTile();
  // On décale la tuile à chaque frame pour un grain vivant
  const ox = Math.floor(random(`gx-${frame}`) * TILE);
  const oy = Math.floor(random(`gy-${frame}`) * TILE);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {tile ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${tile})`,
            backgroundSize: `${TILE}px ${TILE}px`,
            backgroundPosition: `${ox}px ${oy}px`,
            opacity: FILM.grainOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 45%, rgba(3,7,15,${FILM.vignetteStrength}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
