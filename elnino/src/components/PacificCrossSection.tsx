/**
 * <PacificCrossSection> — side view of the equatorial Pacific, Asia/Australia on the left, South America
 * on the right. Hero visual of Scenes 2–3.
 *
 * Layers (back → front): cold deep water · warm surface layer · thermocline · sea surface · land profiles ·
 * atmosphere (trade winds, rising air + clouds + rain, sinking air) · upwelling arrows off Peru · labels.
 *
 * `elNino` (0 → 1) interpolates everything from the normal state to the El Niño state:
 *   trade winds shrink and flip to weak westerlies · warm water slides east · sea level evens out ·
 *   thermocline flattens · upwelling fades · rising air, clouds and rain migrate east · sinking air moves west.
 * Values slightly above 1 or below 0 are allowed (spring overshoot = the bathtub slosh).
 *
 * `reveal` lets a scene build the diagram up layer by layer (frame each layer fades in).
 * Geometry is exported (`crossSectionGeometry`) so scenes can pin annotations to the surface bulge etc.
 *
 * Schematic: vertical scales are exaggerated (the ~0.5 m sea-level difference is drawn as ~44 px).
 *
 * @example
 * <PacificCrossSection elNino={0} style={{ left: 160, top: 140 }} />
 * // Scene 3 — the slosh, with overshoot:
 * const e = spring({ frame: frame - weakenAt, fps, config: { damping: 9, stiffness: 40, mass: 1.4 } });
 * <PacificCrossSection elNino={e} />
 */
