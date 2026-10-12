import React, {useMemo} from 'react';
import {interpolate, interpolateColors, random} from 'remotion';
import {COLORS, Tower, TOWERS, VIDEO} from '../config';
import {springAt} from '../lib/time';

/** Crête montagneuse géométrique (pics anguleux) */
const ridge = (seed: string, baseY: number, amplitude: number, peaks: number) => {
  const pts: [number, number][] = [[-40, baseY]];
  const step = (VIDEO.width + 80) / peaks;
  for (let i = 0; i <= peaks; i++) {
    const x = -40 + i * step;
    const h = amplitude * (0.45 + 0.55 * random(`${seed}-${i}`));
    pts.push([x - step / 2 + random(`${seed}-dx-${i}`) * step * 0.4, baseY - h]);
    pts.push([x, baseY - h * 0.35 * random(`${seed}-v-${i}`)]);
  }
  pts.push([VIDEO.width + 40, baseY]);
  return pts;
};

const toPath = (pts: [number, number][], bottom: number) =>
  `M ${pts.map((p) => p.join(' ')).join(' L ')} L ${VIDEO.width + 40} ${bottom} L -40 ${bottom} Z`;

/** Neige : partie haute d'une crête (au-dessus d'un seuil) */
const capPath = (pts: [number, number][], threshold: number) => {
  let d = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const prev = pts[i - 1];
    const next = pts[i + 1];
    if (y < threshold && prev[1] > y && next[1] > y) {
      const k = 0.28;
      d += `M ${x} ${y} L ${x + (prev[0] - x) * k} ${y + (prev[1] - y) * k} L ${x + (next[0] - x) * k * 0.5} ${y + (next[1] - y) * k * 0.6} L ${x + (next[0] - x) * k} ${y + (next[1] - y) * k} Z `;
    }
  }
  return d;
};

type LandscapeProps = {
  /** Temps (s) relatif au début de la scène des tours */
  time: number;
  /** 0 -> 1 : passage à l'hiver */
  winter: number;
};

