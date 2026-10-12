import {geoGraticule10, geoPath} from 'd3-geo';
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {DATA} from '../data';
import {HEIGHT, MAP_CENTER_Y, WIDTH} from '../lib/constants';
import {FONT, W_EXTRABOLD, W_SEMIBOLD} from '../lib/fonts';
import {borders, getCountry, land, lerpCamera, makeProjection} from '../lib/geo';
import {progress} from '../lib/anim';
import type {Timeline} from '../lib/timeline';

const graticule = geoGraticule10();
const SPHERE = {type: 'Sphere'} as const;

/**
 * Orthographic globe: rotation from the Atlantic to the country, zoom to the
 * coast, then a "dive" (fast zoom + fade) into the first photo.
 */
export const Globe: React.FC<{time: number; tl: Timeline}> = ({time, tl}) => {
  const g = DATA.globe;
  const theme = DATA.theme;
  const target = useMemo(() => getCountry(DATA.place.countryIsoNumeric), []);

  const rot = progress(time, tl.globeStart - 0.2, tl.zoomStart + 0.25, Easing.inOut(Easing.cubic));
  const zoom = progress(time, tl.zoomStart, tl.zoomEnd, Easing.inOut(Easing.cubic));
  let camera = zoom > 0 ? lerpCamera(g.country, g.zoomTo, zoom) : lerpCamera(g.from, g.country, rot);
  // Dive: keep zooming fast while the photo fades in
  const dive = progress(time, tl.diveStart, tl.diveEnd, Easing.in(Easing.cubic));
  if (dive > 0) camera = {...camera, scale: camera.scale * Math.exp(dive * Math.log(5))};
  // Slow push after the zoom (no dead time)
  const settle = progress(time, tl.zoomEnd, tl.diveStart, (x) => x);
  if (dive === 0 && settle > 0) camera = {...camera, scale: camera.scale * (1 + 0.08 * settle)};

  const projection = makeProjection(camera).clipExtent([
    [-40, -40],
    [WIDTH + 40, HEIGHT + 40],
  ]);
  const path = geoPath(projection);
  const r = camera.scale;
  const cx = WIDTH / 2;
  const cy = MAP_CENTER_Y;
  const highlight = progress(time, tl.zoomStart - 0.3, tl.zoomStart + 0.4);
  const graticuleOpacity = 1 - progress(time, tl.zoomStart, tl.zoomStart + 0.8);
  const intro = progress(time, tl.globeStart - 0.25, tl.globeStart + 0.35, Easing.out(Easing.cubic));
  const labels = progress(time, tl.zoomEnd - 0.6, tl.zoomEnd) * (1 - progress(time, tl.pinLand - 0.2, tl.pinLand + 0.2));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 60% at 50% ${(MAP_CENTER_Y / HEIGHT) * 100}%, #14365C 0%, ${theme.navy} 70%)`,
        opacity: intro * (1 - dive),
        filter: dive > 0 ? `blur(${dive * 10}px)` : undefined,
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
        <path d={path(SPHERE) ?? ''} fill="url(#ocean)" />
        {graticuleOpacity > 0 ? (
          <path d={path(graticule) ?? ''} fill="none" stroke="#FFFFFF" strokeOpacity={0.12 * graticuleOpacity} strokeWidth={1} />
        ) : null}
        <path d={path(land) ?? ''} fill="#EAF3F1" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={0.8} />
        <path d={path(borders) ?? ''} fill="none" stroke="#9DB3BF" strokeWidth={1} />
        {target && highlight > 0 ? (
          <path
            d={path(target) ?? ''}
            fill={theme.turquoise}
            fillOpacity={0.85 * highlight}
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeOpacity={highlight}
            filter="url(#glow)"
          />
        ) : null}

        {labels > 0
          ? g.labels.map((l) => {
              const pt = projection([l.lon, l.lat]);
              if (!pt) return null;
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
                  fontSize={sea ? 30 : 34}
                  letterSpacing={sea ? 6 : 8}
                  fill={sea ? '#D6F4FF' : theme.navy}
                  opacity={labels * (sea ? 0.85 : 0.75)}
                >
                  {l.text}
                </text>
              );
            })
          : null}
      </svg>
    </AbsoluteFill>
  );
};
