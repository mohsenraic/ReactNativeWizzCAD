import React from 'react';
import {interpolate} from 'remotion';
import {COLORS, PLACE} from '../config';
import {bodyFont, displayFont} from '../lib/fonts';
import {springAt} from '../lib/time';

type Props = {
  x: number;
  y: number;
  /** Temps courant (s) */
  time: number;
  /** Instant de la chute */
  dropAt: number;
  /** Instant d'apparition de l'étiquette (null = pas d'étiquette) */
  labelAt?: number | null;
  /** Affiche les coordonnées sous le nom */
  showCoordinates?: boolean;
  scale?: number;
};

const DROP_HEIGHT = 340;
const RING_PERIOD = 1.8;

/** Pin doré (chute avec rebond) + ondes + étiquette. À placer dans un <svg>. */
export const Pin: React.FC<Props> = ({
  x,
  y,
  time,
  dropAt,
  labelAt = null,
  showCoordinates = true,
  scale = 1,
}) => {
  if (time < dropAt - 0.05) return null;
  const p = springAt(time, dropAt, {damping: 9, mass: 0.7, stiffness: 110});
  // |1-p| : chute puis petits rebonds vers le haut
  const lift = -DROP_HEIGHT * Math.abs(1 - p);
  const landed = time - dropAt > 0.25;
  // Écrasement au contact
  const impact = Math.max(0, 1 - Math.abs(1 - p) * 8);
  const squash = 1 - 0.12 * impact * Math.max(0, 1 - (time - dropAt) * 1.5);
  const opacity = interpolate(time, [dropAt - 0.05, dropAt + 0.1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rings = landed
    ? [0, 1, 2].map((k) => {
        const ph = (((time - dropAt - 0.25) / RING_PERIOD + k / 3) % 1 + 1) % 1;
        return {r: 8 + ph * 120, o: (1 - ph) * 0.75};
      })
    : [];
  const ringFade = interpolate(time, [dropAt + 0.2, dropAt + 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const label = labelAt === null ? 0 : springAt(time, labelAt);

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id="pinGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.accentSoft} />
          <stop offset="100%" stopColor="#D4911C" />
        </linearGradient>
        <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ondes */}
      {rings.map((r, i) => (
        <circle
          key={i}
          r={r.r}
          fill="none"
          stroke={COLORS.accent}
          strokeWidth={3}
          opacity={r.o * ringFade}
        />
      ))}

      {/* Ombre au sol */}
      <ellipse
        rx={interpolate(Math.min(p, 1), [0, 1], [6, 18])}
        ry={interpolate(Math.min(p, 1), [0, 1], [2, 6])}
        fill="#000"
        opacity={0.5 * Math.min(p, 1)}
      />
      <circle r={5} fill={COLORS.accent} />

      {/* Pin */}
      <g transform={`translate(0, ${lift}) scale(${1 / squash}, ${squash})`} filter="url(#pinGlow)">
        <path
          d="M0,0 C-7,-16 -28,-34 -28,-56 A28,28 0 1 1 28,-56 C28,-34 7,-16 0,0 Z"
          fill="url(#pinGold)"
        />
        <circle cy={-56} r={11} fill={COLORS.background} />
      </g>

      {/* Étiquette */}
      {label > 0 ? (
        <g
          transform={`translate(${interpolate(label, [0, 1], [90, 52])}, -78)`}
          opacity={label}
        >
          <rect
            x={0}
            y={-46}
            width={showCoordinates ? 400 : 360}
            height={showCoordinates ? 116 : 76}
            rx={20}
            fill="rgba(11,20,38,0.72)"
            stroke={COLORS.accent}
            strokeOpacity={0.55}
            strokeWidth={1.5}
          />
          <text x={24} y={4} fontFamily={displayFont} fontWeight={900} fontSize={42} letterSpacing={3} fill={COLORS.text}>
            {PLACE.name}
            <tspan fontWeight={500} fill={COLORS.textMuted} fontSize={34} letterSpacing={0}>
              {'  ·  '}
              {PLACE.country}
            </tspan>
          </text>
          {showCoordinates ? (
            <text x={24} y={50} fontFamily={bodyFont} fontWeight={600} fontSize={24} letterSpacing={2} fill={COLORS.accent}>
              {PLACE.coordinatesLabel}
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
