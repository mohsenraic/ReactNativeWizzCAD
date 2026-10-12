import {geoGraticule10, geoPath, GeoProjection} from 'd3-geo';
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {DATA} from '../data';
import {HEIGHT, MAP_CENTER_Y, WIDTH} from '../lib/constants';
import {FONT, W_EXTRABOLD, W_SEMIBOLD} from '../lib/fonts';
import {borders, getCountry, getRegionalLayers, land, makeProjection} from '../lib/geo';
import {cameraAt} from '../lib/camera';
import {progress} from '../lib/anim';
import type {Timeline} from '../lib/timeline';

const graticule = geoGraticule10();
const SPHERE = {type: 'Sphere'} as const;
/** Above this scale, the regional 10m data replaces the 50m world */
const DETAIL_SCALE = 6000;

/** Map projection at time t (shared with the pin) */
export const projectionAt = (t: number, tl: Timeline): GeoProjection =>
  makeProjection(cameraAt(t, tl)).clipExtent([
    [-40, -40],
    [WIDTH + 40, HEIGHT + 40],
  ]);

/** Screen position of the place at time t */
export const placeOnScreen = (t: number, tl: Timeline) =>
  projectionAt(t, tl)([DATA.place.lon, DATA.place.lat]) ?? [WIDTH / 2, MAP_CENTER_Y];

/** Radius of the iris that reveals the first photo */
export const irisRadius = (t: number, tl: Timeline) =>
  progress(t, tl.revealAt, tl.revealEnd, Easing.in(Easing.quad)) * 1500;

/**
 * Orthographic globe, then a detailed map of the coast that follows the
 * voice. The first photo is revealed through an iris opening on the pin.
 */
