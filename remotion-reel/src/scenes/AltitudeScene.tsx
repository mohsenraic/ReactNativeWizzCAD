import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {ALTITUDE, COLORS, PHOTOS, SAFE_ZONE, SCENES, VIDEO} from '../config';
import {AnimatedWords} from '../components/AnimatedWords';
import {Background} from '../components/Background';
import {PhotoPanel} from '../components/PhotoPanel';
import {bodyFont, displayFont} from '../lib/fonts';
import {formatNumber} from '../lib/text';
import {POP_SPRING, progress, springAt, useSceneTime} from '../lib/time';

const CHART = {left: 150, right: VIDEO.width - 60, top: 720, bottom: 1080};

const altToY = (alt: number) =>
  CHART.bottom - (alt / ALTITUDE.maxAltitude) * (CHART.bottom - CHART.top);
const xToPx = (x: number) => CHART.left + x * (CHART.right - CHART.left);

/** Courbe lissée (Catmull-Rom -> Bézier) passant par tous les points */
const smoothPath = (pts: [number, number][]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const k = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/** Point de la courbe le plus proche d'une abscisse + fraction de longueur correspondante */
const pointAtX = (d: string, targetX: number) => {
  const len = getLength(d);
  let best = {x: 0, y: 0, frac: 0, dist: Infinity};
  for (let i = 0; i <= 400; i++) {
    const l = (i / 400) * len;
    const p = getPointAtLength(d, l);
    if (!p) continue;
    const dist = Math.abs(p.x - targetX);
    if (dist < best.dist) best = {x: p.x, y: p.y, frac: i / 400, dist};
  }
  return best;
};

/** Scène 4 — Profil de montagne + compteur d'altitude */
export const AltitudeScene: React.FC = () => {
  const {t} = useSceneTime();

  const {line, area, village, peak} = useMemo(() => {
    const pts = ALTITUDE.profile.map(([x, a]) => [xToPx(x), altToY(a)] as [number, number]);
    const d = smoothPath(pts);
    return {
      line: d,
      area: `${d} L ${CHART.right} ${CHART.bottom} L ${CHART.left} ${CHART.bottom} Z`,
      village: pointAtX(d, xToPx(ALTITUDE.village.x)),
      peak: ALTITUDE.peak ? pointAtX(d, xToPx(ALTITUDE.peak.x)) : null,
    };
  }, []);

  const draw = progress(t, ALTITUDE.drawStart, ALTITUDE.drawEnd, Easing.inOut(Easing.cubic));
  const evolved = evolvePath(draw, line);
  const counter = progress(t, ALTITUDE.counterStart, ALTITUDE.counterEnd, Easing.out(Easing.cubic));
  const counterIn = springAt(t, ALTITUDE.counterStart - 0.2);
  const done = springAt(t, ALTITUDE.counterEnd, POP_SPRING);
  const grid = progress(t, 0, 0.8);
  const villageIn = draw >= village.frac ? springAt(t, ALTITUDE.drawStart + village.frac * (ALTITUDE.drawEnd - ALTITUDE.drawStart), POP_SPRING) : 0;
  const peakIn =
    peak && draw >= peak.frac
      ? springAt(t, ALTITUDE.drawStart + peak.frac * (ALTITUDE.drawEnd - ALTITUDE.drawStart))
      : 0;
  const goldTick = ALTITUDE.ticks.reduce(
    (best, v) => (Math.abs(v - ALTITUDE.value) < Math.abs(best - ALTITUDE.value) ? v : best),
    ALTITUDE.ticks[0],
  );
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);

  return (
    <AbsoluteFill>
      {PHOTOS.altitude ? (
        <PhotoPanel
          src={PHOTOS.altitude.src}
          kenBurns={PHOTOS.altitude.kenBurns}
          progress={progress(t, -0.3, SCENES.altitude.end - SCENES.altitude.start + 0.3, (x) => x)}
          centerY={(CHART.top + CHART.bottom) / 2 - 10}
          height={700}
          darken={0.15 + 0.3 * draw}
        />
      ) : (
        <Background stars time={t} glowY={900} />
      )}

      {/* Compteur */}
      <div
        style={{
          position: 'absolute',
          top: SAFE_ZONE.top + 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: displayFont,
          fontWeight: 900,
          color: COLORS.accent,
          opacity: counterIn,
          transform: `translateY(${interpolate(counterIn, [0, 1], [30, 0])}px) scale(${interpolate(done, [0, 0.5, 1], [1, 1.06, 1])})`,
          textShadow: '0 0 60px rgba(245,184,65,0.35)',
          letterSpacing: -4,
        }}
      >
        <span style={{fontSize: 190}}>
          {ALTITUDE.prefix}
          {formatNumber(counter * ALTITUDE.value)}
        </span>
        <span style={{fontSize: 96, marginLeft: 12, letterSpacing: -1}}>{ALTITUDE.suffix}</span>
      </div>

      {/* Titre */}
      <AbsoluteFill style={{top: 500, alignItems: 'center'}}>
        <AnimatedWords
          text={ALTITUDE.title}
          accentWords={ALTITUDE.accentWords}
          time={t}
          startAt={0.7}
          interval={0.09}
          fontSize={52}
          fontWeight={800}
          maxWidth={860}
        />
      </AbsoluteFill>

      {/* Graphique */}
      <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1={CHART.top} x2="0" y2={CHART.bottom} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F7FC0" stopOpacity={0.55} />
            <stop offset="100%" stopColor={COLORS.background} stopOpacity={0.1} />
          </linearGradient>
          <clipPath id="reveal">
            <rect x={0} y={0} width={CHART.left + draw * (CHART.right - CHART.left) + 2} height={VIDEO.height} />
          </clipPath>
          <filter id="lineGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Graduations */}
        {ALTITUDE.ticks.map((v) => {
          const y = altToY(v);
          const gold = v === goldTick && counter > 0.98;
          return (
            <g key={v} opacity={grid}>
              <line
                x1={CHART.left}
                x2={CHART.right}
                y1={y}
                y2={y}
                stroke={gold ? COLORS.accent : COLORS.border}
                strokeOpacity={gold ? 0.7 : 0.18}
                strokeDasharray="4 10"
                strokeWidth={gold ? 2 : 1}
              />
              <text
                x={CHART.left - 16}
                y={y + 8}
                textAnchor="end"
                fontFamily={bodyFont}
                fontWeight={600}
                fontSize={22}
                fill={gold ? COLORS.accent : COLORS.textMuted}
              >
                {formatNumber(v)} m
              </text>
            </g>
          );
        })}
        <line x1={CHART.left} x2={CHART.right} y1={CHART.bottom} y2={CHART.bottom} stroke={COLORS.border} strokeOpacity={0.3 * grid} />

        {/* Relief */}
        <path d={area} fill="url(#areaFill)" clipPath="url(#reveal)" />
        <path
          d={line}
          fill="none"
          stroke={COLORS.borderHighlight}
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          filter="url(#lineGlow)"
        />

        {/* Sommet */}
        {peak && ALTITUDE.peak && peakIn > 0 ? (
          <g transform={`translate(${peak.x}, ${peak.y})`} opacity={peakIn}>
            <path d="M -9 -14 L 0 -28 L 9 -14 Z" fill={COLORS.textMuted} />
            <text
              x={0}
              y={-42}
              textAnchor="middle"
              fontFamily={bodyFont}
              fontWeight={700}
              fontSize={22}
              letterSpacing={3}
              fill={COLORS.textMuted}
            >
              {ALTITUDE.peak.label}
            </text>
          </g>
        ) : null}

        {/* Village */}
        {villageIn > 0 ? (
          <g transform={`translate(${village.x}, ${village.y})`}>
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={CHART.bottom - village.y}
              stroke={COLORS.accent}
              strokeOpacity={0.5 * villageIn}
              strokeDasharray="3 6"
              strokeWidth={2}
            />
            <circle r={10 + 18 * pulse} fill="none" stroke={COLORS.accent} strokeOpacity={0.45 * (1 - pulse) * villageIn} strokeWidth={2} />
            <circle r={10 * villageIn} fill={COLORS.accent} />
            <g opacity={villageIn} transform={`translate(0, ${interpolate(villageIn, [0, 1], [-30, -50])})`}>
              <rect x={-130} y={-40} width={260} height={52} rx={14} fill="rgba(11,20,38,0.8)" stroke={COLORS.accent} strokeOpacity={0.6} />
              <text textAnchor="middle" y={-6} fontFamily={displayFont} fontWeight={800} fontSize={24} letterSpacing={2} fill={COLORS.accent}>
                {ALTITUDE.village.label}
              </text>
            </g>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