import React, { useId } from 'react';
import { Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { useTheme } from '../../../shared/theme';
import { PALETTE } from '../theme';

export const CS_WIDTH = 1600;
export const CS_HEIGHT = 820;

/** Ocean spans these x (between the two land profiles). */
const X0 = 150;
const X1 = 1450;
const BOTTOM = 800;
const SURFACE = 340;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface CrossSectionGeometry {
  /** Sea-surface y at x. */
  surfaceY: (x: number) => number;
  /** Thermocline y at x. */
  thermoclineY: (x: number) => number;
  /** Centre x of the rising-air column (where the storms are). */
  risingX: number;
  /** Centre x of the sinking-air column. */
  sinkingX: number;
  /** Signed trade-wind strength: +1 = normal easterlies, < 0 = reversed. */
  wind: number;
  x0: number;
  x1: number;
}

export const crossSectionGeometry = (e: number, frame = 0): CrossSectionGeometry => {
  const ec = Math.max(-0.15, Math.min(1.2, e));
  const surfaceY = (x: number) => {
    const u = clamp01((x - X0) / (X1 - X0));
    // Normal: piled up in the west (~30 px ≈ "half a metre", exaggerated). El Niño: west drops, east rises.
    const normal = SURFACE - 44 * Math.pow(1 - u, 1.4);
    const nino = SURFACE - 6 - 10 * u;
    return lerp(normal, nino, ec) + Math.sin(x / 55 + frame / 9) * 2;
  };
  const thermoclineY = (x: number) => {
    const u = clamp01((x - X0) / (X1 - X0));
    const normal = 610 - 230 * Math.pow(u, 1.5);
    const nino = 540 - 50 * u;
    return lerp(normal, nino, ec);
  };
  return {
    surfaceY,
    thermoclineY,
    risingX: lerp(330, 1000, ec),
    sinkingX: lerp(1290, 330, clamp01(ec)),
    wind: 1 - 1.3 * ec,
    x0: X0,
    x1: X1,
  };
};

const CLOUD = 'M -78 26 Q -100 26 -100 6 Q -100 -14 -78 -14 Q -74 -40 -46 -40 Q -24 -40 -16 -22 Q -8 -30 6 -28 Q 26 -24 26 -2 Q 42 0 42 14 Q 42 26 26 26 Z';

export const PacificCrossSection: React.FC<{
  elNino: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  /** Frames at which each layer fades in (omit = visible from the start). */
  reveal?: { ocean?: number; winds?: number; warm?: number; upwelling?: number; atmosphere?: number; labels?: number };
  /** Show the place labels (ASIA · AUSTRALIA / SOUTH AMERICA / PACIFIC OCEAN). Default true. */
  labels?: boolean;
  /** Show the THERMOCLINE label. Default true. */
  thermoclineLabel?: boolean;
  /** Override the signed trade-wind strength (+1 normal easterlies, < 0 reversed). Default follows elNino. */
  wind?: number;
  /** Override where the rising air / storms sit (0 = west, 1 = central Pacific). Default follows elNino. */
  atmosphere?: number;
  /** 0 → 1: wavy evaporation lines rising off the warmest water. */
  evaporation?: number;
}> = ({ elNino, width = CS_WIDTH, height = CS_HEIGHT, style, reveal = {}, labels = true, thermoclineLabel = true, wind, atmosphere, evaporation = 0 }) => {
  const frame = useCurrentFrame();
  const { fonts: F } = useTheme();
  const uid = useId().replace(/:/g, '');
  const g = crossSectionGeometry(elNino, frame);
  const ga = atmosphere === undefined ? g : crossSectionGeometry(atmosphere, frame);
  const ec = clamp01(elNino);
  const fade = (at?: number) => (at === undefined ? 1 : interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }));
  const oOcean = fade(reveal.ocean);
  const oWinds = fade(reveal.winds);
  const oWarm = fade(reveal.warm);
  const oUp = fade(reveal.upwelling) * (1 - ec);
  const oAtmos = fade(reveal.atmosphere);
  const oLabels = fade(reveal.labels);

  // ── ocean polygons ──
  const xs: number[] = [];
  for (let x = X0 - 20; x <= X1 + 20; x += 20) xs.push(x);
  const surfacePts = xs.map((x) => `${x} ${g.surfaceY(x).toFixed(1)}`);
  const thermoPts = xs.map((x) => `${x} ${g.thermoclineY(x).toFixed(1)}`);
  const warmPath = `M ${surfacePts.join(' L ')} L ${[...thermoPts].reverse().join(' L ')} Z`;
  const deepPath = `M ${thermoPts.join(' L ')} L ${X1 + 20} ${BOTTOM} L ${X0 - 20} ${BOTTOM} Z`;
  const surfaceLine = `M ${surfacePts.join(' L ')}`;
  const thermoLine = `M ${thermoPts.join(' L ')}`;

  // Warm layer colour: hot in the west only (normal) → hot all the way east (El Niño).
  const stop = (n: string, nino: string) => interpolateColors(ec, [0, 1], [n, nino]);
  const warmStops = [
    { o: 0, c: stop(PALETTE.warm, '#EE8A62') },
    { o: 0.45, c: stop('#EE8A62', PALETTE.warm) },
    { o: 0.75, c: stop('#E9C9AE', PALETTE.warm) },
    { o: 1, c: stop('#A9D0DE', '#EE7650') },
  ];

  // ── trade winds ── (signed strength → arrow length and direction)
  const w = wind ?? g.wind;
  const windLen = 150 * Math.min(1, Math.abs(w));
  const windDir = w >= 0 ? -1 : 1; // easterlies blow toward −x (west)
  const windO = oWinds * Math.min(1, Math.abs(w) * 2.5);
  const windY = 262;
  const flow = (frame * 6 * Math.sign(w || 1)) % 40;

  // ── atmosphere ── rising air + clouds + rain over the warmest water, sinking air elsewhere
  const rx = ga.risingX;
  const sx = ga.sinkingX;
  // Evaporation rises off the warmest water (follows the ocean, not the storms).
  const ex = g.risingX;
  const rain = Array.from({ length: 9 }, (_, i) => {
    const dx = -80 + i * 20;
    const y = 150 + ((frame * 5 + i * 23) % 120);
    const o = interpolate(y, [150, 165, 250, 270], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return { x: rx + dx, y, o };
  });

  const upwell = [0, 1, 2].map((i) => {
    const bx = 1180 + i * 70;
    const d = `M ${bx} ${700 - i * 10} C ${bx + 30} ${600} ${bx + 120} ${560 - i * 20} ${bx + 150} ${g.surfaceY(bx + 150) + 30}`;
    return { d, i };
  });

  const ink = '#F2EEE6';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${CS_WIDTH} ${CS_HEIGHT}`} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id={`${uid}-warm`} x1={X0} x2={X1} y1={0} y2={0} gradientUnits="userSpaceOnUse">
          {warmStops.map((s) => (
            <stop key={s.o} offset={s.o} stopColor={s.c} />
          ))}
        </linearGradient>
        <linearGradient id={`${uid}-deep`} x1={0} x2={0} y1={380} y2={BOTTOM} gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor="#4F9DBE" />
          <stop offset={1} stopColor="#1C4E6E" />
        </linearGradient>
        <marker id={`${uid}-head`} viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
        <marker id={`${uid}-headCool`} viewBox="0 0 10 10" refX={6} refY={5} markerWidth={4} markerHeight={4} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#BFE3F0" />
        </marker>
      </defs>

      {/* ── ocean ── */}
      <g opacity={oOcean}>
        <path d={deepPath} fill={`url(#${uid}-deep)`} />
        <path d={warmPath} fill={`url(#${uid}-warm)`} opacity={oWarm} />
        {oWarm < 1 && <path d={warmPath} fill="#4F9DBE" opacity={1 - oWarm} />}
      </g>
      <g opacity={oOcean}>
        <path d={thermoLine} fill="none" stroke={ink} strokeWidth={3} strokeDasharray="14 10" opacity={0.85 * oWarm} />
        <path d={surfaceLine} fill="none" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
        {thermoclineLabel && (
          <text x={X0 + 560} y={g.thermoclineY(X0 + 560) + 34} fontFamily={F.mono} fontSize={22} letterSpacing={2} fill={ink} opacity={0.85 * oWarm * oLabels}>
            THERMOCLINE
          </text>
        )}
      </g>

      {/* ── upwelling off Peru ── */}
      <g opacity={oUp * oOcean}>
        {upwell.map(({ d, i }) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#BFE3F0"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="22 14"
            strokeDashoffset={-((frame * 2 + i * 12) % 36)}
            markerEnd={`url(#${uid}-headCool)`}
          />
        ))}
      </g>

      {/* ── land profiles ── */}
      <g opacity={oOcean}>
        <path
          d={`M 0 ${SURFACE - 60} L 60 ${SURFACE - 80} L 120 ${SURFACE - 52} L ${X0 + 10} ${SURFACE - 34} L ${X0 + 40} ${SURFACE + 60} L ${X0 + 20} ${BOTTOM - 120} L ${X0 + 60} ${BOTTOM - 40} L ${X0 + 160} ${BOTTOM} L 0 ${BOTTOM} Z`}
          fill="#B49A6E"
          stroke="#1A1A1A"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d={`M ${CS_WIDTH} ${SURFACE - 260} L ${X1 + 110} ${SURFACE - 240} L ${X1 + 70} ${SURFACE - 120} L ${X1 + 30} ${SURFACE - 26} L ${X1 - 10} ${SURFACE + 40} L ${X1 - 60} ${BOTTOM - 140} L ${X1 - 200} ${BOTTOM} L ${CS_WIDTH} ${BOTTOM} Z`}
          fill="#B49A6E"
          stroke="#1A1A1A"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* sea floor */}
        <path d={`M ${X0 + 160} ${BOTTOM} Q 500 ${BOTTOM - 26} 800 ${BOTTOM - 8} T ${X1 - 200} ${BOTTOM}`} fill="#7E6A48" opacity={0.6} />
      </g>

      {/* ── evaporation ── */}
      {evaporation > 0 && (
        <g opacity={Math.min(1, evaporation)}>
          {[-150, -90, -30, 30, 90, 150].map((dx, i) => {
            const x = ex + dx;
            const base = g.surfaceY(x) - 12;
            const rise = (frame * 1.6 + i * 23) % 90;
            const y0 = base - rise;
            const o = interpolate(rise, [0, 15, 70, 90], [0, 0.9, 0.9, 0]);
            return (
              <path
                key={i}
                d={`M ${x} ${y0} q 10 -12 0 -24 q -10 -12 0 -24`}
                fill="none"
                stroke="#F2EEE6"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={o}
              />
            );
          })}
        </g>
      )}

      {/* ── atmosphere ── */}
      <g opacity={oAtmos}>
        {/* rising air */}
        {[-46, 0, 46].map((dx, i) => (
          <line
            key={`r${i}`}
            x1={rx + dx}
            y1={g.surfaceY(rx + dx) - 30}
            x2={rx + dx}
            y2={130}
            stroke={ink}
            strokeWidth={5}
            strokeDasharray="16 12"
            strokeDashoffset={(frame * 2 + i * 9) % 28}
            markerEnd={`url(#${uid}-head)`}
            opacity={0.75}
          />
        ))}
        {/* clouds + rain */}
        {rain.map((r, i) => (
          <line key={`d${i}`} x1={r.x} y1={r.y} x2={r.x - 6} y2={r.y + 18} stroke="#9FD3E6" strokeWidth={4} strokeLinecap="round" opacity={r.o} />
        ))}
        <g transform={`translate(${rx + 20} 108) scale(1.25)`}>
          <path d={CLOUD} fill="#FBFAF6" stroke="#1A1A1A" strokeWidth={3} strokeLinejoin="round" />
        </g>
        <g transform={`translate(${rx - 70} 128) scale(0.9)`}>
          <path d={CLOUD} fill="#FBFAF6" stroke="#1A1A1A" strokeWidth={3} strokeLinejoin="round" />
        </g>
        {/* sinking (dry) air */}
        {[-30, 30].map((dx, i) => (
          <line
            key={`s${i}`}
            x1={sx + dx}
            y1={110}
            x2={sx + dx}
            y2={g.surfaceY(sx + dx) - 70}
            stroke={ink}
            strokeWidth={4}
            strokeDasharray="10 14"
            strokeDashoffset={-((frame * 2 + i * 9) % 24)}
            markerEnd={`url(#${uid}-head)`}
            opacity={0.45}
          />
        ))}
      </g>

      {/* ── trade winds ── */}
      <g opacity={windO}>
        {[470, 760, 1050].map((cx, i) => {
          const a = cx - (windLen / 2) * windDir;
          const b = cx + (windLen / 2) * windDir;
          return (
            <g key={i}>
              <line x1={a} y1={windY + i * 6} x2={b} y2={windY + i * 6} stroke={ink} strokeWidth={9} strokeLinecap="round" markerEnd={`url(#${uid}-head)`} />
              <line x1={a} y1={windY + i * 6} x2={b} y2={windY + i * 6} stroke={PALETTE.navy} strokeWidth={3} strokeDasharray="6 34" strokeDashoffset={flow} opacity={0.6} />
            </g>
          );
        })}
        <text x={760} y={windY - 34} textAnchor="middle" fontFamily={F.mono} fontSize={24} letterSpacing={3} fill={ink}>
          {w >= 0 ? 'TRADE WINDS' : 'WINDS REVERSE'}
        </text>
      </g>

      {/* ── place labels ── */}
      {labels && (
        <g opacity={oLabels} fontFamily={F.mono} fontSize={22} letterSpacing={2} fill="#1A1A1A">
          <text x={20} y={SURFACE - 96} fill={ink}>ASIA · AUSTRALIA</text>
          <text x={CS_WIDTH - 20} y={SURFACE - 280} textAnchor="end" fill={ink}>SOUTH AMERICA</text>
          <text x={800} y={BOTTOM - 40} textAnchor="middle" fill={ink} opacity={0.85}>PACIFIC OCEAN · EQUATOR</text>
        </g>
      )}
    </svg>
  );
};
