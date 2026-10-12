import React, {useMemo} from 'react';
import {random} from 'remotion';
import {COLORS, VIDEO} from '../config';

type Props = {
  count: number;
  /** Temps écoulé depuis le début de la neige (s) */
  time: number;
  /** 0 -> 1 : densité visible */
  intensity: number;
};

/** Neige déterministe en 3 plans de profondeur */
export const Snow: React.FC<Props> = ({count, time, intensity}) => {
  const flakes = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const depth = random(`snow-d-${i}`); // 0 = loin, 1 = proche
        return {
          x: random(`snow-x-${i}`) * (VIDEO.width + 200) - 100,
          y: random(`snow-y-${i}`) * VIDEO.height,
          r: 1.5 + depth * depth * 7,
          speed: 70 + depth * 230,
          sway: 10 + random(`snow-s-${i}`) * 35,
          freq: 0.4 + random(`snow-f-${i}`) * 0.9,
          phase: random(`snow-p-${i}`) * Math.PI * 2,
          alpha: 0.35 + depth * 0.6,
          blur: depth > 0.85,
          threshold: random(`snow-t-${i}`),
        };
      }),
    [count],
  );

  const span = VIDEO.height + 40;
  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="flakeBlur">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      {flakes.map((f, i) => {
        if (f.threshold > intensity) return null;
        const y = ((f.y + f.speed * time) % span) - 20;
        const x = f.x + Math.sin(time * f.freq + f.phase) * f.sway + time * 18;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={f.r}
            fill={COLORS.snow}
            opacity={f.alpha}
            filter={f.blur ? 'url(#flakeBlur)' : undefined}
          />
        );
      })}
    </svg>
  );
};
