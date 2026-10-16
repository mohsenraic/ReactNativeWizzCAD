/**
 * commodityIcons.tsx — hand-inked commodity icons for <CommodityCards> (200×200 box, `t` = frames since
 * the card landed). Topic-specific, so they live with the El Niño video rather than in shared/.
 */
import React from 'react';
import { interpolate } from 'remotion';
import type { Commodity } from '../data/elnino';
import { PALETTE } from '../theme';

const ink = { fill: 'none', stroke: PALETTE.ink, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const CommodityIcon: React.FC<{ id: Commodity['id']; t: number; size?: number }> = ({ id, t, size = 200 }) => {
  const T = Math.max(0, t);
  const bob = Math.sin(T / 9) * 3;
  let body: React.ReactNode;
  switch (id) {
    case 'cocoa':
      body = (
        <g transform={`rotate(${-18 + bob} 100 100)`}>
          <path d="M 100 30 C 150 40 158 140 100 172 C 42 140 50 40 100 30 Z" fill="#B5652B" stroke={PALETTE.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 100 36 L 100 166 M 78 46 C 66 90 70 130 86 158 M 122 46 C 134 90 130 130 114 158" {...ink} strokeWidth={3.5} />
          <path d="M 100 30 L 100 14" {...ink} />
        </g>
      );
      break;
    case 'coffee': {
      const steam = (dx: number, ph: number) => `M ${100 + dx} 64 C ${88 + dx} ${52 - Math.sin(T / 7 + ph) * 4} ${112 + dx} 40 ${100 + dx} ${26}`;
      body = (
        <>
          <path d={steam(-18, 0)} {...ink} strokeWidth={4} opacity={0.7} />
          <path d={steam(12, 1.7)} {...ink} strokeWidth={4} opacity={0.7} />
          <path d="M 44 78 L 140 78 L 132 160 Q 130 172 118 172 L 66 172 Q 54 172 52 160 Z" fill="#FBFAF6" {...{ stroke: PALETTE.ink, strokeWidth: 6, strokeLinejoin: 'round' }} />
          <path d="M 140 94 Q 172 94 168 120 Q 164 144 136 140" {...ink} />
          <ellipse cx={92} cy={84} rx={44} ry={6} fill="#5A3A22" />
        </>
      );
      break;
    }
    case 'palmOil':
      body = (
        <>
          {[[72, 104], [100, 88], [128, 104], [86, 128], [114, 128], [100, 112]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={20} fill={i % 2 ? '#C8461E' : '#E07B2E'} stroke={PALETTE.ink} strokeWidth={4} />
          ))}
          <path d={`M 150 ${120 + bob} C 166 146 170 160 158 170 C 146 178 134 168 140 154 C 144 144 148 134 150 ${120 + bob} Z`} fill={PALETTE.highlighter} stroke={PALETTE.ink} strokeWidth={4} />
          <path d="M 100 70 L 100 40 M 100 52 L 76 36 M 100 52 L 124 36" {...ink} stroke="#4E6B2E" />
        </>
      );
      break;
    case 'rice':
      body = (
        <>
          <path d="M 34 110 L 166 110 Q 160 168 100 170 Q 40 168 34 110 Z" fill="#FBFAF6" {...{ stroke: PALETTE.ink, strokeWidth: 6, strokeLinejoin: 'round' }} />
          <path d="M 40 110 Q 100 66 160 110 Z" fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse key={i} cx={66 + (i % 5) * 17} cy={98 - Math.floor(i / 5) * 12} rx={6} ry={3} transform={`rotate(${(i * 37) % 60 - 30} ${66 + (i % 5) * 17} ${98 - Math.floor(i / 5) * 12})`} fill="#EDE6D2" stroke={PALETTE.ink} strokeWidth={1.5} />
          ))}
          <path d="M 120 64 L 150 30 M 128 66 L 164 40" {...ink} strokeWidth={5} />
        </>
      );
      break;
    case 'sugar':
      body = (
        <>
          {[[58, 112], [104, 112], [80, 70]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M ${x} ${y} l 36 -12 l 0 40 l -36 12 z`} fill="#FFFFFF" stroke={PALETTE.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M ${x} ${y} l -28 -12 l 0 40 l 28 12 z`} fill="#EDE6D2" stroke={PALETTE.ink} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M ${x} ${y} l -28 -12 l 36 -12 l 28 12 z`} fill="#FBFAF6" stroke={PALETTE.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          ))}
        </>
      );
      break;
    default: {
      const swim = interpolate(Math.sin(T / 5), [-1, 1], [-6, 6]);
      body = (
        <g transform={`translate(0 ${bob})`}>
          <path d={`M 40 100 Q 90 62 140 96 Q 90 136 40 100 Z`} fill="#9DB7C4" stroke={PALETTE.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M 140 96 L 172 ${74 + swim} L 166 100 L 172 ${126 - swim} Z`} fill="#9DB7C4" stroke={PALETTE.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={62} cy={94} r={4} fill={PALETTE.ink} />
          <path d="M 70 112 Q 100 120 128 104" fill="none" stroke="#FBFAF6" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      {body}
    </svg>
  );
};