export const Globe: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  const g = DATA.globe;
  const theme = DATA.theme;
  const target = useMemo(() => getCountry(DATA.place.countryIsoNumeric), []);
  const regional = useMemo(() => getRegionalLayers(DATA.place.lon, DATA.place.lat), []);
  const detailPoly = useMemo(
    () => (g.detail ? regional.polygonAt(g.detail.lon, g.detail.lat) : null),
    [g.detail, regional],
  );
  const targetRegional = useMemo(() => regional.polygonAt(DATA.place.lon, DATA.place.lat), [regional]);

  const camera = cameraAt(time, tl);
  const projection = projectionAt(time, tl);
  const path = geoPath(projection);
  const detailed = camera.scale > DETAIL_SCALE;
  const r = camera.scale;
  const cx = WIDTH / 2;
  const cy = MAP_CENTER_Y;
  const highlight = progress(time, tl.zoomStart - 0.3, tl.zoomStart + 0.4);
  const graticuleOpacity = 1 - progress(time, tl.zoomStart, tl.zoomStart + 0.8);
  const intro = progress(time, tl.globeStart - 0.25, tl.globeStart + 0.35, Easing.out(Easing.cubic));
  const mapLabelsOut = 1 - progress(time, tl.zoomInStart, tl.zoomInStart + 0.4);

  // Iris: transparent hole growing from the pin
  const [px, py] = placeOnScreen(time, tl);
  const iris = irisRadius(time, tl);
  const mask =
    iris > 0
      ? `radial-gradient(circle at ${px}px ${py}px, transparent ${iris}px, #000 ${iris + 2}px)`
      : undefined;

  // Detail (e.g. Corfu): dashed line from the place + label
  const detail = g.detail && tl.detailAt !== null ? g.detail : null;
  const detailP = detail ? progress(time, tl.detailAt! - 0.2, tl.detailAt! + 0.8) : 0;
  const detailOut = mapLabelsOut;
  const dPt = detail ? projection([detail.lon, detail.lat]) : null;
  const pPt = projection([DATA.place.lon, DATA.place.lat]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% ${(MAP_CENTER_Y / HEIGHT) * 100}%, #14365C 0%, ${theme.navy} 70%)`,
        opacity: intro,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <svg width={WIDTH} height={HEIGHT}>
        <defs>
          <radialGradient id="ocean" cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 1.35} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3FA9E6" />
            <stop offset="55%" stopColor="#1468B0" />
            <stop offset="100%" stopColor="#0A3566" />
          </radialGradient>
          <radialGradient id="atmo" cx={cx} cy={cy} r={r * 1.2} gradientUnits="userSpaceOnUse">
            <stop offset="80%" stopColor={theme.turquoise} stopOpacity={0} />
            <stop offset="85%" stopColor={theme.turquoise} stopOpacity={0.45} />
            <stop offset="100%" stopColor={theme.turquoise} stopOpacity={0} />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {r < 3000 ? <circle cx={cx} cy={cy} r={r * 1.2} fill="url(#atmo)" /> : null}
        {detailed ? (
          <rect width={WIDTH} height={HEIGHT} fill="#1E78BE" />
        ) : (
          <path d={path(SPHERE) ?? ''} fill="url(#ocean)" />
        )}
        {graticuleOpacity > 0 && !detailed ? (
          <path d={path(graticule) ?? ''} fill="none" stroke="#FFFFFF" strokeOpacity={0.12 * graticuleOpacity} strokeWidth={1} />
        ) : null}

        <path
          d={path(detailed ? regional.land : land) ?? ''}
          fill="#EAF3F1"
          stroke="#FFFFFF"
          strokeOpacity={0.6}
          strokeWidth={detailed ? 1.5 : 0.8}
        />
        <path d={path(detailed ? regional.borders : borders) ?? ''} fill="none" stroke="#9DB3BF" strokeWidth={detailed ? 2 : 1} />

        {/* Country highlight */}
        {highlight > 0 ? (
          <path
            d={path((detailed && targetRegional ? targetRegional : target) ?? SPHERE) ?? ''}
            fill={theme.turquoise}
            fillOpacity={0.85 * highlight}
            stroke="#FFFFFF"
            strokeWidth={detailed ? 3 : 2.5}
            strokeOpacity={highlight}
            filter="url(#glow)"
          />
        ) : null}

        {/* Detail: island highlight + dashed link from the place */}
        {detail && detailP > 0 && detailOut > 0 ? (
          <g opacity={detailOut}>
            {detailPoly ? (
              <path
                d={path(detailPoly) ?? ''}
                fill={theme.sand}
                fillOpacity={0.9 * detailP}
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeOpacity={detailP}
              />
            ) : null}
            {dPt && pPt ? (
              <>
                <line
                  x1={pPt[0]}
                  y1={pPt[1]}
                  x2={pPt[0] + (dPt[0] - pPt[0]) * detailP}
                  y2={pPt[1] + (dPt[1] - pPt[1]) * detailP}
                  stroke={theme.navy}
                  strokeWidth={5}
                  strokeDasharray="14 12"
                  strokeLinecap="round"
                />
                <g opacity={progress(time, tl.detailAt! + 0.4, tl.detailAt! + 0.8)}>
                  <rect x={dPt[0] - 150} y={dPt[1] + 18} width={300} height={70} rx={35} fill={theme.navy} opacity={0.85} />
                  <text
                    x={dPt[0]}
                    y={dPt[1] + 66}
                    textAnchor="middle"
                    fontFamily={FONT}
                    fontWeight={W_EXTRABOLD}
                    fontSize={38}
                    letterSpacing={3}
                    fill={theme.white}
                  >
                    {detail.label}
                  </text>
                </g>
              </>
            ) : null}
          </g>
        ) : null}

        {/* Region labels, each on its own phrase */}
        {g.labels.map((l, i) => {
          const pt = projection([l.lon, l.lat]);
          if (!pt) return null;
          const appear = tl.labelTimes[i];
          // labels shown before the pin give way to the pin label
          const out = appear < tl.pinLand ? 1 - progress(time, tl.pinLand - 0.2, tl.pinLand + 0.2) : mapLabelsOut;
          const o = progress(time, appear, appear + 0.4) * out;
          if (o <= 0) return null;
          const sea = /sea|ocean/i.test(l.text);
          return (
            <text
              key={l.text}
              x={pt[0]}
              y={pt[1]}
              textAnchor="middle"
              fontFamily={FONT}
              fontWeight={sea ? W_SEMIBOLD : W_EXTRABOLD}
              fontStyle={sea ? 'italic' : 'normal'}
              fontSize={sea ? 40 : 34}
              letterSpacing={sea ? 8 : 8}
              fill={sea ? '#FFFFFF' : theme.navy}
              opacity={o * (sea ? 0.95 : 0.75)}
              style={{textShadow: sea ? '0 2px 10px rgba(10,26,47,0.5)' : undefined}}
            >
              {l.text}
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