/** Montagnes en couches + tours de pierre qui s'élèvent du sol */
export const Landscape: React.FC<LandscapeProps> = ({time, winter}) => {
  const groundY = TOWERS.groundY;
  const layers = useMemo(
    () => [
      {pts: ridge('far', groundY - 120, 420, 7), color: COLORS.mountainFar, winterColor: '#5D7FAB', drift: 6},
      {pts: ridge('mid', groundY - 40, 300, 6), color: COLORS.mountainMid, winterColor: '#3E5C86', drift: 12},
      {pts: ridge('near', groundY + 10, 170, 9), color: COLORS.mountainNear, winterColor: '#2F4A70', drift: 20},
    ],
    [groundY],
  );

  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.background} />
          <stop offset="60%" stopColor={interpolateColors(winter, [0, 1], ['#14264A', '#29466F'])} />
          <stop offset="100%" stopColor={COLORS.background} />
        </linearGradient>
        <radialGradient id="moonHalo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE9B8" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#FFE9B8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="moonDisc" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFF8E6" />
          <stop offset="100%" stopColor="#E9D3A6" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={interpolateColors(winter, [0, 1], ['#16233D', '#3B577F'])} />
          <stop offset="100%" stopColor={COLORS.background} />
        </linearGradient>
        <clipPath id="aboveGround">
          <rect x={0} y={0} width={VIDEO.width} height={groundY} />
        </clipPath>
      </defs>

      <rect width={VIDEO.width} height={VIDEO.height} fill="url(#sky)" />
      <circle cx={820} cy={700} r={220} fill="url(#moonHalo)" />
      <circle cx={820} cy={700} r={46} fill="url(#moonDisc)" opacity={0.9} />

      {layers.map((l, i) => (
        <g key={i} transform={`translate(${-time * l.drift}, 0)`}>
          <path
            d={toPath(l.pts, groundY + 60)}
            fill={interpolateColors(winter, [0, 1], [l.color, l.winterColor])}
            stroke={COLORS.border}
            strokeOpacity={0.18 + 0.1 * i}
            strokeWidth={1.2}
          />
          <path d={capPath(l.pts, groundY - 140)} fill={COLORS.snow} opacity={winter * (0.85 - i * 0.2)} />
        </g>
      ))}

      {/* Sol */}
      <rect x={0} y={groundY} width={VIDEO.width} height={VIDEO.height - groundY} fill="url(#ground)" />
      <rect x={0} y={groundY - 2} width={VIDEO.width} height={10} fill={COLORS.snow} opacity={winter * 0.75} />
      <line x1={0} x2={VIDEO.width} y1={groundY} y2={groundY} stroke={COLORS.border} strokeOpacity={0.45} strokeWidth={1.5} />

      {/* Maisons basses entre les tours */}
      <g clipPath="url(#aboveGround)">
        {TOWERS.towers.slice(0, -1).map((tw, i) => {
          const next = TOWERS.towers[i + 1];
          const x = ((tw.x + next.x) / 2) * VIDEO.width;
          const p = springAt(time, TOWERS.firstDelay + (i + 0.6) * TOWERS.stagger);
          return (
            <House key={i} x={x} y={groundY + (1 - p) * 120} winter={winter} w={70 + (i % 2) * 20} h={56 + (i % 3) * 12} />
          );
        })}
        {TOWERS.towers.map((tw, i) => {
          const at = TOWERS.firstDelay + i * TOWERS.stagger;
          const p = springAt(time, at, {damping: 20, mass: 1, stiffness: 70});
          const dust = interpolate(time - at, [0, 0.3, 1.2], [0, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <g key={i}>
              <ellipse
                cx={tw.x * VIDEO.width}
                cy={groundY}
                rx={tw.width * 1.3}
                ry={10}
                fill={COLORS.accent}
                opacity={0.35 * dust}
              />
              <StoneTower tower={tw} groundY={groundY} offset={(1 - p) * (tw.height + 60)} winter={winter} time={time} index={i} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const House: React.FC<{x: number; y: number; w: number; h: number; winter: number}> = ({x, y, w, h, winter}) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d={`M ${-w / 2} 0 L ${-w / 2} ${-h} L ${w / 2} ${-h - 14} L ${w / 2} 0 Z`} fill={COLORS.stone} stroke={COLORS.border} strokeOpacity={0.3} />
    <path d={`M ${-w / 2 - 4} ${-h} L ${w / 2 + 4} ${-h - 15} L ${w / 2 + 4} ${-h - 21} L ${-w / 2 - 4} ${-h - 6} Z`} fill={COLORS.snow} opacity={winter * 0.9} />
    <rect x={-8} y={-h * 0.55} width={12} height={16} fill={COLORS.accent} opacity={0.55} />
  </g>
);

/** Tour svane stylisée : fût légèrement conique, couronne, toit à pente unique, meurtrières */
const StoneTower: React.FC<{
  tower: Tower;
  groundY: number;
  offset: number;
  winter: number;
  time: number;
  index: number;
}> = ({tower, groundY, offset, winter, time, index}) => {
  const w = tower.width;
  const h = tower.height;
  const wt = w * 0.82;
  const roofH = w * 0.42;
  const hb = h - roofH - 14;
  const x = tower.x * VIDEO.width;
  const id = `tw-${index}`;
  const flicker = 0.45 + 0.15 * Math.sin(time * 3 + index * 1.7);

  return (
    <g transform={`translate(${x}, ${groundY + offset})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={interpolateColors(winter, [0, 1], [COLORS.stoneLight, '#4C6A94'])} />
          <stop offset="55%" stopColor={COLORS.stone} />
          <stop offset="100%" stopColor="#111C31" />
        </linearGradient>
      </defs>
      {/* Fût */}
      <path
        d={`M ${-w / 2} 0 L ${-wt / 2} ${-hb} L ${wt / 2} ${-hb} L ${w / 2} 0 Z`}
        fill={`url(#${id})`}
        stroke={COLORS.border}
        strokeOpacity={0.4}
        strokeWidth={1.4}
      />
      {/* Assises de pierre */}
      {[0.25, 0.5, 0.75].map((k) => (
        <line
          key={k}
          x1={-w / 2 + (w - wt) / 2 * k + 4}
          x2={w / 2 - (w - wt) / 2 * k - 4}
          y1={-hb * k}
          y2={-hb * k}
          stroke={COLORS.border}
          strokeOpacity={0.12}
        />
      ))}
      {/* Couronne (mâchicoulis) */}
      <rect x={-wt / 2 - 7} y={-hb - 14} width={wt + 14} height={14} fill={COLORS.stoneLight} stroke={COLORS.border} strokeOpacity={0.45} />
      {[-0.3, 0, 0.3].map((k) => (
        <rect key={k} x={k * wt - 6} y={-hb + 20} width={12} height={22} rx={6} fill={COLORS.accent} opacity={flicker} />
      ))}
      {/* Meurtrière */}
      <rect x={-3} y={-hb * 0.55} width={6} height={30} fill="#0A1222" />
      {/* Toit à pente unique */}
      <path
        d={`M ${-wt / 2 - 10} ${-hb - 14} L ${wt / 2 + 10} ${-hb - 14} L ${wt / 2 + 10} ${-hb - 14 - roofH * 0.35} L ${-wt / 2 - 10} ${-hb - 14 - roofH} Z`}
        fill="#2A3D60"
        stroke={COLORS.borderHighlight}
        strokeOpacity={0.5}
        strokeWidth={1.4}
      />
      {/* Neige sur le toit */}
      <path
        d={`M ${-wt / 2 - 12} ${-hb - 14 - roofH - 2} L ${wt / 2 + 12} ${-hb - 14 - roofH * 0.35 - 2} L ${wt / 2 + 12} ${-hb - 14 - roofH * 0.35 + 8} L ${-wt / 2 - 12} ${-hb - 14 - roofH + 8} Z`}
        fill={COLORS.snow}
        opacity={winter * 0.95}
      />
    </g>
  );
};
