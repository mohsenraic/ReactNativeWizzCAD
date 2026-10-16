/**
 * silkIcons.tsx — small ink-and-colour SVG icons for the Silk Road: goods carried along the routes and the
 * caravanserais where caravans stopped. Drawn centred on (0, 0) at ~`size` px so they can ride a <RouteMap> marker.
 *
 * @example
 * <svg><g transform="translate(200 120)"><SilkIcon name="silk" size={56} /></g></svg>
 */
import React from 'react';
import { PALETTE } from '../theme';

export type SilkIconName = 'silk' | 'spices' | 'paper' | 'glass' | 'horses' | 'caravanserai' | 'camel' | 'plane' | 'train' | 'padlock' | 'padlockOpen' | 'hotel' | 'guide' | 'crowd' | 'mapBlank';

const INK = PALETTE.ink;

/** Paper token behind each icon so it reads on any map. */
const Token: React.FC<{ size: number; children: React.ReactNode; bg?: string }> = ({ size, children, bg = '#FBFAF6' }) => (
  <g>
    <circle r={size * 0.56} fill={bg} stroke={INK} strokeWidth={size * 0.045} />
    <g transform={`scale(${size / 100})`}>{children}</g>
  </g>
);

const paths: Record<SilkIconName, React.ReactNode> = {
  // bolt of silk: rolled cloth with a loose ribbon
  silk: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={-34} y={-20} width={50} height={40} rx={6} fill={PALETTE.terracotta} stroke={INK} strokeWidth={4} />
      <ellipse cx={16} cy={0} rx={10} ry={20} fill={PALETTE.saffron} stroke={INK} strokeWidth={4} />
      <path d="M16 12 C 30 24, 36 6, 40 22" fill="none" stroke={PALETTE.terracotta} strokeWidth={7} />
      <path d="M-30 -8 H8 M-30 4 H8" stroke="#F2C9B8" strokeWidth={3} />
    </g>
  ),
  // spice sack, tied at the top, with a heap of spice
  spices: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-26 34 C -36 10, -26 -10, -12 -18 L 12 -18 C 26 -10, 36 10, 26 34 Z" fill="#C9A87A" stroke={INK} strokeWidth={4} />
      <path d="M-14 -18 C -10 -28, 10 -28, 14 -18" fill="none" stroke={INK} strokeWidth={4} />
      <path d="M-18 -16 C -6 -24, 6 -24, 18 -16" fill={PALETTE.terracotta} stroke={INK} strokeWidth={3} />
      <path d="M-12 -22 C -4 -34, 6 -34, 12 -22 Z" fill={PALETTE.saffron} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // paper scroll
  paper: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={-26} y={-30} width={52} height={60} rx={3} fill="#F7F3EA" stroke={INK} strokeWidth={4} />
      <rect x={-32} y={-34} width={64} height={10} rx={5} fill="#C9A87A" stroke={INK} strokeWidth={4} />
      <rect x={-32} y={24} width={64} height={10} rx={5} fill="#C9A87A" stroke={INK} strokeWidth={4} />
      <path d="M-16 -12 H16 M-16 0 H12 M-16 12 H16" stroke={PALETTE.greyDark} strokeWidth={3} />
    </g>
  ),
  // glass flask
  glass: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-8 -34 H8 V-14 C 26 -6, 30 22, 14 32 H-14 C -30 22, -26 -6, -8 -14 Z" fill={PALETTE.turquoiseLight} fillOpacity={0.85} stroke={INK} strokeWidth={4} />
      <path d="M-12 -34 H12" stroke={INK} strokeWidth={5} />
      <path d="M-14 8 C -12 -2, -6 -6, -2 -6" fill="none" stroke="#FFFFFF" strokeWidth={4} />
    </g>
  ),
  // horse head (Fergana horses)
  horses: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M-22 34 C -24 14, -18 0, -10 -10 C -14 -18, -12 -28, -4 -34 L 0 -24 C 10 -26, 22 -16, 30 -2 C 34 6, 30 12, 22 10 C 14 8, 8 4, 4 10 C 6 20, 8 28, 10 34 Z"
        fill={PALETTE.terracotta}
        stroke={INK}
        strokeWidth={4}
      />
      <path d="M-10 -10 C -16 -2, -20 10, -22 22" fill="none" stroke={INK} strokeWidth={6} />
      <circle cx={10} cy={-10} r={3} fill={INK} />
    </g>
  ),
  // caravanserai: walled courtyard with an arched portal and a small dome
  caravanserai: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={-38} y={-8} width={76} height={36} fill="#E8D7B5" stroke={INK} strokeWidth={4} />
      <rect x={-14} y={-26} width={28} height={54} fill="#E8D7B5" stroke={INK} strokeWidth={4} />
      <path d="M-8 28 V8 C -8 -2, 8 -2, 8 8 V28" fill={PALETTE.lapis} stroke={INK} strokeWidth={3} />
      <path d="M-30 -8 C -30 -22, -18 -22, -18 -8" fill={PALETTE.turquoise} stroke={INK} strokeWidth={3} />
      <path d="M-38 -8 h6 v-4 h6 v4 h6 M18 -8 h6 v-4 h6 v4 h8" fill="none" stroke={INK} strokeWidth={3} />
    </g>
  ),
  camel: (
    <g strokeLinejoin="round" strokeLinecap="round" fill="#C9A87A" stroke={INK} strokeWidth={4}>
      <path d="M-34 6 C -32 -10, -20 -18, -12 -8 C -6 -20, 6 -22, 12 -6 C 16 -10, 22 -10, 24 -16 C 26 -26, 34 -26, 36 -18 L 34 -12 C 30 -12, 28 -4, 26 6 C 22 12, 14 14, 8 12 L 8 32 M -2 12 L -2 32 M -26 10 L -28 32 M -18 12 L -16 32" />
    </g>
  ),
  plane: (
    <g strokeLinejoin="round" fill="#FBFAF6" stroke={INK} strokeWidth={4}>
      <path d="M36 0 C 36 -4, 30 -6, 22 -6 L -2 -6 L -18 -30 L -26 -30 L -16 -6 L -30 -6 L -36 -16 L -42 -16 L -38 0 L -42 16 L -36 16 L -30 6 L -16 6 L -26 30 L -18 30 L -2 6 L 22 6 C 30 6, 36 4, 36 0 Z" />
    </g>
  ),
  train: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-40 12 V-8 C -40 -16, -34 -18, -26 -18 H 20 C 34 -18, 42 -6, 44 12 Z" fill="#F7F3EA" stroke={INK} strokeWidth={4} />
      <path d="M-40 4 H 43" stroke={PALETTE.lapis} strokeWidth={5} />
      <path d="M-40 9 H 44" stroke={PALETTE.turquoise} strokeWidth={3} />
      <path d="M22 -14 C 30 -14, 36 -8, 38 -2 H 22 Z" fill={PALETTE.lapis} stroke={INK} strokeWidth={3} />
      <circle cx={-26} cy={16} r={5} fill={INK} />
      <circle cx={26} cy={16} r={5} fill={INK} />
    </g>
  ),
  padlock: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-18 -6 V-20 C -18 -40, 18 -40, 18 -20 V-6" fill="none" stroke={INK} strokeWidth={9} />
      <rect x={-30} y={-8} width={60} height={46} rx={7} fill={PALETTE.saffron} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={10} r={6} fill={INK} />
      <path d="M0 12 V24" stroke={INK} strokeWidth={5} />
    </g>
  ),
  padlockOpen: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-18 -6 V-20 C -18 -40, 18 -40, 18 -24" fill="none" stroke={INK} strokeWidth={9} transform="translate(0 -12) rotate(-28 -18 -6)" />
      <rect x={-30} y={-8} width={60} height={46} rx={7} fill={PALETTE.turquoise} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={10} r={6} fill={INK} />
      <path d="M0 12 V24" stroke={INK} strokeWidth={5} />
    </g>
  ),
  hotel: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={-28} y={-34} width={56} height={68} fill="#F7F3EA" stroke={INK} strokeWidth={4} />
      {[-22, -8, 6].map((y) => [-18, -4, 10].map((x) => <rect key={`${x}${y}`} x={x} y={y} width={9} height={9} fill={PALETTE.turquoise} />))}
      <rect x={-7} y={20} width={14} height={14} fill={PALETTE.terracotta} />
    </g>
  ),
  guide: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <circle cx={-4} cy={-20} r={11} fill="#F7F3EA" stroke={INK} strokeWidth={4} />
      <path d="M-22 34 C -22 6, 14 6, 14 34 Z" fill={PALETTE.lapis} stroke={INK} strokeWidth={4} />
      <path d="M14 10 L 30 -16" stroke={INK} strokeWidth={4} />
      <path d="M30 -16 L 42 -12 L 30 -6 Z" fill={PALETTE.terracotta} stroke={INK} strokeWidth={3} />
    </g>
  ),
  crowd: (
    <g strokeLinejoin="round" strokeLinecap="round" stroke={INK} strokeWidth={3.5}>
      {[
        [-24, 4, PALETTE.terracotta],
        [0, -2, PALETTE.lapis],
        [24, 4, PALETTE.turquoise],
      ].map(([x, y, c]) => (
        <g key={String(x)} transform={`translate(${x} ${y})`}>
          <circle cy={-14} r={9} fill="#F7F3EA" />
          <path d="M-14 30 C -14 4, 14 4, 14 30 Z" fill={c as string} />
        </g>
      ))}
    </g>
  ),
  mapBlank: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-36 -24 L -12 -32 L 12 -24 L 36 -32 V 24 L 12 32 L -12 24 L -36 32 Z" fill="#F7F3EA" stroke={INK} strokeWidth={4} />
      <path d="M-12 -32 V24 M12 -24 V32" stroke={INK} strokeWidth={3} />
      <text x={0} y={10} textAnchor="middle" fontSize={30} fontWeight={700} fill={PALETTE.questionRed}>?</text>
    </g>
  ),
};

export const SilkIcon: React.FC<{ name: SilkIconName; size?: number; token?: boolean }> = ({ name, size = 56, token = true }) =>
  token ? <Token size={size}>{paths[name]}</Token> : <g transform={`scale(${size / 100})`}>{paths[name]}</g>;

/** The same icon in its own <svg> (for HTML layouts, e.g. inside an <IconCard>). */
export const SilkIconSvg: React.FC<{ name: SilkIconName; size?: number; token?: boolean }> = ({ name, size = 160, token = false }) => (
  <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ overflow: 'visible' }}>
    <SilkIcon name={name} size={size * 0.8} token={token} />
  </svg>
);
