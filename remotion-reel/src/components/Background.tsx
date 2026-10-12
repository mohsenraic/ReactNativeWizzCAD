import React, {useMemo} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {COLORS, VIDEO} from '../config';

type Props = {
  /** Affiche un léger champ d'étoiles */
  stars?: boolean;
  /** Temps (s) pour le scintillement */
  time?: number;
  /** Position verticale du halo central (px) */
  glowY?: number;
};

/** Fond bleu nuit avec halo central et étoiles discrètes */
export const Background: React.FC<Props> = ({stars = false, time = 0, glowY = 820}) => {
  const starList = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => ({
        x: random(`star-x-${i}`) * VIDEO.width,
        y: random(`star-y-${i}`) * VIDEO.height * 0.75,
        r: 0.6 + random(`star-r-${i}`) * 1.6,
        phase: random(`star-p-${i}`) * Math.PI * 2,
        speed: 0.6 + random(`star-s-${i}`) * 1.4,
      })),
    [],
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 85% 55% at 50% ${(glowY / VIDEO.height) * 100}%, ${COLORS.backgroundLight} 0%, ${COLORS.background} 70%)`,
      }}
    >
      {stars ? (
        <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute'}}>
          {starList.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#DCE8FF"
              opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase))}
            />
          ))}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
